"""Skills system models - procedural memory."""

from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Skill(Base):
    """A skill in procedural memory - how to do things."""

    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False)  # 'agent-sandboxes'
    name = Column(String(255), nullable=False)  # 'Agent Sandboxes'
    description = Column(Text, nullable=True)  # For semantic search
    content = Column(Text, nullable=False)  # Full SKILL.md content
    embedding = Column(JSON, nullable=True)  # Vector stored as JSON array
    category = Column(String(50), nullable=True)  # 'infrastructure', 'workflow', 'coding'
    keywords = Column(JSON, nullable=True)  # ['e2b', 'sandbox', 'parallel']

    # Effectiveness tracking
    usage_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    last_used = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    feedback = relationship("SkillFeedback", back_populates="skill", cascade="all, delete-orphan")

    # Indexes for common queries
    __table_args__ = (
        Index("idx_skills_category", "category"),
        Index("idx_skills_slug", "slug"),
    )

    @property
    def effectiveness(self) -> float:
        """Calculate skill effectiveness rate."""
        if self.usage_count == 0:
            return 0.0
        return self.success_count / self.usage_count


class SkillFeedback(Base):
    """Feedback on skill usage - captures learnings."""

    __tablename__ = "skill_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    task_id = Column(String(100), nullable=True)  # Which task used this skill
    task_context = Column(Text, nullable=True)  # What was being done
    helped = Column(Integer, default=0)  # 1 = yes, 0 = no, -1 = made worse
    learning = Column(Text, nullable=True)  # What should be updated

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    skill = relationship("Skill", back_populates="feedback")

    # Indexes
    __table_args__ = (
        Index("idx_skill_feedback_skill", "skill_id"),
        Index("idx_skill_feedback_task", "task_id"),
    )
