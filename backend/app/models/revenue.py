"""Revenue Dashboard models."""

from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, Float, Integer, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class RevenueStream(Base):
    """A revenue stream or pipeline opportunity."""

    __tablename__ = "revenue_streams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=True)  # recurring, one-time, pipeline
    amount = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    status = Column(String(50), nullable=True)  # active, churned, pipeline
    confidence = Column(Integer, nullable=True)  # 0-100, for pipeline items
    expected_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
