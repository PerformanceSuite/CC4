"""
Module: evidence.py
Purpose: Evidence tracking and chain-of-custody models for compliance

Security Classification: CUI
FedRAMP Controls: AU-2 (Audit Events), AU-9 (Protection of Audit Information),
                  AU-10 (Non-repudiation), SA-10 (Developer Configuration Management)
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID as PG_UUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class EvidenceRecord(Base):
    """
    Stores compliance evidence with cryptographic integrity verification.

    Maintains detailed records of evidence artifacts used to demonstrate
    control implementation. Each record includes hash verification, collection
    metadata, and classification for FedRAMP compliance tracking.

    Attributes:
        id: Unique identifier for the evidence record
        evidence_type: Type of evidence (screenshot, log, policy, procedure, config, scan_result)
        title: Human-readable title of the evidence
        description: Detailed description of what the evidence demonstrates
        artifact_url: URL or path to the stored evidence artifact
        artifact_hash: SHA-256 hash of the artifact for integrity verification
        artifact_size_bytes: Size of the artifact in bytes
        mime_type: MIME type of the artifact
        classification: Security classification (CUI, public, internal)
        collected_at: Timestamp when evidence was collected
        collected_by: User ID who collected the evidence
        valid_from: Evidence validity start date
        valid_until: Evidence validity end date (for time-sensitive evidence)
        is_automated: Whether evidence was collected automatically
        automation_source: Source system for automated collection
        related_controls: Array of control IDs this evidence supports
        tags: Array of tags for categorization and search
        extra_metadata: Additional evidence-specific data
        is_verified: Whether evidence integrity has been verified
        verified_at: Timestamp of last verification
        verified_by: User ID who verified the evidence

    Security:
        - FedRAMP AU-9: Protects audit information through hash verification
        - FedRAMP AU-10: Non-repudiation via cryptographic hashes
        - FedRAMP AU-2: Audit events for evidence collection
        - All artifacts hashed on collection for integrity
    """

    __tablename__ = "evidence_records"
    __table_args__ = (
        Index("idx_evidence_type", "evidence_type"),
        Index("idx_evidence_controls", "related_controls", postgresql_using="gin"),
        Index("idx_evidence_collected", "collected_at"),
        Index("idx_evidence_valid", "valid_from", "valid_until"),
        Index("idx_evidence_hash", "artifact_hash", unique=True),
        {"schema": "compliance"}
    )

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Evidence identification
    evidence_type = Column(
        Enum(
            "screenshot",
            "log",
            "policy",
            "procedure",
            "config",
            "scan_result",
            "certificate",
            "attestation",
            "diagram",
            name="evidence_type"
        ),
        nullable=False,
        comment="Type of evidence artifact"
    )
    title = Column(
        String(500),
        nullable=False,
        comment="Human-readable evidence title"
    )
    description = Column(
        Text,
        nullable=True,
        comment="Detailed description of evidence"
    )

    # Artifact storage
    artifact_url = Column(
        Text,
        nullable=False,
        comment="URL or path to stored evidence artifact"
    )
    artifact_hash = Column(
        String(64),
        nullable=False,
        unique=True,
        comment="SHA-256 hash of artifact for integrity verification"
    )
    artifact_size_bytes = Column(
        Integer,
        nullable=False,
        comment="Size of artifact in bytes"
    )
    mime_type = Column(
        String(255),
        nullable=False,
        comment="MIME type of artifact"
    )

    # Classification
    classification = Column(
        Enum("CUI", "public", "internal", name="classification_level"),
        nullable=False,
        default="CUI",
        comment="Security classification of evidence"
    )

    # Collection metadata
    collected_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Evidence collection timestamp"
    )
    collected_by = Column(
        PG_UUID(as_uuid=True),
        nullable=False,
        comment="User ID who collected evidence - references core.users(id)"
    )

    # Validity period
    valid_from = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Evidence validity start"
    )
    valid_until = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Evidence validity end (null for indefinite)"
    )

    # Automation tracking
    is_automated = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether evidence was collected automatically"
    )
    automation_source = Column(
        String(255),
        nullable=True,
        comment="Source system for automated collection (e.g., aws-config, azure-policy)"
    )

    # Relationships
    related_controls = Column(
        ARRAY(String),
        nullable=False,
        default=list,
        comment="Array of control IDs this evidence supports (e.g., ['ac-2', 'ac-2.1'])"
    )
    tags = Column(
        ARRAY(String),
        nullable=False,
        default=list,
        comment="Tags for categorization and search"
    )

    # Additional data
    extra_metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Evidence-specific metadata"
    )

    # Verification tracking
    is_verified = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether evidence integrity has been verified"
    )
    verified_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp of last verification"
    )
    verified_by = Column(
        PG_UUID(as_uuid=True),
        nullable=True,
        comment="User ID who verified evidence - references core.users(id)"
    )

    # Relationships
    chain_links = relationship(
        "EvidenceChain",
        foreign_keys="EvidenceChain.evidence_id",
        back_populates="evidence",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<EvidenceRecord(id={self.id}, type={self.evidence_type}, "
            f"title={self.title!r}, hash={self.artifact_hash[:8]}...)>"
        )


class EvidenceChain(Base):
    """
    Maintains chain-of-custody for evidence with cryptographic linking.

    Creates an immutable audit trail linking evidence to specific events,
    workflow states, and actors. Each link is timestamped and includes
    a hash of the previous link to create a tamper-evident chain.

    Attributes:
        id: Unique identifier for the chain link
        evidence_id: ID of the evidence record
        sequence_number: Sequential position in the chain (starts at 1)
        event_type: Type of event (creation, access, modification, verification, transfer)
        event_description: Human-readable description of the event
        actor_id: User ID who triggered the event
        occurred_at: Timestamp when event occurred
        workflow_id: Optional workflow instance this event relates to
        previous_link_hash: Hash of previous chain link for integrity
        current_link_hash: Hash of this chain link
        ip_address: IP address of actor (for forensics)
        user_agent: User agent string (for forensics)
        extra_metadata: Additional event-specific data

    Security:
        - FedRAMP AU-10: Non-repudiation through cryptographic chain
        - FedRAMP AU-9: Protection of audit information
        - FedRAMP AU-2: Audit events for evidence handling
        - Chain links are immutable (no updates after creation)
        - Each link cryptographically bound to previous link
    """

    __tablename__ = "evidence_chain"
    __table_args__ = (
        Index("idx_chain_evidence", "evidence_id"),
        Index("idx_chain_sequence", "evidence_id", "sequence_number", unique=True),
        Index("idx_chain_occurred", "occurred_at"),
        Index("idx_chain_actor", "actor_id"),
        {"schema": "compliance"}
    )

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Evidence reference
    evidence_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("compliance.evidence_records.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to evidence record"
    )

    # Chain position
    sequence_number = Column(
        Integer,
        nullable=False,
        comment="Sequential position in chain (1-indexed)"
    )

    # Event details
    event_type = Column(
        Enum(
            "creation",
            "access",
            "modification",
            "verification",
            "transfer",
            "deletion",
            name="chain_event_type"
        ),
        nullable=False,
        comment="Type of chain event"
    )
    event_description = Column(
        Text,
        nullable=False,
        comment="Human-readable event description"
    )

    # Actor and timing
    actor_id = Column(
        PG_UUID(as_uuid=True),
        nullable=False,
        comment="User ID who triggered event - references core.users(id)"
    )
    occurred_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Event timestamp"
    )

    # Workflow context
    workflow_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("compliance.workflow_states.id", ondelete="SET NULL"),
        nullable=True,
        comment="Optional workflow instance reference"
    )

    # Cryptographic chain
    previous_link_hash = Column(
        String(64),
        nullable=True,
        comment="SHA-256 hash of previous link (null for first link)"
    )
    current_link_hash = Column(
        String(64),
        nullable=False,
        unique=True,
        comment="SHA-256 hash of this link for integrity"
    )

    # Forensics
    ip_address = Column(
        String(45),
        nullable=True,
        comment="IP address of actor (IPv4 or IPv6)"
    )
    user_agent = Column(
        String(500),
        nullable=True,
        comment="User agent string for forensics"
    )

    # Additional data
    extra_metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Event-specific metadata"
    )

    # Relationships
    evidence = relationship("EvidenceRecord", back_populates="chain_links")

    def __repr__(self) -> str:
        return (
            f"<EvidenceChain(id={self.id}, evidence={self.evidence_id}, "
            f"seq={self.sequence_number}, event={self.event_type})>"
        )
