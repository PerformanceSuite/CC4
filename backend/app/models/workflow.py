"""
Module: workflow.py
Purpose: Workflow state tracking models for compliance processes

Security Classification: CUI
FedRAMP Controls: CM-3 (Configuration Change Control), AU-2 (Audit Events)
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
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class WorkflowState(Base):
    """
    Tracks the current state of a compliance workflow instance.

    Represents a single execution of a workflow (e.g., control implementation,
    evidence collection, POA&M remediation). Maintains audit trail of state
    changes and provides context for compliance operations.

    Attributes:
        id: Unique identifier for the workflow instance
        workflow_type: Type of workflow (control_implementation, evidence_collection, etc.)
        entity_type: Type of entity this workflow tracks (control, evidence, etc.)
        entity_id: ID of the entity being tracked
        current_state: Current state in the workflow
        previous_state: Previous state before current transition
        status: Overall workflow status (active, completed, failed, cancelled)
        started_at: Timestamp when workflow instance was created
        completed_at: Timestamp when workflow reached terminal state
        started_by: User ID who initiated the workflow
        assigned_to: User ID currently responsible for workflow
        extra_metadata: Additional workflow-specific data
        is_compliant: Whether workflow represents compliant state
        requires_approval: Whether workflow requires approval to proceed

    Security:
        - FedRAMP CM-3: Tracks configuration changes through workflow states
        - FedRAMP AU-2: Maintains audit events for state transitions
        - All state changes logged via WorkflowTransition relationship
    """

    __tablename__ = "workflow_states"
    __table_args__ = (
        Index("idx_workflow_entity", "entity_type", "entity_id"),
        Index("idx_workflow_status", "status"),
        Index("idx_workflow_assigned", "assigned_to"),
        {"schema": "compliance"}
    )

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Workflow identification
    workflow_type = Column(
        String(100),
        nullable=False,
        comment="Type of workflow: control_implementation, evidence_collection, poam_remediation, conmon_scan"
    )
    entity_type = Column(
        String(100),
        nullable=False,
        comment="Type of entity: control, evidence, poam_item, scan"
    )
    entity_id = Column(
        PG_UUID(as_uuid=True),
        nullable=False,
        comment="ID of the entity being tracked"
    )

    # State tracking
    current_state = Column(
        String(100),
        nullable=False,
        comment="Current state in the workflow"
    )
    previous_state = Column(
        String(100),
        nullable=True,
        comment="Previous state before current transition"
    )
    status = Column(
        Enum("active", "completed", "failed", "cancelled", name="workflow_status"),
        nullable=False,
        default="active",
        comment="Overall workflow status"
    )

    # Timing
    started_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Workflow start timestamp"
    )
    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Workflow completion timestamp"
    )

    # Ownership
    started_by = Column(
        PG_UUID(as_uuid=True),
        nullable=False,
        comment="User ID who initiated workflow - references core.users(id)"
    )
    assigned_to = Column(
        PG_UUID(as_uuid=True),
        nullable=True,
        comment="User ID currently responsible - references core.users(id)"
    )

    # Additional data
    extra_metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Workflow-specific metadata and context"
    )

    # Compliance flags
    is_compliant = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether workflow represents compliant state"
    )
    requires_approval = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether workflow requires approval to proceed"
    )

    # Relationships
    transitions = relationship(
        "WorkflowTransition",
        back_populates="workflow",
        order_by="WorkflowTransition.transitioned_at",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<WorkflowState(id={self.id}, type={self.workflow_type}, "
            f"state={self.current_state}, status={self.status})>"
        )


class WorkflowTransition(Base):
    """
    Records state transitions within a workflow for audit and compliance.

    Maintains immutable audit trail of all state changes, including who
    made the change, when, why, and any approvals required. Essential for
    FedRAMP CM-3 change control and AU-2 audit events.

    Attributes:
        id: Unique identifier for the transition
        workflow_id: ID of the workflow instance
        from_state: State before transition
        to_state: State after transition
        transition_type: Type of transition (manual, automatic, approval, rejection)
        transitioned_at: Timestamp of transition
        transitioned_by: User ID who triggered transition
        reason: Human-readable reason for transition
        approved_by: User ID who approved transition (if applicable)
        approval_required: Whether approval was required
        approval_granted: Whether approval was granted
        extra_metadata: Additional transition-specific data

    Security:
        - FedRAMP CM-3: Audit trail for configuration changes
        - FedRAMP AU-2: Records audit events for compliance tracking
        - Immutable records (no updates after creation)
    """

    __tablename__ = "workflow_transitions"
    __table_args__ = (
        Index("idx_transition_workflow", "workflow_id"),
        Index("idx_transition_time", "transitioned_at"),
        Index("idx_transition_user", "transitioned_by"),
        {"schema": "compliance"}
    )

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Workflow reference
    workflow_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("compliance.workflow_states.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to workflow instance"
    )

    # State transition
    from_state = Column(
        String(100),
        nullable=True,
        comment="State before transition (null for initial state)"
    )
    to_state = Column(
        String(100),
        nullable=False,
        comment="State after transition"
    )
    transition_type = Column(
        Enum("manual", "automatic", "approval", "rejection", name="transition_type"),
        nullable=False,
        default="manual",
        comment="How the transition was triggered"
    )

    # Timing and actor
    transitioned_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Transition timestamp"
    )
    transitioned_by = Column(
        PG_UUID(as_uuid=True),
        nullable=False,
        comment="User ID who triggered transition - references core.users(id)"
    )

    # Justification
    reason = Column(
        Text,
        nullable=True,
        comment="Human-readable reason for transition"
    )

    # Approval tracking
    approved_by = Column(
        PG_UUID(as_uuid=True),
        nullable=True,
        comment="User ID who approved transition - references core.users(id)"
    )
    approval_required = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether this transition required approval"
    )
    approval_granted = Column(
        Boolean,
        nullable=True,
        comment="Whether approval was granted (null if not required)"
    )

    # Additional data
    extra_metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Transition-specific metadata"
    )

    # Relationships
    workflow = relationship("WorkflowState", back_populates="transitions")

    def __repr__(self) -> str:
        return (
            f"<WorkflowTransition(id={self.id}, "
            f"{self.from_state}->{self.to_state}, at={self.transitioned_at})>"
        )
