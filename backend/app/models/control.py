"""
Module: control.py
Purpose: FedRAMP control mapping and status tracking models

Security Classification: CUI
FedRAMP Controls: CA-2 (Security Assessments), CA-5 (Plan of Action and Milestones),
                  CA-7 (Continuous Monitoring), PM-9 (Risk Management Strategy)
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
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID as PG_UUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class ControlMapping(Base):
    """
    Maps FedRAMP security controls to system implementations.

    Represents the relationship between a specific FedRAMP security control
    (from NIST SP 800-53) and how it is implemented within a system. Includes
    control metadata, responsibility assignments, and parameter values.

    Attributes:
        id: Unique identifier for the control mapping
        system_id: ID of the system this control applies to
        control_id: FedRAMP control identifier (e.g., 'ac-2', 'ac-2.1')
        control_family: Control family code (AC, AU, CA, etc.)
        control_title: Official control title from NIST SP 800-53
        control_text: Full control description and requirements
        baseline_level: FedRAMP baseline level (LOW, MODERATE, HIGH, LI-SaaS)
        responsibility: Who is responsible (provider, customer, shared, inherited)
        implementation_description: How the control is implemented
        customer_responsibility: Customer responsibilities (for shared controls)
        provider_responsibility: Provider responsibilities (for shared controls)
        inherited_from_system_id: System ID if control is inherited
        inherited_uuid: UUID from inherited system's SSP
        parameters: Control parameter values (FedRAMP-specific)
        component_ids: Array of component UUIDs implementing this control
        evidence_ids: Array of evidence record UUIDs supporting this control
        related_controls: Array of related control IDs
        created_at: Timestamp when mapping was created
        updated_at: Timestamp of last update
        created_by: User ID who created the mapping
        updated_by: User ID who last updated the mapping
        extra_metadata: Additional control-specific data

    Security:
        - FedRAMP CA-2: Security assessment and authorization
        - FedRAMP CA-5: Plan of Action and Milestones tracking
        - Control mappings are the foundation of SSP generation
    """

    __tablename__ = "control_mappings"
    __table_args__ = (
        Index("idx_control_system", "system_id"),
        Index("idx_control_id", "control_id"),
        Index("idx_control_family", "control_family"),
        Index("idx_control_baseline", "baseline_level"),
        Index("idx_control_responsibility", "responsibility"),
        Index("idx_control_components", "component_ids", postgresql_using="gin"),
        {"schema": "compliance"}
    )

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # System reference
    system_id = Column(
        PG_UUID(as_uuid=True),
        nullable=False,
        comment="System ID - references meridian.systems(id)"
    )

    # Control identification
    control_id = Column(
        String(50),
        nullable=False,
        comment="FedRAMP control identifier (e.g., 'ac-2', 'ac-2.1')"
    )
    control_family = Column(
        String(10),
        nullable=False,
        comment="Control family code (AC, AU, CA, CM, etc.)"
    )
    control_title = Column(
        String(500),
        nullable=False,
        comment="Official control title from NIST SP 800-53"
    )
    control_text = Column(
        Text,
        nullable=False,
        comment="Full control description and requirements"
    )

    # Baseline classification
    baseline_level = Column(
        Enum("LOW", "MODERATE", "HIGH", "LI-SaaS", name="fedramp_baseline"),
        nullable=False,
        comment="FedRAMP baseline level requiring this control"
    )

    # Responsibility assignment
    responsibility = Column(
        Enum("provider", "customer", "shared", "inherited", name="control_responsibility"),
        nullable=False,
        comment="Who is responsible for control implementation"
    )

    # Implementation details
    implementation_description = Column(
        Text,
        nullable=False,
        comment="Detailed description of how control is implemented"
    )
    customer_responsibility = Column(
        Text,
        nullable=True,
        comment="Customer responsibilities for shared controls"
    )
    provider_responsibility = Column(
        Text,
        nullable=True,
        comment="Provider responsibilities for shared controls"
    )

    # Inheritance tracking
    inherited_from_system_id = Column(
        PG_UUID(as_uuid=True),
        nullable=True,
        comment="System ID if control is inherited"
    )
    inherited_uuid = Column(
        String(100),
        nullable=True,
        comment="UUID from inherited system's SSP for traceability"
    )

    # Control parameters
    parameters = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="FedRAMP-specific parameter values (e.g., {'ac-2_prm_1': '15 minutes'})"
    )

    # Relationships to components and evidence
    component_ids = Column(
        ARRAY(PG_UUID(as_uuid=True)),
        nullable=False,
        default=list,
        comment="Array of component UUIDs implementing this control"
    )
    evidence_ids = Column(
        ARRAY(PG_UUID(as_uuid=True)),
        nullable=False,
        default=list,
        comment="Array of evidence record UUIDs supporting this control"
    )

    # Related controls
    related_controls = Column(
        ARRAY(String),
        nullable=False,
        default=list,
        comment="Array of related control IDs"
    )

    # Audit trail
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Creation timestamp"
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        comment="Last update timestamp"
    )
    created_by = Column(
        PG_UUID(as_uuid=True),
        nullable=False,
        comment="User ID who created mapping - references core.users(id)"
    )
    updated_by = Column(
        PG_UUID(as_uuid=True),
        nullable=True,
        comment="User ID who last updated mapping - references core.users(id)"
    )

    # Additional data
    extra_metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Control-specific metadata"
    )

    # Relationships
    status = relationship(
        "ControlStatus",
        back_populates="control_mapping",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<ControlMapping(id={self.id}, control={self.control_id}, "
            f"system={self.system_id}, responsibility={self.responsibility})>"
        )


class ControlStatus(Base):
    """
    Tracks implementation and assessment status of security controls.

    Maintains current state of control implementation, assessment results,
    findings, and remediation tracking. Links to POA&M items for findings
    that require remediation.

    Attributes:
        id: Unique identifier for the status record
        control_mapping_id: ID of the control mapping
        implementation_status: Current implementation status
        assessment_status: Assessment result status
        last_assessed_at: Timestamp of last assessment
        assessed_by: Assessor organization or user ID
        assessment_method: How control was assessed (interview, examine, test)
        assessment_result: Assessment finding (satisfied, other-than-satisfied)
        assessment_findings: Detailed findings from assessment
        finding_severity: Severity if findings exist (critical, high, moderate, low)
        poam_item_id: ID of POA&M item if remediation required
        remediation_status: Current remediation status
        target_completion_date: Target date for remediation
        actual_completion_date: Actual completion date
        risk_rating: Risk rating if control not fully implemented
        risk_justification: Justification for risk acceptance
        continuous_monitoring: Whether control is continuously monitored
        last_monitored_at: Timestamp of last monitoring check
        monitoring_frequency: How often control is monitored
        next_review_date: Date of next scheduled review
        created_at: Timestamp when status was created
        updated_at: Timestamp of last update
        extra_metadata: Additional status-specific data

    Security:
        - FedRAMP CA-2: Security assessment results tracking
        - FedRAMP CA-5: POA&M tracking for findings
        - FedRAMP CA-7: Continuous monitoring status
        - Links to POA&M for tracking remediation
    """

    __tablename__ = "control_status"
    __table_args__ = (
        Index("idx_status_mapping", "control_mapping_id", unique=True),
        Index("idx_status_implementation", "implementation_status"),
        Index("idx_status_assessment", "assessment_status"),
        Index("idx_status_poam", "poam_item_id"),
        Index("idx_status_review", "next_review_date"),
        {"schema": "compliance"}
    )

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Control reference
    control_mapping_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("compliance.control_mappings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="Reference to control mapping"
    )

    # Implementation status
    implementation_status = Column(
        Enum(
            "implemented",
            "partial",
            "planned",
            "alternative",
            "not-applicable",
            name="implementation_status"
        ),
        nullable=False,
        default="planned",
        comment="Current implementation status"
    )

    # Assessment tracking
    assessment_status = Column(
        Enum(
            "not-assessed",
            "assessment-scheduled",
            "assessment-in-progress",
            "assessment-complete",
            name="assessment_status"
        ),
        nullable=False,
        default="not-assessed",
        comment="Assessment progress status"
    )
    last_assessed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp of last assessment"
    )
    assessed_by = Column(
        String(255),
        nullable=True,
        comment="Assessor organization or 3PAO name"
    )
    assessment_method = Column(
        ARRAY(String),
        nullable=False,
        default=list,
        comment="Assessment methods used (interview, examine, test)"
    )

    # Assessment results
    assessment_result = Column(
        Enum("satisfied", "other-than-satisfied", "not-applicable", name="assessment_result"),
        nullable=True,
        comment="Assessment finding result"
    )
    assessment_findings = Column(
        Text,
        nullable=True,
        comment="Detailed findings from assessment"
    )
    finding_severity = Column(
        Enum("critical", "high", "moderate", "low", name="finding_severity"),
        nullable=True,
        comment="Severity if findings exist"
    )

    # Remediation tracking
    poam_item_id = Column(
        PG_UUID(as_uuid=True),
        nullable=True,
        comment="ID of POA&M item if remediation required - references meridian.poam_items(id)"
    )
    remediation_status = Column(
        Enum("not-required", "planned", "in-progress", "completed", name="remediation_status"),
        nullable=False,
        default="not-required",
        comment="Current remediation status"
    )
    target_completion_date = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Target date for remediation completion"
    )
    actual_completion_date = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Actual remediation completion date"
    )

    # Risk tracking
    risk_rating = Column(
        Enum("critical", "high", "moderate", "low", name="risk_rating"),
        nullable=True,
        comment="Risk rating if control not fully implemented"
    )
    risk_justification = Column(
        Text,
        nullable=True,
        comment="Justification for risk acceptance"
    )

    # Continuous monitoring
    continuous_monitoring = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether control is continuously monitored"
    )
    last_monitored_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp of last monitoring check"
    )
    monitoring_frequency = Column(
        Enum("continuous", "daily", "weekly", "monthly", "quarterly", "annual", name="monitoring_frequency"),
        nullable=True,
        comment="How often control is monitored"
    )

    # Review scheduling
    next_review_date = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Date of next scheduled review"
    )

    # Audit trail
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Creation timestamp"
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        comment="Last update timestamp"
    )

    # Additional data
    extra_metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Status-specific metadata"
    )

    # Relationships
    control_mapping = relationship("ControlMapping", back_populates="status")

    def __repr__(self) -> str:
        return (
            f"<ControlStatus(id={self.id}, "
            f"implementation={self.implementation_status}, "
            f"assessment={self.assessment_result})>"
        )
