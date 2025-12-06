"""
Database connection and session management.
Uses SQLAlchemy 2.0 async patterns.
"""

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Determine if we need SSL (Fly.io internal connections don't)
connect_args = {}
if ".internal" in settings.db_url or ".flycast" in settings.db_url:
    # Disable SSL for internal Fly.io connections
    connect_args["ssl"] = False

# Create async engine
engine = create_async_engine(
    settings.db_url,
    echo=settings.database_echo,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args=connect_args,
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_enum_types(conn) -> None:
    """Create PostgreSQL enum types if they don't exist."""
    enum_definitions = [
        ("plantype", ["free", "pro", "team"]),
        ("subscriptionstatus", ["active", "canceled", "past_due", "incomplete", "trialing", "unpaid"]),
        ("projectstatus", ["active", "completed", "on_hold", "cancelled"]),
        ("requestsource", ["email", "chat", "call", "meeting", "other"]),
        ("requeststatus", ["new", "analyzed", "addressed", "proposal_sent", "declined"]),
        ("scopeclassification", ["in_scope", "out_of_scope", "clarification_needed", "revision", "pending"]),
        ("proposalstatus", ["draft", "sent", "accepted", "declined", "expired"]),
    ]
    
    for enum_name, values in enum_definitions:
        # Check if enum exists
        check_sql = text(
            "SELECT 1 FROM pg_type WHERE typname = :enum_name"
        )
        result = await conn.execute(check_sql, {"enum_name": enum_name})
        exists = result.scalar() is not None
        
        if not exists:
            # Create the enum
            values_str = ", ".join(f"'{v}'" for v in values)
            create_sql = text(f"CREATE TYPE {enum_name} AS ENUM ({values_str})")
            await conn.execute(create_sql)


async def init_db() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        # Create enum types first
        await create_enum_types(conn)
        # Then create tables
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()