"""
Module: backend/app/models/autonomous.py
Purpose: Data models for autonomous batch execution system

Supports end-to-end autonomous execution of implementation plans with:
- Batch orchestration and dependency management
- Task execution tracking with PR lifecycle
- Automated code review and fix loops
- Progress monitoring and error handling
"""
import enum
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class BatchStatus(enum.Enum):
    """Status of a batch execution."""
    PENDING = "pending"
    READY = "ready"
    EXECUTING = "executing"
    REVIEWING = "reviewing"
    COMPLETE = "complete"
    FAILED = "failed"


class TaskStatus(enum.Enum):
    """Status of a task execution."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PR_CREATED = "pr_created"
    REVIEWING = "reviewing"
    FIXING = "fixing"
    APPROVED = "approved"
    MERGED = "merged"
    FAILED = "failed"


class SessionStatus(enum.Enum):
    """Status of an autonomous execution session."""
    STARTED = "started"
    PAUSED = "paused"
    EXECUTING = "executing"
    COMPLETE = "complete"
    FAILED = "failed"


class AutonomousSession(Base):
    """
    Represents a complete autonomous execution session.

    Tracks the overall execution of a plan across multiple batches,
    managing configuration, progress, and lifecycle.
    """
    __tablename__ = "autonomous_sessions"

    id = Column(String, primary_key=True)
    plan_path = Column(String, nullable=False)
    start_batch = Column(Integer, nullable=False)
    end_batch = Column(Integer, nullable=False)
    execution_mode = Column(String, nullable=False)  # local | dagger
    status = Column(String, nullable=False, index=True)
    current_batch = Column(Integer)
    tasks_completed = Column(Integer, default=0)
    tasks_total = Column(Integer, default=0)
    auto_merge = Column(Boolean, default=True)
    max_review_rounds = Column(Integer, default=3)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    config = Column(JSON, default={})
    extra_data = Column(JSON, default={})


class BatchExecution(Base):
    """
    Represents execution of a single batch from a plan.

    A batch contains multiple tasks that can execute in parallel.
    Tracks batch-level status, timing, and relationships to tasks.
    """
    __tablename__ = "batch_executions"

    id = Column(String, primary_key=True)
    session_id = Column(String, nullable=False, index=True)
    plan_path = Column(String, nullable=False)
    batch_number = Column(Integer, nullable=False, index=True)
    status = Column(String, nullable=False, index=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    extra_data = Column(JSON, default={})

    # Relationships
    tasks = relationship("TaskExecution", back_populates="batch", cascade="all, delete-orphan")


class TaskExecution(Base):
    """
    Represents execution of a single task within a batch.

    Tracks the complete lifecycle of a task from implementation through
    PR creation, review, fixes, and merge. Maintains links to GitHub PRs
    and tracks review rounds and commits.
    """
    __tablename__ = "task_executions"

    id = Column(String, primary_key=True)
    batch_execution_id = Column(String, ForeignKey("batch_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    task_number = Column(String, nullable=False, index=True)  # "1.1", "1.2"
    task_title = Column(String, nullable=False)
    branch_name = Column(String)
    pr_number = Column(Integer, index=True)
    pr_url = Column(String)
    status = Column(String, nullable=False, index=True)
    review_rounds = Column(Integer, default=0)
    commits = Column(JSON, default=[])
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    error = Column(Text)
    extra_data = Column(JSON, default={})

    # Relationships
    batch = relationship("BatchExecution", back_populates="tasks")
    reviews = relationship("PRReview", back_populates="task", cascade="all, delete-orphan")


class PRReview(Base):
    """
    Represents a code review on a PR.

    Captures review output from automated agents (code-reviewer),
    including status, comments, and approval state. Supports multiple
    review rounds with fixes between each round.
    """
    __tablename__ = "pr_reviews"

    id = Column(String, primary_key=True)
    task_execution_id = Column(String, ForeignKey("task_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    pr_number = Column(Integer, nullable=False, index=True)
    review_round = Column(Integer, nullable=False)
    reviewer = Column(String, nullable=False)  # "code-reviewer-agent"
    status = Column(String, nullable=False)  # approved | changes_requested
    comments = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    extra_data = Column(JSON, default={})

    # Relationships
    task = relationship("TaskExecution", back_populates="reviews")
