"""Project and Active Document models."""

from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Project(Base):
    """A project scope boundary for tasks, memory, and documents."""

    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    repo_path = Column(String(500), nullable=True)  # Local filesystem path
    living_context = Column(Text, nullable=True)  # AI-maintained project memory
    status = Column(String(50), default="active")  # active, paused, archived
    is_active = Column(Boolean, default=False)  # Currently selected project
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    documents = relationship("ActiveDocument", back_populates="project", cascade="all, delete-orphan")


class ActiveDocument(Base):
    """A pinned document that's always included in agent context."""

    __tablename__ = "active_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    path = Column(String(500), nullable=False)  # Relative to repo_path
    cached_content = Column(Text, nullable=True)
    token_count = Column(Integer, default=0)
    pinned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="documents")

    # Ensure unique path per project
    __table_args__ = (
        UniqueConstraint("project_id", "path", name="uq_project_document_path"),
    )
