"""
Base model with common fields for all entities.
"""
import uuid
from sqlalchemy import TypeDecorator, CHAR, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects import postgresql # To support native UUID in Postgres
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class TimestampMixin:
    """Mixin that adds created_at and updated_at timestamps."""
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """Mixin that adds a UUID primary key."""
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


class BaseModel(Base, UUIDMixin, TimestampMixin):
    """Base model with UUID primary key and timestamps."""
    
    __abstract__ = True



class GUID(TypeDecorator):
    """
    Platform-independent GUID type.
    Stores UUIDs as native UUID on PostgreSQL, and as CHAR(32) on SQLite.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        # Use native UUID type for PostgreSQL
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(postgresql.UUID())
        # Use CHAR(32) (TEXT) for SQLite and others
        return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        # Ensure the value is converted to a string format SQLite can store
        if isinstance(value, uuid.UUID):
            if dialect.name != 'postgresql':
                return value.hex
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        # Convert stored string back to Python UUID object
        if dialect.name != 'postgresql':
            return uuid.UUID(value)
        return value