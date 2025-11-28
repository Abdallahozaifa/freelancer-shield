"""
Pytest configuration and fixtures for testing.
"""

import asyncio
from collections.abc import AsyncGenerator, Generator
from decimal import Decimal
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.core.security import hash_password
from app.models import User, Project, ScopeItem, Client
from app.models.client_request import ClientRequest
from app.models.enums import ScopeClassification, RequestStatus


# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session_maker = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    async with async_session_maker() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with database session override."""
    
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        hashed_password=hash_password("testpassword123"),
        full_name="Test User",
        business_name="Test Business",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def other_user(db_session: AsyncSession) -> User:
    """Create another user for cross-user authorization tests."""
    user = User(
        email="other@example.com",
        hashed_password=hash_password("otherpassword123"),
        full_name="Other User",
        business_name="Other Business",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict[str, str]:
    """Get authentication headers for test user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# Scope Items Fixtures
# ============================================================================


@pytest_asyncio.fixture
async def other_auth_headers(client: AsyncClient, other_user: User) -> dict[str, str]:
    """Get authentication headers for the other user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": "otherpassword123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_client(db_session: AsyncSession, test_user: User) -> Client:
    """Create a test client owned by the test user."""
    client_obj = Client(
        user_id=test_user.id,
        name="Test Client",
        email="client@example.com",
    )
    db_session.add(client_obj)
    await db_session.commit()
    await db_session.refresh(client_obj)
    return client_obj


@pytest_asyncio.fixture
async def other_user_client(db_session: AsyncSession, other_user: User) -> Client:
    """Create a client owned by the other user."""
    client_obj = Client(
        user_id=other_user.id,
        name="Other Client",
        email="otherclient@example.com",
    )
    db_session.add(client_obj)
    await db_session.commit()
    await db_session.refresh(client_obj)
    return client_obj


@pytest_asyncio.fixture
async def test_project(db_session: AsyncSession, test_user: User, test_client: Client) -> Project:
    """Create a test project owned by the test user."""
    project = Project(
        user_id=test_user.id,
        client_id=test_client.id,
        name="Test Project",
        description="A test project for scope items",
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def other_user_project(db_session: AsyncSession, other_user: User, other_user_client: Client) -> Project:
    """Create a project owned by a different user (for authorization tests)."""
    project = Project(
        user_id=other_user.id,
        client_id=other_user_client.id,
        name="Other User's Project",
        description="Project owned by another user",
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def test_scope_item(db_session: AsyncSession, test_project: Project) -> ScopeItem:
    """Create a single test scope item."""
    scope_item = ScopeItem(
        project_id=test_project.id,
        title="Test Task",
        description="Test description",
        order=0,
        is_completed=False,
        estimated_hours=Decimal("5.0"),
    )
    db_session.add(scope_item)
    await db_session.commit()
    await db_session.refresh(scope_item)
    return scope_item


@pytest_asyncio.fixture
async def scope_items_ordered(
    db_session: AsyncSession, test_project: Project
) -> list[ScopeItem]:
    """Create multiple scope items in order."""
    items = []
    for i, title in enumerate(["Task 1", "Task 2", "Task 3"]):
        item = ScopeItem(
            project_id=test_project.id,
            title=title,
            order=i,
            is_completed=False,
        )
        db_session.add(item)
        items.append(item)
    
    await db_session.commit()
    for item in items:
        await db_session.refresh(item)
    return items


@pytest_asyncio.fixture
async def scope_items_abc(
    db_session: AsyncSession, test_project: Project
) -> tuple[ScopeItem, ScopeItem, ScopeItem]:
    """Create three scope items A, B, C for reorder testing."""
    item_a = ScopeItem(project_id=test_project.id, title="Item A", order=0)
    item_b = ScopeItem(project_id=test_project.id, title="Item B", order=1)
    item_c = ScopeItem(project_id=test_project.id, title="Item C", order=2)
    
    db_session.add_all([item_a, item_b, item_c])
    await db_session.commit()
    
    await db_session.refresh(item_a)
    await db_session.refresh(item_b)
    await db_session.refresh(item_c)
    
    return item_a, item_b, item_c


@pytest_asyncio.fixture
async def scope_items_with_progress(
    db_session: AsyncSession, test_project: Project
) -> list[ScopeItem]:
    """Create scope items with 1 of 3 completed (33.33% completion)."""
    items = [
        ScopeItem(
            project_id=test_project.id,
            title="Task 1",
            order=0,
            is_completed=True,
        ),
        ScopeItem(
            project_id=test_project.id,
            title="Task 2",
            order=1,
            is_completed=False,
        ),
        ScopeItem(
            project_id=test_project.id,
            title="Task 3",
            order=2,
            is_completed=False,
        ),
    ]
    
    db_session.add_all(items)
    await db_session.commit()
    for item in items:
        await db_session.refresh(item)
    return items


@pytest_asyncio.fixture
async def scope_items_with_hours(
    db_session: AsyncSession, test_project: Project
) -> list[ScopeItem]:
    """Create scope items with estimated hours (some completed)."""
    items = [
        ScopeItem(
            project_id=test_project.id,
            title="Task 1",
            order=0,
            is_completed=True,
            estimated_hours=Decimal("5.0"),
        ),
        ScopeItem(
            project_id=test_project.id,
            title="Task 2",
            order=1,
            is_completed=False,
            estimated_hours=Decimal("10.0"),
        ),
        ScopeItem(
            project_id=test_project.id,
            title="Task 3",
            order=2,
            is_completed=True,
            estimated_hours=Decimal("3.0"),
        ),
    ]
    
    db_session.add_all(items)
    await db_session.commit()
    for item in items:
        await db_session.refresh(item)
    return items


@pytest_asyncio.fixture
async def scope_items_all_completed(
    db_session: AsyncSession, test_project: Project
) -> list[ScopeItem]:
    """Create scope items that are all completed (100% completion)."""
    items = [
        ScopeItem(
            project_id=test_project.id,
            title="Task 1",
            order=0,
            is_completed=True,
        ),
        ScopeItem(
            project_id=test_project.id,
            title="Task 2",
            order=1,
            is_completed=True,
        ),
        ScopeItem(
            project_id=test_project.id,
            title="Task 3",
            order=2,
            is_completed=True,
        ),
    ]
    
    db_session.add_all(items)
    await db_session.commit()
    for item in items:
        await db_session.refresh(item)
    return items


# ============================================================================
# Client Request Fixtures (for Proposals)
# ============================================================================


@pytest_asyncio.fixture
async def test_client_request(
    db_session: AsyncSession, test_project: Project
) -> ClientRequest:
    """Create a test client request (out of scope)."""
    request = ClientRequest(
        project_id=test_project.id,
        title="Add new feature",
        content="Please add a new feature to the system that was not in the original scope.",
        classification=ScopeClassification.OUT_OF_SCOPE,
        status=RequestStatus.ANALYZED,
        analysis_reasoning="This request is out of scope because it involves new functionality not covered in the original project agreement.",
    )
    db_session.add(request)
    await db_session.commit()
    await db_session.refresh(request)
    return request


@pytest_asyncio.fixture
async def test_client_request_in_scope(
    db_session: AsyncSession, test_project: Project
) -> ClientRequest:
    """Create a test client request (in scope)."""
    request = ClientRequest(
        project_id=test_project.id,
        title="Fix login bug",
        content="The login button is not working correctly on mobile devices.",
        classification=ScopeClassification.IN_SCOPE,
        status=RequestStatus.ANALYZED,
        analysis_reasoning="This is a bug fix which falls within the original project scope.",
    )
    db_session.add(request)
    await db_session.commit()
    await db_session.refresh(request)
    return request


@pytest_asyncio.fixture
async def test_client_request_pending(
    db_session: AsyncSession, test_project: Project
) -> ClientRequest:
    """Create a test client request (pending analysis)."""
    request = ClientRequest(
        project_id=test_project.id,
        title="New request pending review",
        content="I would like to discuss some changes to the dashboard.",
        classification=ScopeClassification.PENDING,
        status=RequestStatus.NEW,
    )
    db_session.add(request)
    await db_session.commit()
    await db_session.refresh(request)
    return request
