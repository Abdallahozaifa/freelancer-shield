"""Stripe service for handling payments and subscriptions."""
import os
import stripe
from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

from app.models.subscription import Subscription, PlanType, SubscriptionStatus
from app.models.user import User

# Load environment variables from .env
load_dotenv()

# Initialize Stripe with API key from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class StripeService:
    """Service for Stripe operations."""

    # Price ID from environment
    PRO_MONTHLY_PRICE_ID = os.getenv("STRIPE_PRO_PRICE_ID", "")
    WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    @staticmethod
    def create_customer(user: User) -> str:
        """Create a Stripe customer for a user."""
        customer = stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={
                "user_id": str(user.id),
            }
        )
        return customer.id

    @staticmethod
    async def create_checkout_session(
        db: AsyncSession,
        user: User,
        success_url: str,
        cancel_url: str,
    ) -> str:
        """Create a Stripe Checkout session for Pro subscription."""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Creating checkout session for user {user.id}")
        logger.info(f"Success URL: {success_url}")
        logger.info(f"Cancel URL: {cancel_url}")
        
        # Get or create subscription record
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user.id)
        )
        subscription = result.scalar_one_or_none()

        if not subscription:
            subscription = Subscription(user_id=user.id)
            db.add(subscription)
            await db.commit()
            await db.refresh(subscription)
            logger.info(f"Created new subscription record for user {user.id}")

        # Get or create Stripe customer
        if not subscription.stripe_customer_id:
            customer_id = StripeService.create_customer(user)
            subscription.stripe_customer_id = customer_id
            await db.commit()
            logger.info(f"Created Stripe customer: {customer_id}")
        else:
            customer_id = subscription.stripe_customer_id
            logger.info(f"Using existing Stripe customer: {customer_id}")

        # Ensure success_url has query parameter
        if "?" not in success_url:
            success_url = f"{success_url}?success=true"
            logger.info(f"Added ?success=true to success URL: {success_url}")
        
        # Ensure cancel_url has query parameter
        if "?" not in cancel_url:
            cancel_url = f"{cancel_url}?canceled=true"
            logger.info(f"Added ?canceled=true to cancel URL: {cancel_url}")

        # Create checkout session
        try:
            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": StripeService.PRO_MONTHLY_PRICE_ID,
                        "quantity": 1,
                    }
                ],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "user_id": str(user.id),
                },
                subscription_data={
                    "metadata": {
                        "user_id": str(user.id),
                    }
                },
                allow_promotion_codes=True,
            )
            logger.info(f"Created checkout session: {checkout_session.id}")
            logger.info(f"Checkout URL: {checkout_session.url}")
            logger.info(f"Session success_url: {checkout_session.success_url}")
            logger.info(f"Session cancel_url: {checkout_session.cancel_url}")
            return checkout_session.url
        except Exception as e:
            logger.error(f"Failed to create checkout session: {e}", exc_info=True)
            raise

    @staticmethod
    async def create_portal_session(
        db: AsyncSession,
        user: User,
        return_url: str,
    ) -> str:
        """Create a Stripe Customer Portal session for managing subscription."""
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user.id)
        )
        subscription = result.scalar_one_or_none()

        if not subscription or not subscription.stripe_customer_id:
            raise ValueError("No subscription found for user")

        portal_session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            return_url=return_url,
        )

        return portal_session.url

    @staticmethod
    async def handle_checkout_completed(db: AsyncSession, session: dict) -> None:
        """Handle successful checkout session completion."""
        import logging
        logger = logging.getLogger(__name__)
        
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        user_id = session.get("metadata", {}).get("user_id")
        
        logger.info(f"Checkout completed - customer_id: {customer_id}, subscription_id: {subscription_id}, user_id from metadata: {user_id}")

        # If user_id not in metadata, try to get from customer
        if not user_id and customer_id:
            try:
                customer = stripe.Customer.retrieve(customer_id)
                user_id = customer.metadata.get("user_id")
                logger.info(f"Retrieved user_id from customer metadata: {user_id}")
            except Exception as e:
                logger.error(f"Failed to retrieve customer: {e}")

        # Try to find existing subscription
        subscription = None
        if user_id:
            result = await db.execute(
                select(Subscription).where(Subscription.user_id == user_id)
            )
            subscription = result.scalar_one_or_none()
            logger.info(f"Found subscription by user_id: {subscription is not None}")
        
        if not subscription and customer_id:
            result = await db.execute(
                select(Subscription).where(Subscription.stripe_customer_id == customer_id)
            )
            subscription = result.scalar_one_or_none()
            logger.info(f"Found subscription by customer_id: {subscription is not None}")

        # Get subscription details from Stripe
        if subscription_id:
            try:
                stripe_subscription = stripe.Subscription.retrieve(subscription_id)
                current_period_start = datetime.fromtimestamp(stripe_subscription.current_period_start)
                current_period_end = datetime.fromtimestamp(stripe_subscription.current_period_end)
            except Exception as e:
                logger.error(f"Failed to retrieve Stripe subscription: {e}")
                current_period_start = None
                current_period_end = None
        else:
            current_period_start = None
            current_period_end = None

        if subscription:
            # Update existing subscription
            logger.info(f"Updating existing subscription for user {subscription.user_id}")
            subscription.stripe_subscription_id = subscription_id
            subscription.stripe_customer_id = customer_id
            subscription.plan = PlanType.PRO
            subscription.status = SubscriptionStatus.ACTIVE
            if current_period_start:
                subscription.current_period_start = current_period_start
            if current_period_end:
                subscription.current_period_end = current_period_end
            subscription.cancel_at_period_end = False
            await db.commit()
            await db.refresh(subscription)
            
            # Verify the update
            logger.info(f"✓ Updated subscription for user {subscription.user_id}")
            logger.info(f"  - Plan: {subscription.plan}")
            logger.info(f"  - Status: {subscription.status}")
            logger.info(f"  - is_pro: {subscription.is_pro}")
            logger.info(f"  - Stripe Subscription ID: {subscription.stripe_subscription_id}")
            
            if not subscription.is_pro:
                logger.error(f"✗ WARNING: Subscription updated but is_pro is still False!")
                logger.error(f"  Plan: {subscription.plan}, Status: {subscription.status}")
        elif user_id:
            # Create new subscription - CRITICAL FIX: This was missing!
            from uuid import UUID
            logger.info(f"Creating new subscription for user {user_id}")
            subscription = Subscription(
                user_id=UUID(user_id),
                stripe_subscription_id=subscription_id,
                stripe_customer_id=customer_id,
                plan=PlanType.PRO,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=current_period_start,
                current_period_end=current_period_end,
                cancel_at_period_end=False,
            )
            db.add(subscription)
            await db.commit()
            await db.refresh(subscription)
            
            # Verify the creation
            logger.info(f"✓ Created new subscription for user {user_id}")
            logger.info(f"  - Plan: {subscription.plan}")
            logger.info(f"  - Status: {subscription.status}")
            logger.info(f"  - is_pro: {subscription.is_pro}")
            logger.info(f"  - Stripe Subscription ID: {subscription.stripe_subscription_id}")
            
            if not subscription.is_pro:
                logger.error(f"✗ WARNING: Subscription created but is_pro is False!")
                logger.error(f"  Plan: {subscription.plan}, Status: {subscription.status}")
        else:
            logger.error(f"✗ CRITICAL: Cannot create/update subscription - no user_id found")
            logger.error(f"  customer_id: {customer_id}")
            logger.error(f"  subscription_id: {subscription_id}")
            logger.error(f"  session metadata: {session.get('metadata')}")
            logger.error(f"  session customer: {session.get('customer')}")
            
            # Try one more time to get user_id from customer
            if customer_id:
                try:
                    customer = stripe.Customer.retrieve(customer_id)
                    user_id_from_customer = customer.metadata.get("user_id")
                    logger.info(f"Retrieved user_id from customer: {user_id_from_customer}")
                    if user_id_from_customer:
                        # Try to create subscription with this user_id
                        from uuid import UUID
                        subscription = Subscription(
                            user_id=UUID(user_id_from_customer),
                            stripe_subscription_id=subscription_id,
                            stripe_customer_id=customer_id,
                            plan=PlanType.PRO,
                            status=SubscriptionStatus.ACTIVE,
                            current_period_start=current_period_start,
                            current_period_end=current_period_end,
                            cancel_at_period_end=False,
                        )
                        db.add(subscription)
                        await db.commit()
                        await db.refresh(subscription)
                        logger.info(f"✓ Created subscription using customer metadata: user_id={user_id_from_customer}")
                except Exception as e:
                    logger.error(f"Failed to retrieve customer or create subscription: {e}", exc_info=True)

    @staticmethod
    async def handle_subscription_updated(db: AsyncSession, stripe_subscription: dict) -> None:
        """Handle subscription update from Stripe webhook."""
        subscription_id = stripe_subscription.get("id")
        customer_id = stripe_subscription.get("customer")
        status = stripe_subscription.get("status")
        
        result = await db.execute(
            select(Subscription).where(
                (Subscription.stripe_subscription_id == subscription_id) |
                (Subscription.stripe_customer_id == customer_id)
            )
        )
        subscription = result.scalar_one_or_none()

        if not subscription:
            return

        subscription.stripe_subscription_id = subscription_id
        subscription.status = SubscriptionStatus(status) if status in [s.value for s in SubscriptionStatus] else SubscriptionStatus.ACTIVE
        
        current_period_start = stripe_subscription.get("current_period_start")
        current_period_end = stripe_subscription.get("current_period_end")
        
        if current_period_start:
            subscription.current_period_start = datetime.fromtimestamp(current_period_start)
        if current_period_end:
            subscription.current_period_end = datetime.fromtimestamp(current_period_end)

        subscription.cancel_at_period_end = stripe_subscription.get("cancel_at_period_end", False)

        if status in ["active", "trialing"]:
            subscription.plan = PlanType.PRO
        elif status in ["canceled", "unpaid"]:
            subscription.plan = PlanType.FREE

        await db.commit()

    @staticmethod
    async def handle_subscription_deleted(db: AsyncSession, stripe_subscription: dict) -> None:
        """Handle subscription cancellation/deletion."""
        subscription_id = stripe_subscription.get("id")
        
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = result.scalar_one_or_none()

        if subscription:
            subscription.plan = PlanType.FREE
            subscription.status = SubscriptionStatus.CANCELED
            subscription.stripe_subscription_id = None
            await db.commit()

    @staticmethod
    async def handle_invoice_payment_failed(db: AsyncSession, invoice: dict) -> None:
        """Handle failed invoice payment."""
        customer_id = invoice.get("customer")
        
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        subscription = result.scalar_one_or_none()

        if subscription:
            subscription.status = SubscriptionStatus.PAST_DUE
            await db.commit()

    @staticmethod
    async def cancel_subscription(db: AsyncSession, user: User) -> bool:
        """Cancel a user's subscription at period end."""
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user.id)
        )
        subscription = result.scalar_one_or_none()

        if not subscription or not subscription.stripe_subscription_id:
            return False

        stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=True
        )

        subscription.cancel_at_period_end = True
        await db.commit()

        return True

    @staticmethod
    async def reactivate_subscription(db: AsyncSession, user: User) -> bool:
        """Reactivate a canceled subscription before period ends."""
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user.id)
        )
        subscription = result.scalar_one_or_none()

        if not subscription or not subscription.stripe_subscription_id:
            return False

        stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=False
        )

        subscription.cancel_at_period_end = False
        await db.commit()

        return True
    
    @staticmethod
    def get_webhook_secret() -> str:
        """Get the webhook secret for verifying Stripe webhooks."""
        return os.getenv("STRIPE_WEBHOOK_SECRET", "")
