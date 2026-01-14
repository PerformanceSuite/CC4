"""
Module: __init__.py
Purpose: SQLAlchemy models for CC4

Includes:
- Compliance infrastructure models
- Autonomous pipeline models
- Parallel execution models
"""

from .workflow import WorkflowState, WorkflowTransition
from .evidence import EvidenceRecord, EvidenceChain
from .control import ControlMapping, ControlStatus
from .autonomous import (
    AutonomousSession,
    BatchExecution,
    TaskExecution,
    PRReview,
    SessionStatus,
    BatchStatus,
    TaskStatus,
)
from .parallel import (
    ParallelTestSession,
    ParallelTestExecution,
    ParallelSessionStatus,
    ParallelTestStatus,
)

__all__ = [
    # Compliance models
    "WorkflowState",
    "WorkflowTransition",
    "EvidenceRecord",
    "EvidenceChain",
    "ControlMapping",
    "ControlStatus",
    # Autonomous pipeline models
    "AutonomousSession",
    "BatchExecution",
    "TaskExecution",
    "PRReview",
    "SessionStatus",
    "BatchStatus",
    "TaskStatus",
    # Parallel execution models
    "ParallelTestSession",
    "ParallelTestExecution",
    "ParallelSessionStatus",
    "ParallelTestStatus",
]
