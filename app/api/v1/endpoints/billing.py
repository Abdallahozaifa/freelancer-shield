"""Billing API endpoints for Stripe integration."""
import os
import stripe
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.subscription import Subscription, PlanType, SubscriptionStatus
from app.models.project import Project
from app.models.client import Client
from app.models.enums import ProjectStatus
from app.schemas.billing import (
    SubscriptionResponse,
    CreateCheckoutRequest,
    CreateCheckoutResponse,
    CreatePortalRequest,
    CreatePortalResponse,
    PlanLimits,
)
from app.services.stripe_service import StripeService

# Load environment variables
load_dotenv()

router = APIRouter()


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get current user's subscription details."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()

    # If no subscription exists, create a free one
    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan=PlanType.FREE,
            status=SubscriptionStatus.ACTIVE,
        )
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)

    # Get current usage - only count ACTIVE projects (use string value for comparison)
    projects_result = await db.execute(
        select(func.count(Project.id)).where(
            and_(
                Project.user_id == current_user.id,
                Project.status == "active",  # Use string value
            )
        )
    )
    current_projects = projects_result.scalar() or 0
    
    clients_result = await db.execute(
        select(func.count(Client.id)).where(Client.user_id == current_user.id)
    )
    current_clients = clients_result.scalar() or 0

    return SubscriptionResponse(
        plan=subscription.plan,
        status=subscription.status,
        is_pro=subscription.is_pro,
        current_period_end=subscription.current_period_end,
        cancel_at_period_end=subscription.cancel_at_period_end or False,
        max_projects=subscription.max_projects,
        max_clients=subscription.max_clients,
        current_projects=current_projects,
        current_clients=current_clients,
    )


@router.get("/limits", response_model=PlanLimits)
async def get_plan_limits(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get current plan limits and usage."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan=PlanType.FREE,
            status=SubscriptionStatus.ACTIVE,
        )
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)

    # Only count ACTIVE projects (use string value for comparison)
    projects_result = await db.execute(
        select(func.count(Project.id)).where(
            and_(
                Project.user_id == current_user.id,
                Project.status == "active",  # Use string value
            )
        )
    )
    current_projects = projects_result.scalar() or 0
    
    clients_result = await db.execute(
        select(func.count(Client.id)).where(Client.user_id == current_user.id)
    )
    current_clients = clients_result.scalar() or 0

    return PlanLimits(
        plan=subscription.plan,
        max_projects=subscription.max_projects,
        max_clients=subscription.max_clients,
        current_projects=current_projects,
        current_clients=current_clients,
        can_create_project=current_projects < subscription.max_projects,
        can_create_client=current_clients < subscription.max_clients,
    )


@router.post("/create-checkout-session", response_model=CreateCheckoutResponse)
async def create_checkout_session(
    request: CreateCheckoutRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a Stripe Checkout session for Pro subscription."""
    try:
        checkout_url = await StripeService.create_checkout_session(
            db=db,
            user=current_user,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )
        return CreateCheckoutResponse(checkout_url=checkout_url)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


@router.post("/create-portal-session", response_model=CreatePortalResponse)
async def create_portal_session(
    request: CreatePortalRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a Stripe Customer Portal session for managing subscription."""
    try:
        portal_url = await StripeService.create_portal_session(
            db=db,
            user=current_user,
            return_url=request.return_url,
        )
        return CreatePortalResponse(portal_url=portal_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create portal session: {str(e)}")


@router.post("/cancel")
async def cancel_subscription(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Cancel subscription at end of billing period."""
    success = await StripeService.cancel_subscription(db, current_user)
    if not success:
        raise HTTPException(status_code=400, detail="No active subscription to cancel")
    return {"message": "Subscription will be canceled at end of billing period"}


@router.post("/reactivate")
async def reactivate_subscription(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Reactivate a canceled subscription before it expires."""
    success = await StripeService.reactivate_subscription(db, current_user)
    if not success:
        raise HTTPException(status_code=400, detail="No subscription to reactivate")
    return {"message": "Subscription reactivated"}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
):
    """Handle Stripe webhook events."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info("=" * 50)
    logger.info("STRIPE WEBHOOK RECEIVED")
    logger.info("=" * 50)
    
    payload = await request.body()
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    logger.info(f"Signature header present: {bool(stripe_signature)}")
    logger.info(f"Payload length: {len(payload)} bytes")
    logger.info(f"Webhook secret configured: {bool(webhook_secret)}")
    if webhook_secret:
        logger.info(f"Secret starts with: {webhook_secret[:10]}...")
    
    try:
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            webhook_secret,
        )
        event_type = event.get("type")
        event_id = event.get("id")
        logger.info(f"Webhook event verified: {event_type} (id: {event_id})")
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        logger.error(f"Expected secret: {webhook_secret[:10] if webhook_secret else 'NONE'}...")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    event_type = event["type"]
    event_data = event["data"]["object"]
    
    logger.info(f"Processing event: {event_type}")
    logger.info(f"Event data keys: {list(event_data.keys())}")

    try:
        if event_type == "checkout.session.completed":
            logger.info("=" * 30)
            logger.info("HANDLING checkout.session.completed")
            logger.info("=" * 30)
            logger.info(f"Session ID: {event_data.get('id')}")
            logger.info(f"Customer ID: {event_data.get('customer')}")
            logger.info(f"Subscription ID: {event_data.get('subscription')}")
            logger.info(f"Metadata: {event_data.get('metadata')}")
            logger.info(f"Success URL: {event_data.get('success_url')}")
            
            await StripeService.handle_checkout_completed(db, event_data)
            logger.info("✓ Successfully handled checkout.session.completed")
        
        elif event_type == "customer.subscription.updated":
            logger.info("Handling customer.subscription.updated")
            logger.info(f"Subscription ID: {event_data.get('id')}")
            logger.info(f"Status: {event_data.get('status')}")
            await StripeService.handle_subscription_updated(db, event_data)
            logger.info("✓ Successfully handled customer.subscription.updated")
        
        elif event_type == "customer.subscription.deleted":
            logger.info("Handling customer.subscription.deleted")
            await StripeService.handle_subscription_deleted(db, event_data)
            logger.info("✓ Successfully handled customer.subscription.deleted")
        
        elif event_type == "invoice.payment_failed":
            logger.info("Handling invoice.payment_failed")
            await StripeService.handle_invoice_payment_failed(db, event_data)
            logger.info("✓ Successfully handled invoice.payment_failed")
        else:
            logger.info(f"Unhandled event type: {event_type} (no action taken)")
    except Exception as e:
        logger.error(f"✗ ERROR handling webhook event {event_type}: {e}", exc_info=True)
        # Don't raise - return success to Stripe so it doesn't retry
        # But log the error for debugging
        return {"status": "error", "message": str(e)}

    logger.info("=" * 50)
    logger.info("WEBHOOK PROCESSING COMPLETE")
    logger.info("=" * 50)
    return {"status": "success"}
