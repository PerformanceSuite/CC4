"""Task and Execution Engine models."""

from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Task(Base):
    """A task in the execution engine."""

    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="backlog")  # backlog, in_progress, review, done, blocked
    persona = Column(String(100), nullable=True)  # Default persona for agent runs
    spec = Column(JSON, nullable=True)  # Auto-claude style spec
    agent_sessions = Column(JSON, nullable=True)  # History of agent work
    branch = Column(String(255), nullable=True)  # Git branch for this task
    execution_progress = Column(JSON, nullable=True)  # {phase, phaseProgress, subtasksCompleted, subtasksTotal}
    task_metadata = Column(JSON, nullable=True)  # {category, priority, complexity, impact}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))
