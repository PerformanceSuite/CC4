"""Ideas and Hypothesis Engine models."""

from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Idea(Base):
    """A raw idea or question from the Ideas Tab."""

    __tablename__ = "ideas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(String(255), nullable=True)  # ForeignKey to projects

    # Input
    input = Column(Text, nullable=False)  # Renamed from raw_input
    action = Column(String(50), nullable=False)  # 'validate', 'plan', 'execute'

    # Status
    status = Column(String(50), default="pending")  # pending, processing, done, failed

    # For validate action
    confidence = Column(Float, nullable=True)
    recommendation = Column(String(50), nullable=True)  # defer, proceed, research
    hypotheses = Column(JSON, nullable=True)

    # For plan action
    plan = Column(JSON, nullable=True)

    # For execute action
    session_id = Column(String(255), nullable=True)
    require_review = Column(Boolean, default=False)
    run_e2e_tests = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)


class Hypothesis(Base):
    """A testable hypothesis derived from an idea."""

    __tablename__ = "hypotheses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    idea_id = Column(UUID(as_uuid=True), ForeignKey("ideas.id"), nullable=True)
    statement = Column(Text, nullable=False)
    test_strategy = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, validating, validated, rejected
    confidence = Column(Integer, nullable=True)  # 0-100
    validation_results = Column(JSON, nullable=True)  # AI Arena results, web search, etc
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    # Note: Idea.hypotheses is a JSON column for quick storage, not a relationship.
    # This relationship allows querying Hypothesis -> Idea but not vice versa.
    idea = relationship("Idea")
    insights = relationship("Insight", back_populates="hypothesis")


class Insight(Base):
    """An insight derived from hypothesis validation."""

    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hypothesis_id = Column(UUID(as_uuid=True), ForeignKey("hypotheses.id"), nullable=True)
    summary = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)
    importance = Column(Integer, default=50)  # 0-100
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    hypothesis = relationship("Hypothesis", back_populates="insights")
