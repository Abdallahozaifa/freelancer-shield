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

        # Get or create Stripe customer
        if not subscription.stripe_customer_id:
            customer_id = StripeService.create_customer(user)
            subscription.stripe_customer_id = customer_id
            await db.commit()
        else:
            customer_id = subscription.stripe_customer_id

        # Create checkout session
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

        return checkout_session.url

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
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        user_id = session.get("metadata", {}).get("user_id")

        if not user_id:
            result = await db.execute(
                select(Subscription).where(Subscription.stripe_customer_id == customer_id)
            )
            subscription = result.scalar_one_or_none()
        else:
            result = await db.execute(
                select(Subscription).where(Subscription.user_id == user_id)
            )
            subscription = result.scalar_one_or_none()

        if subscription:
            subscription.stripe_subscription_id = subscription_id
            subscription.stripe_customer_id = customer_id
            subscription.plan = PlanType.PRO
            subscription.status = SubscriptionStatus.ACTIVE
            await db.commit()

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
