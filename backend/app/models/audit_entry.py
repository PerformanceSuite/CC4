"""Audit entry model for tamper-evident logging."""

from sqlalchemy import Column, String, DateTime, JSON, Integer
from sqlalchemy.sql import func
from app.database import Base
import hashlib
import json


class AuditEntry(Base):
    """
    Audit log entry with hash chaining for tamper detection.

    FedRAMP Control: AU-3 (Content of Audit Records)
    """
    __tablename__ = "audit_entries"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    extra_data = Column(JSON, default={})
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    previous_hash = Column(String, nullable=True)  # Hash of previous entry
    hash = Column(String, nullable=False, unique=True)  # Hash of this entry

    def compute_hash(self) -> str:
        """Compute SHA-256 hash of this entry."""
        data = {
            "action": self.action,
            "user_id": self.user_id,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "extra_data": self.extra_data,
            "timestamp": self.timestamp.isoformat() if self.timestamp else "",
            "previous_hash": self.previous_hash or ""
        }

        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_str.encode()).hexdigest()
