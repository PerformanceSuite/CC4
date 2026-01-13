"""Scanner and Finding models."""

from datetime import datetime, timezone
import uuid
from enum import Enum

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ScannerType(str, Enum):
    """Scanner type enumeration."""
    TECH = "tech"
    METHOD = "method"
    STRATEGY = "strategy"
    OPPORTUNITY = "opportunity"


class ScannerStatus(str, Enum):
    """Scanner status enumeration."""
    ACTIVE = "active"
    PAUSED = "paused"
    DISABLED = "disabled"


class FindingStatus(str, Enum):
    """Finding status enumeration."""
    NEW = "new"
    REVIEWING = "reviewing"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"


class Scanner(Base):
    """A scanner that monitors for specific intelligence."""

    __tablename__ = "scanners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # TECH, METHOD, STRATEGY, OPPORTUNITY
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)  # Scanner-specific configuration
    status = Column(String(50), default="active")  # active, paused, disabled
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    findings = relationship("Finding", back_populates="scanner", cascade="all, delete-orphan")


class Finding(Base):
    """A finding discovered by a scanner."""

    __tablename__ = "findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scanner_id = Column(UUID(as_uuid=True), ForeignKey("scanners.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=False)
    impact = Column(String(50), nullable=True)  # high, medium, low
    status = Column(String(50), default="new")  # new, reviewing, accepted, rejected, implemented
    extra_data = Column(JSON, nullable=True)  # Additional finding data (renamed from 'metadata' which is SQLAlchemy reserved)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    scanner = relationship("Scanner", back_populates="findings")
