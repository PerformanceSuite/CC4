"""Memory system models - 5-layer knowledge store.

Layer 1: Episodic - What happened (events, decisions, actions)
Layer 2: Semantic - What we know (facts, documents, knowledge)
Layer 3: Procedural - How to do things (skills - see skills.py)
Layer 4: Strategic - Long-term patterns (insights, strategies)
Layer 5: Meta - System self-awareness (computed, not stored)
"""

from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, Text, DateTime, Float, Boolean, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON

from app.database import Base


class Episode(Base):
    """Layer 1: Episodic Memory - What happened.

    Stores events, decisions, actions, discoveries.
    """
    __tablename__ = "episodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    event_type = Column(String(50), nullable=False)  # conversation, decision, action, discovery
    summary = Column(Text, nullable=False)
    actors = Column(JSON, nullable=True)  # ["user", "agent:backend-coder", "wander"]
    references = Column(JSON, nullable=True)  # Links to semantic/strategic items
    project_id = Column(String(100), nullable=True)
    raw_data = Column(JSON, nullable=True)  # Full event data
    embedding = Column(LargeBinary, nullable=True)  # Vector for semantic search


class SemanticEntry(Base):
    """Layer 2: Semantic Memory - What we know.

    Stores facts, documents, research, validated knowledge.
    """
    __tablename__ = "semantic_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    embedding = Column(LargeBinary, nullable=False)  # Vector for semantic search
    source = Column(String(100), nullable=False)  # url, file, research, user_input
    source_url = Column(Text, nullable=True)
    confidence = Column(Float, default=0.7)  # 0-1
    validated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)  # For time-sensitive info
    project_id = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)  # ["ml", "python", "api"]


class StrategicEntry(Base):
    """Layer 4: Strategic Memory - Long-term patterns.

    Stores insights, validated strategies, business patterns.
    From Wander crystals, AI Arena validation, user confirmation.
    """
    __tablename__ = "strategic_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    insight = Column(Text, nullable=False)
    pattern_type = Column(String(50), nullable=False)  # goal, pattern, strategy, preference
    confidence = Column(Float, nullable=False)  # 0-1
    validation_source = Column(String(100), nullable=False)  # wander, ai_arena, user, market
    supporting_episodes = Column(JSON, nullable=True)  # Episode IDs
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_validated = Column(DateTime, nullable=True)
    active = Column(Boolean, default=True)
    embedding = Column(LargeBinary, nullable=True)  # Vector for semantic search


# Note: Layer 3 (Procedural) is the Skills system - see models/skills.py
# Note: Layer 5 (Meta) is computed from system state, not stored
