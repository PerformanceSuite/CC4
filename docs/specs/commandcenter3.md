---
title: CommandCenter 3.0 Specification
type: spec
status: active
created: 2026-01-06
updated: 2026-01-13 15:45
owner: daniel
tags: [cc3, platform, infrastructure, agent-native]
priority: critical
security_classification: Internal
fedramp_controls: [SC-28, AU-3, AU-6, IA-2, AC-3]
related_documents:
  - docs/archive/plans/document-to-done-pipeline.md
  - docs/archive/plans/cc3-aef-implementation.yaml
  - docs/archive/aef-execution-guide.md
  - skills/long-running-agents/SKILL.md
changelog:
  - 2026-01-13: Added Section 7.6.4 (NodeShell Component & Design Token Cohesion) - Unified Canvas node architecture with cc-* design tokens, eliminating dynamic Tailwind classes
  - 2026-01-12: Added Section 7.6.3 (Task Progress Ring Node) - VISLZR execution progress visualization with subtask wedges and parallelism preview
  - 2026-01-12: Added Section 6.4.1 (Skill Governance) - prevents knowledge loss during skill archival/consolidation
  - 2026-01-11: Updated Section 4.6.3 with clone-vs-mount strategy for pipeline isolation (prevents local repo corruption)
  - 2026-01-10: Added Section 7.24 (Routines - Personal Recurring Automation with human-in-the-loop, Memory integration, VISLZR nodes)
  - 2026-01-10: Added Section 5.11.9-13 (Multi-Project Radar, Scanner Types, Forecaster Evolution, Self-Improvement UI, Research Tasks)
  - 2026-01-10: Added Section 5.11 (Self-Improvement System) - Method Radar, Model Registry, Claude Code Sync, Skill Evolution, Cross-Provider Benchmarking
  - 2026-01-10: Added Section 7.3.8 (VISLZR as Universal Interface) - repos, DBs, containers, K8s, cloud
  - 2026-01-10: Added Section 7.4.1 (Pipeline Ingest UI Improvements) and 7.4.2 (Agent Configuration & Model Selection)
  - 2026-01-10: Added Section 7.6.1 (Interactive Card Primitive) and 7.6.2 (Embedded Mini-CLI Pattern)
  - 2026-01-07: Updated Implementation Plan timeline from ~25 days to ~8-12 hours (parallel agent execution)
  - 2026-01-07: Added Section 4.7 (Long-Running Agent Orchestrator with PR + Review workflow)
  - 2026-01-07: Added Section 1.4 (CC2 Current Implementation Inventory)
  - 2026-01-07: Added Section 4.6.7 (Multi-Provider Subscription System) with CLI auth capture, provider fallback chains, and Settings UI integration
  - 2026-01-07: Added Section 5.9 (Tech Radar Agent) and 5.10 (Execution Pipeline with corrected timing)
  - 2026-01-07: Added Section 4.2 (RLM Architecture - validated 1000x improvement), 4.2.2 (RLM Executor), 4.2.3 (Complexity Analyzer)
  - 2026-01-07: Added Section 6.3 (Tiered Visual Memory - validated 93% token savings)
  - 2026-01-07: Updated Document Purpose to clarify CC3 is CC2's self-improvement
  - 2026-01-07: Updated Implementation Plan to reflect CC2's validated components (RLM, Visual Memory, Skills, 6-Layer Memory)
  - 2026-01-08: Architecture validated via 4-model adversarial review (Claude, GPT-4, Gemini, Grok)
  - 2026-01-08: Replaced Section 6.2 with Provenance-First Memory (MemoryClaim schema)
  - 2026-01-08: Added Section 6.2.4 (Interference-Based Forgetting with Saliency Scoring)
  - 2026-01-08: Added Section 6.2.5 (ε-Greedy Exploration Governor)
  - 2026-01-08: Added Section 6.2.6 (Belief Revision Protocol)
  - 2026-01-08: Updated Section 5.3.2 (AI Arena v2 with Three-Layer Validation)
  - 2026-01-08: Added Section 5.3.4 (Calibration Tracking) and 5.3.5 (Crucible Period)
  - 2026-01-08: Added Section 4.2.4 (RLM Complexity Ceiling + Recursive Decomposition)
  - 2026-01-08: Added Section 2.7 (Memory Security Model with Trust Levels)
  - 2026-01-08: Added Sections 7.9-7.19 (Living Canvas UI Vision) integrating altitude-based zoom, command palette, hover portals, live synthesis voice, cognitive support modes, timeline scrubber, and code theater from cc3-ui-vision.md and UI_Concepts.md
  - 2026-01-09: Added Philosophy section (CommandCenter as Your Second Brain)
  - 2026-01-09: Added Sections 5.11-5.13 (User Learning System: Observation Layer, Insight Engine, Intervention Rules)
  - 2026-01-09: Added Section 5.14 (Inner Council: Guidance Personality System)
  - 2026-01-09: Added Section 6.5 (User Model in Meta Memory)
  - 2026-01-09: Added Sections 7.20-7.22 (Insight Surfaces, Inner Council UI, Browser Capture Integration)
---

# CommandCenter 3.0 Specification

**An AI Operating System for building compliance-ready domain applications**

**Built by CC2**: This is CommandCenter 2.0 building an improved version of itself.

---

## Document Purpose

**CC3 = CC2's Self-Improvement**

CommandCenter 2.0 has validated breakthrough patterns (RLM, tiered visual memory, agent orchestration). CC3 is CC2 building a production-ready version with these validated components PLUS compliance infrastructure for enterprise deployment.

**What CC2 Validated** (now in CC3):
- ✅ RLM Architecture: 1000x improvement on complex tasks (0.04% → 58% success)
- ✅ Tiered Visual Memory: 93% token savings at scale
- ✅ Neuro-Symbolic Execution: Root LLM writes code, code guarantees logic
- ✅ Agent Orchestration: Prompt-native, not hardcoded pipelines
- ✅ 6-Layer Memory: Hierarchical persistence
- ✅ Skills System: Procedural memory that compounds

**What CC3 Adds**:
- FedRAMP-ready compliance primitives (audit, signatures, workflows)
- Commercial infrastructure (API keys, billing, usage metering)
- Clearer platform vs domain separation
- Documentation patterns for compliance

CC3 is a **platform**, not a product. It provides infrastructure that domain applications (Veria, Meridian, Proactiva) build upon.

**CC3 provides:**
- Compliance-ready primitives (audit, signatures, workflows)
- Agent framework (how agents work)
- Strategic intelligence (The Loop: DISCOVER → VALIDATE → IMPROVE)
- Knowledge layer (memory, skills)
- Frontend shell (Ideas Tab, VISLZR, execution views)
- Documentation patterns (FedRAMP-compliant by default)

**CC3 does NOT contain:**
- Domain-specific business logic
- Product-specific models
- External API integrations
- Domain-specific UI

Those live in separate projects that **import CC3**.

---

## Philosophy: CommandCenter as Your Second Brain

CommandCenter is not a tool you use. It's a **space you inhabit** that learns you.

### The Core Insight

Every interaction teaches the system something about how you think, work, and make decisions. This isn't a feature—it's the **fundamental behavior** of the platform. The system earns the right to guide you by demonstrating understanding over time.

### Three Layers of Understanding

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMANDCENTER                                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    INNER COUNCIL (The Voice)                          │ │
│  │    How the system talks to you: Sergeant, Coach, Mentor, Friend      │ │
│  │    Adjustable personality, context-aware, multi-voice for decisions  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                     │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                 USER LEARNING (The Understanding)                     │ │
│  │    Observation → Signals → Patterns → Insights → Interventions       │ │
│  │    Platform-level, cross-project, learns from EVERY interaction      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                     │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    CAPTURE SURFACES (The Input)                       │ │
│  │    Browser extension, Quick Capture, Voice, CLI—all feed the same    │ │
│  │    pipeline with auto-classification and intelligent routing         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What This Means in Practice

| Traditional Tool | CommandCenter |
|------------------|---------------|
| You organize your thoughts | Your thoughts organize themselves |
| You remember to follow up | The system notices patterns and reminds you |
| You ask for help | The system offers guidance when it sees you struggling |
| One-size-fits-all interface | Personality adapts to your needs and context |
| Features exist in isolation | Everything connects, learns, and improves |

### The Inner Voice

CommandCenter becomes your **inner voice**—the part of you that:
- Notices when you're avoiding something important
- Connects dots across projects that you haven't connected
- Knows when you need a push vs. when you need support
- Steers you toward your stated intentions when you drift

This isn't AI replacing human judgment. It's AI **amplifying** human capability by handling the cognitive load of self-awareness, pattern recognition, and gentle accountability.

### Key Principles

1. **Learning is invisible**: No "learning mode"—every interaction teaches
2. **Guidance is earned**: System only offers insights when confident and relevant
3. **User controls the voice**: Adjust personality, frequency, and style at any time
4. **Privacy is sacred**: User can view, correct, or delete everything the system knows
5. **Patterns decay**: Unused patterns fade—the model stays current

---

## Table of Contents

0. [Philosophy: CommandCenter as Your Second Brain](#philosophy-commandcenter-as-your-second-brain)
1. [Architecture Overview](#1-architecture-overview)
2. [Core Infrastructure](#2-core-infrastructure)
3. [Commercial Infrastructure](#3-commercial-infrastructure)
4. [Agent Framework](#4-agent-framework)
5. [Strategic Intelligence](#5-strategic-intelligence) *(includes User Learning 5.11-5.13, Inner Council 5.14)*
6. [Knowledge Layer](#6-knowledge-layer) *(includes User Model 6.5)*
7. [Frontend Shell](#7-frontend-shell) *(includes Insight Surfaces 7.20, Inner Council UI 7.21, Browser Capture 7.22)*
8. [Documentation Patterns](#8-documentation-patterns)
9. [Domain Integration](#9-domain-integration)
10. [Implementation Plan](#10-implementation-plan)

---

## 1. Architecture Overview

### 1.1 The Platform Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOMAIN APPLICATIONS                                  │
│         (Veria, Meridian, Proactiva - separate projects)                    │
│                              │                                               │
│                              │ imports                                       │
│                              ▼                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                         CC3 PLATFORM                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  FRONTEND SHELL  │  │  AGENT FRAMEWORK │  │  KNOWLEDGE LAYER │          │
│  │  • Ideas Tab     │  │  • Orchestrator  │  │  • KnowledgeBeast│          │
│  │  • VISLZR        │  │  • Triage        │  │  • 6-Layer Memory│          │
│  │  • Execution     │  │  • Primitives    │  │  • Skills Store  │          │
│  │  • Components    │  │                  │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    STRATEGIC INTELLIGENCE                             │  │
│  │  Wander • Hypothesis Engine • AI Arena • Strategy Planner            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      CORE INFRASTRUCTURE                              │  │
│  │  Signatures • Audit • Workflows • Evidence • Controls • Scheduler    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    COMMERCIAL INFRASTRUCTURE                          │  │
│  │  API Keys • Usage Metering • Rate Limiting • Billing (Stripe)        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            DATA LAYER                                        │
│              PostgreSQL • pgvector • Redis • Object Storage                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Principles

| Principle | Description |
|-----------|-------------|
| **Platform, Not Product** | CC3 enables domain apps, doesn't contain them |
| **Compliance-Native** | FedRAMP patterns baked in from day 1 |
| **Agent-Native** | Agents determine how, not hardcoded logic |
| **The Loop** | DISCOVER → VALIDATE → IMPROVE as operating system |
| **Invisible Machinery** | Users see ideas and results, never the machinery |
| **Composable** | Small, focused components that compose |

### 1.2.1 Validated Breakthroughs from CC2

CC2 has proven these patterns work at scale:

| Component | Breakthrough | Status |
|-----------|--------------|--------|
| **RLM Architecture** | 1000x improvement (0.04% → 58% success on O(n²) tasks) | ✅ Validated (Phase 3e) |
| **Tiered Visual Memory** | 93% token savings at 500+ sessions | ✅ Validated (Phase 3d) |
| **Neuro-Symbolic Execution** | Root LLM writes code, code guarantees logic | ✅ Validated (Phase 3e) |
| **6-Layer Memory** | Hierarchical persistence (working → system) | ✅ Built (Phase 3b) |
| **Skills System** | Procedural memory that compounds | ✅ Built (Phase 3a) |
| **Agent Orchestration** | Prompt-native, not hardcoded | ✅ Built (Phase 2.5) |

**References**:
- `experiments/rlm_prototype.py` - RLM validation code
- `experiments/RESULTS-rlm-prototype.md` - Benchmark results
- `backend/app/services/visual_memory/` - Tiered memory implementation
- `docs/architecture/RLM-NATIVE-COMMANDCENTER.md` - Full RLM architecture doc

### 1.4 CC2 Current Implementation Inventory

**CRITICAL**: CC3 is CC2 building itself. This section documents what CC2 already has that CC3 must migrate or enhance.

#### 1.4.1 Agent Framework (`backend/libs/agent_framework/`)

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| **Extraction Service** | `extraction_service.py` | ✅ Working | Extracts tasks from spec documents |
| **Orchestrator Service** | `orchestrator_service.py` | ✅ Working | Configures agents per-task |
| **Batch Executor** | `batch_executor.py` | ✅ Working | Parallel batch execution |
| **Branch Manager** | `branch_manager.py` | ✅ Working | Git branch-per-task pattern |
| **Progress Tracker** | `progress_tracker.py` | ✅ Working | Real-time progress via WebSocket |
| **Triage Service** | `triage.py` | ✅ Working | AI-driven failure analysis |
| **Pipeline Controller** | `pipeline.py` | ✅ Working | Full pipeline orchestration |

#### 1.4.2 Long-Running Agent Orchestrator (`backend/app/services/`)

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| **Long-Running Orchestrator** | `long_running_orchestrator.py` | ✅ Working | Multi-session with PR + review workflow |
| **Progress Protocol** | `progress_protocol.py` | ✅ Working | AGENT_PROGRESS.md state management |

**Key Feature**: PR + Review Workflow
```
Initializer (main) → Coder (branch) → PR → Reviewer → [Fix loop] → Merge
```

See: `skills/long-running-agents/SKILL.md` for full documentation.

#### 1.4.3 Core Services (`backend/app/services/`)

| Service | File | Status | CC3 Section |
|---------|------|--------|-------------|
| **Agent Service** | `agent_service.py` | ✅ Working | 4.3 Orchestrator Agent |
| **Dagger Parallel** | `dagger_parallel.py` | ✅ Working | 4.5 Sandbox Abstraction |
| **Memory Service** | `memory_service.py` | ✅ Working | 6.2 6-Layer Memory |
| **Skills Service** | `skills_service.py` | ✅ Working | 6.4 Skills Store |
| **RLM Executor** | `rlm_executor.py` | ✅ Working | 4.2 RLM Architecture |
| **Visual Memory** | `visual_memory/` | ✅ Working | 6.3 Tiered Visual Memory |
| **Hypothesis Service** | `hypothesis_service.py` | 🔨 Partial | 5.3.1 Hypothesis Engine |
| **Validation Service** | `validation_service.py` | 🔨 Partial | 5.3.2 AI Arena |

#### 1.4.4 API Endpoints (`backend/app/routers/`)

| Router | File | Key Endpoints |
|--------|------|---------------|
| **Pipeline** | `pipeline.py` | `POST /start`, `GET /{id}`, `POST /{id}/pause` |
| **Agents** | `agents.py` | `POST /run`, `POST /run-long`, `GET /sessions` |
| **Memory** | `memory.py` | `POST /store`, `GET /query`, `GET /layers` |
| **Skills** | `skills.py` | `GET /find`, `POST /create` |
| **Intelligence** | `intelligence.py` | `POST /validate`, `GET /confidence` |

#### 1.4.5 Migration Strategy for CC3

**Port directly** (working, just needs cleanup):
- Agent Framework → CC3 `/agents/`
- Long-Running Orchestrator → CC3 `/agents/long_running/`
- Memory Service → CC3 `/knowledge/memory/`
- Skills Service → CC3 `/knowledge/skills/`

**Enhance** (working but needs features):
- Hypothesis Service → Full Hypothesis Engine
- Validation Service → AI Arena (multi-model)

**Build new** (not in CC2):
- Core Infrastructure (audit, signatures, workflows)
- Commercial Infrastructure (API keys, billing)
- Tech Radar Agent
- Full Execution Pipeline Orchestrator

### 1.5 Directory Structure

```
/CommandCenter3/
├── /core/                        # COMPLIANCE INFRASTRUCTURE
│   ├── /signatures/              # Digital signatures (FIPS 186-5)
│   ├── /audit/                   # Hash-chained audit logging
│   ├── /workflows/               # Approval routing engine
│   ├── /evidence/                # Evidence registry (SHA-256)
│   ├── /controls/                # Controls framework (OSCAL-native)
│   ├── /encryption/              # Encryption at rest/transit
│   └── /scheduler/               # Background job management
│
├── /commercial/                  # MONETIZATION INFRASTRUCTURE
│   ├── /api_keys/                # Key generation, validation
│   ├── /usage/                   # Usage metering
│   ├── /rate_limiting/           # Tier-based limits
│   └── /billing/                 # Stripe integration
│
├── /agents/                      # AGENT FRAMEWORK
│   ├── /orchestrator/            # Agent-driven task orchestration
│   ├── /triage/                  # Failure analysis agent
│   ├── /primitives/              # Tools available to agents
│   ├── /sandbox/                 # Dagger/E2B abstraction
│   └── /personas/                # YAML persona definitions
│
├── /strategic/                   # STRATEGIC INTELLIGENCE (THE LOOP)
│   ├── /wander/                  # Wander Agent (DISCOVER)
│   ├── /curator/                 # Source Curator
│   ├── /hypothesis/              # Hypothesis Engine (VALIDATE)
│   ├── /arena/                   # AI Arena (invisible)
│   └── /planner/                 # Strategy Planner (IMPROVE)
│
├── /knowledge/                   # KNOWLEDGE LAYER
│   ├── /beast/                   # KnowledgeBeast (vectors + graph)
│   ├── /memory/                  # 6-layer memory system
│   └── /skills/                  # Skills store + retrieval
│
├── /frontend/                    # FRONTEND SHELL
│   └── /src/
│       ├── /shell/               # App shell, routing, layout
│       ├── /views/
│       │   ├── /ideas/           # Simple entry point
│       │   ├── /vislzr/          # Mind map interface
│       │   ├── /execution/       # Kanban + agent streaming
│       │   └── /revenue/         # Revenue dashboard
│       ├── /components/          # Reusable UI components
│       └── /hooks/               # Shared hooks
│
├── /patterns/                    # DOCUMENTATION PATTERNS
│   ├── /templates/               # Docstring templates
│   ├── /security/                # FedRAMP annotation helpers
│   └── /oscal/                   # OSCAL generation utilities
│
├── /backend/                     # FastAPI application
│   ├── /app/
│   │   ├── /routers/             # Platform API endpoints
│   │   ├── /models/              # Platform models only
│   │   └── /services/            # Platform services
│   └── /libs/                    # Internal libraries
│
├── /skills/                      # Procedural memory
└── /docs/                        # Documentation
```

---

## 2. Core Infrastructure

These primitives are FedRAMP-ready. Any domain app using them inherits compliance.

### 2.1 Digital Signatures

**Purpose:** Cryptographically sign documents, approvals, and actions.

**FedRAMP Controls:** SC-13 (Cryptographic Protection), AU-10 (Non-repudiation)

```python
"""
Module: core/signatures/service.py
Purpose: Digital signature operations

Security Classification: CUI
FedRAMP Controls: SC-13, AU-10
"""

class SignatureService:
    """
    FIPS 186-5 compliant digital signatures.

    Algorithms: RSA-PSS, ECDSA, EdDSA
    Storage: HSM or secure enclave
    """

    async def sign(self, content: bytes, signer_id: str) -> Signature:
        """Sign content with signer's private key."""

    async def verify(self, signature: Signature, content: bytes) -> bool:
        """Verify signature against content."""
```

**Domain Usage:**
```python
# In Veria: Sign compliance attestation
signature = await cc3.signatures.sign(attestation_pdf, auditor_id)

# In Meridian: Sign SSP approval
signature = await cc3.signatures.sign(ssp_document, ao_id)
```

### 2.2 Audit Logging

**Purpose:** Tamper-evident activity records with hash chaining.

**FedRAMP Controls:** AU-2, AU-3, AU-6, AU-9

```python
"""
Module: core/audit/service.py
Purpose: Hash-chained audit logging

Security Classification: CUI
FedRAMP Controls: AU-2, AU-3, AU-6, AU-9
"""

class AuditService:
    """
    Append-only, hash-chained audit log.

    Each entry chains to previous via SHA-256.
    Supports SIEM export for compliance.
    """

    async def log(
        self,
        actor_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: dict | None = None,
    ) -> AuditEntry:
        """Create audit entry with chain hash."""

    async def export(self, start: datetime, end: datetime) -> bytes:
        """Export logs for compliance review."""
```

**Domain Usage:**
```python
# In Veria: Log screening action
await cc3.audit.log(api_key_id, "screen", "address", address, {"result": "BLOCKED"})

# In Meridian: Log control status change
await cc3.audit.log(user_id, "update", "control", "AC-3", {"status": "implemented"})
```

### 2.3 Approval Workflows

**Purpose:** Multi-party approval routing with deadlines and escalation.

**FedRAMP Controls:** AC-3, AU-3

```python
"""
Module: core/workflows/service.py
Purpose: Approval workflow state machine

Security Classification: CUI
FedRAMP Controls: AC-3, AU-3
"""

class WorkflowService:
    """
    Configurable approval workflows.

    Supports: Sequential, parallel, deadline-based escalation
    """

    async def create(self, item_type: str, item_id: str, steps: list) -> Workflow:
        """Create workflow with approval steps."""

    async def approve(self, workflow_id: str, approver_id: str, decision: str) -> Workflow:
        """Submit approval decision."""
```

**Domain Usage:**
```python
# In Meridian: SSP approval workflow
workflow = await cc3.workflows.create(
    "ssp", ssp_id,
    steps=[
        {"role": "isso", "required": True},
        {"role": "ao", "required": True, "signature_required": True}
    ]
)
```

### 2.4 Evidence Registry

**Purpose:** Store compliance evidence with cryptographic integrity.

**FedRAMP Controls:** AU-3, SI-7

```python
"""
Module: core/evidence/service.py
Purpose: Evidence storage with integrity verification

Security Classification: CUI
FedRAMP Controls: AU-3, SI-7
"""

class EvidenceService:
    """
    Immutable evidence storage.

    All evidence SHA-256 hashed, versioned (no updates).
    """

    async def store(self, content: bytes, evidence_type: str, metadata: dict) -> Evidence:
        """Store evidence with hash."""

    async def verify(self, evidence_id: str) -> bool:
        """Verify evidence integrity."""
```

### 2.5 Controls Framework

**Purpose:** Track control implementation status, generate OSCAL.

**FedRAMP Controls:** CA-2, CA-7

```python
"""
Module: core/controls/service.py
Purpose: Controls tracking and OSCAL generation

Security Classification: CUI
FedRAMP Controls: CA-2, CA-7
"""

class ControlsService:
    """
    Universal controls framework.

    Supports: NIST 800-53, FedRAMP, ISO 27001, SOC 2
    Output: OSCAL JSON/XML
    """

    async def import_baseline(self, standard: str) -> Baseline:
        """Import control baseline."""

    async def set_implementation(self, control_id: str, status: str, evidence: list) -> None:
        """Set control implementation status."""

    async def generate_oscal(self, system_id: str) -> bytes:
        """Generate OSCAL-compliant output."""
```

### 2.6 Scheduler

**Purpose:** Background job management.

```python
"""
Module: core/scheduler/service.py
Purpose: Cron and background job management
"""

class SchedulerService:
    """
    Job scheduling for platform and domain apps.

    Domain apps register their jobs with the platform scheduler.
    """

    async def register(self, name: str, schedule: str, handler: Callable) -> Job:
        """Register a scheduled job."""

    async def trigger(self, name: str) -> JobRun:
        """Manually trigger a job."""
```

**Domain Usage:**
```python
# In Veria: Register OFAC sync job
cc3.scheduler.register("veria:ofac_sync", "0 6 * * *", veria.sync_ofac)
```

---

## 3. Commercial Infrastructure

Reusable monetization primitives for any domain app.

### 3.1 API Key Management

```python
"""
Module: commercial/api_keys/service.py
Purpose: API key lifecycle management
"""

class ApiKeyService:
    """
    API key generation, validation, rotation.

    Keys are scoped to products/tiers.
    """

    async def create(self, user_id: str, product: str, tier: str) -> ApiKey:
        """Create API key for product/tier."""

    async def validate(self, key: str) -> ApiKeyValidation:
        """Validate key, return tier and permissions."""
```

### 3.2 Usage Metering

```python
"""
Module: commercial/usage/service.py
Purpose: API usage tracking
"""

class UsageService:
    """
    Track usage per API key for billing.
    """

    async def track(self, api_key: str, endpoint: str, units: int = 1) -> None:
        """Track API usage."""

    async def get_usage(self, api_key: str, period: str) -> UsageSummary:
        """Get usage for billing period."""
```

### 3.3 Rate Limiting

```python
"""
Module: commercial/rate_limiting/service.py
Purpose: Tier-based rate limiting
"""

class RateLimitService:
    """
    Redis-backed sliding window rate limiting.

    Limits configured per product/tier.
    """

    async def check(self, api_key: str) -> RateLimitResult:
        """Check if within rate limit."""
```

### 3.4 Billing (Stripe)

```python
"""
Module: commercial/billing/service.py
Purpose: Stripe integration
"""

class BillingService:
    """
    Stripe subscriptions and usage billing.
    """

    async def create_subscription(self, user_id: str, product: str, tier: str) -> Subscription:
        """Create Stripe subscription."""

    async def report_usage(self, subscription_id: str, quantity: int) -> None:
        """Report usage for metered billing."""
```

---

## 4. Agent Framework

Agent-native orchestration where agents determine HOW, not hardcoded logic.

### 4.1 Core Principles

| Principle | Implementation |
|-----------|----------------|
| Agents choose configuration | No hardcoded model selection |
| Agents request tools | No pre-computed tool grants |
| Agents analyze failures | No regex pattern matching |
| Agents determine workflow | No rigid pipeline stages |
| Agents query memory | Memory is queryable, not pre-loaded |

### 4.2 RLM (Recursive Language Model) Architecture

**Status**: ✅ **VALIDATED** in CC2 (Phase 3e) - 1000x improvement on complex tasks

CC2 validated the MIT Recursive Language Model pattern with breakthrough results:

| Metric | Standard LLM | RLM Pattern | Improvement |
|--------|--------------|-------------|-------------|
| Success rate (O(n²) at 32k tokens) | **0.04%** | **58%** | **1000x** |
| Cost per operation | $0.16 | $0.33 | 2x |

**Key Insight**: "Attention is not all you need."

#### 4.2.1 Neuro-Symbolic Architecture

The RLM pattern combines neural and symbolic computation:

```
┌─────────────────────────────────────────────────────────────────┐
│                     ROOT LLM (Sonnet)                            │
│  Generates decomposition strategy as executable Python code     │
│  "What's the algorithm to solve this?"                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ outputs Python code
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SYMBOLIC LAYER (Python)                        │
│  Executes with logical guarantees: loops, conditionals, state   │
│  "Execute the strategy with mathematical precision"             │
└────────────────────────┬────────────────────────────────────────┘
                         │ spawns extractors
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUB-LLMs (Haiku)                               │
│  Cheap extraction, no reasoning - just parsing                  │
│  "Extract this specific field from this chunk"                  │
└─────────────────────────────────────────────────────────────────┘
```

**Core Principles:**
1. **Neuro-Symbolic > Pure Neural**: Root LLM writes code, code guarantees logic
2. **External Memory > Attention**: Context stored outside, loaded selectively
3. **Cheap Sub-LLMs for Extraction**: Haiku doesn't reason, just parses
4. **Symbolic Guarantees**: Python loops = no missed chunks, Python counters = accurate totals

#### 4.2.2 RLM Executor Service

```python
"""
Module: agents/rlm/executor.py
Purpose: RLM execution engine (validated in CC2 experiments/)

Security Classification: Internal
"""

from dataclasses import dataclass
from anthropic import Anthropic


@dataclass
class RLMConfig:
    """RLM execution configuration."""
    root_model: str = "claude-sonnet-4"      # Decomposition strategy
    sub_model: str = "claude-haiku-4"        # Cheap extraction
    max_parallel: int = 10                    # Parallel sub-LLM calls


@dataclass
class DecompositionStrategy:
    """Generated Python code + metadata from Root LLM."""
    code: str                                 # Executable Python
    explanation: str                          # What the code does
    expected_calls: int                       # Predicted sub-LLM count


@dataclass
class RLMResult:
    """Execution result with trace."""
    answer: str                               # Final answer
    sub_calls: int                            # Actual sub-LLM count
    trace: list[str]                          # Execution log
    cost: float                               # Total cost


class RLMExecutor:
    """
    Executes complex tasks using RLM pattern.

    Validated results (CC2 Phase 3e):
    - O(1): Find secret code in 16 chunks → 21.3s → SUCCESS
    - O(n): Extract quarterly metrics → 11.3s → SUCCESS
    - O(n²): Calculate partnership revenues → 17.4s → SUCCESS

    See: experiments/rlm_prototype.py, experiments/RESULTS-rlm-prototype.md
    """

    def __init__(self, config: RLMConfig = None):
        self.config = config or RLMConfig()
        self.client = Anthropic()

    async def execute(self, task: str, corpus: list[str]) -> RLMResult:
        """
        Execute task using RLM pattern.

        Steps:
        1. Root LLM generates decomposition strategy (Python code)
        2. Execute strategy with symbolic layer (Python runtime)
        3. Sub-LLMs extract data from chunks as needed
        4. Synthesize final answer from results
        """
        # Step 1: Generate decomposition strategy
        strategy = await self._generate_strategy(task, corpus)

        # Step 2: Execute strategy with symbolic layer
        result = await self._execute_strategy(strategy, corpus)

        # Step 3: Synthesize final answer
        return await self._synthesize(task, result)

    async def _generate_strategy(
        self,
        task: str,
        corpus: list[str]
    ) -> DecompositionStrategy:
        """
        Root LLM generates Python code to solve the task.

        Example output:
        ```python
        # Strategy: Binary search for secret code
        results = []
        for i in range(0, len(corpus), 5):
            batch = corpus[i:i+5]
            result = await extract_from_chunk(batch, "Find SECRET CODE")
            if result:
                results.append(result)
        return results
        ```
        """
        prompt = f"""You are a Root LLM in an RLM architecture. Generate Python code to solve this task.

Task: {task}

Corpus: {len(corpus)} chunks available

Generate executable Python code that:
1. Uses loops/conditionals for logic (symbolic layer)
2. Calls `await extract(chunk, query)` to get data from chunks (sub-LLM)
3. Returns final result

Output valid Python code only."""

        response = await self.client.messages.create(
            model=self.config.root_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
        )

        code = response.content[0].text

        return DecompositionStrategy(
            code=code,
            explanation="Root LLM strategy",
            expected_calls=len(corpus),  # Estimate
        )

    async def _execute_strategy(
        self,
        strategy: DecompositionStrategy,
        corpus: list[str],
    ) -> dict:
        """Execute generated Python code with symbolic guarantees."""
        # Provide extract() function for sub-LLM calls
        trace = []

        async def extract(chunk: str, query: str) -> str:
            """Sub-LLM extraction (cheap, no reasoning)."""
            response = await self.client.messages.create(
                model=self.config.sub_model,
                messages=[{
                    "role": "user",
                    "content": f"Extract: {query}\n\nFrom: {chunk}\n\nAnswer briefly:"
                }],
                max_tokens=500,
            )
            result = response.content[0].text
            trace.append(f"Extracted from chunk: {result[:50]}")
            return result

        # Execute generated code
        exec_globals = {
            "corpus": corpus,
            "extract": extract,
            "results": [],
        }

        exec(strategy.code, exec_globals)

        return {
            "results": exec_globals.get("results", []),
            "trace": trace,
        }

    async def _synthesize(self, task: str, result: dict) -> RLMResult:
        """Synthesize final answer from execution results."""
        # Root LLM combines results
        response = await self.client.messages.create(
            model=self.config.root_model,
            messages=[{
                "role": "user",
                "content": f"Task: {task}\n\nResults: {result['results']}\n\nProvide final answer:"
            }],
            max_tokens=1000,
        )

        return RLMResult(
            answer=response.content[0].text,
            sub_calls=len(result["trace"]),
            trace=result["trace"],
            cost=0.33,  # Estimated
        )
```

#### 4.2.3 Complexity Analyzer

Auto-detect when RLM is needed vs standard execution:

```python
"""
Module: agents/rlm/complexity.py
Purpose: Detect task complexity and recommend execution mode
"""

from enum import Enum


class ComplexityClass(Enum):
    """Computational complexity classes."""
    O1 = "O(1)"       # Single lookup
    ON = "O(n)"       # Linear scan
    ON2 = "O(n²)"     # Cross-reference, correlation


class ExecutionRecommendation(Enum):
    """Recommended execution mode."""
    STANDARD = "standard"         # Single LLM call
    RLM_OPTIONAL = "rlm_optional" # Could benefit from RLM
    RLM_REQUIRED = "rlm_required" # Must use RLM


@dataclass
class ComplexityAnalysis:
    """Task complexity analysis."""
    complexity_class: ComplexityClass
    expected_calls: int
    recommendation: ExecutionRecommendation
    reasoning: str


class ComplexityAnalyzer:
    """
    Analyzes task complexity to determine execution mode.

    Uses pattern matching + heuristics to detect:
    - O(1): Single fact retrieval
    - O(n): Summarization, listing
    - O(n²): Cross-reference, correlation, "all pairs"
    """

    # Pattern matching for complexity detection
    PATTERNS = {
        ComplexityClass.O1: [
            "find the", "what is the", "retrieve", "get the",
            "show me the", "display the",
        ],
        ComplexityClass.ON: [
            "summarize all", "list every", "for each",
            "extract all", "find all", "count",
        ],
        ComplexityClass.ON2: [
            "find all pairs", "cross-reference", "correlate",
            "compare all", "find connections", "match",
            "which partnerships", "analyze relationships",
        ],
    }

    @classmethod
    def analyze(cls, task: str, corpus_size: int) -> ComplexityAnalysis:
        """
        Analyze task complexity and recommend execution mode.

        Example:
            analysis = ComplexityAnalyzer.analyze(
                "Find all partnerships between companies and their revenues",
                corpus_size=35
            )
            # Returns: O(n²), 1225 expected calls, RLM_REQUIRED
        """
        # Detect complexity class
        task_lower = task.lower()

        for complexity, patterns in cls.PATTERNS.items():
            if any(pattern in task_lower for pattern in patterns):
                detected_class = complexity
                break
        else:
            # Default to O(n) if no pattern matches
            detected_class = ComplexityClass.ON

        # Calculate expected calls
        if detected_class == ComplexityClass.O1:
            expected_calls = 1
        elif detected_class == ComplexityClass.ON:
            expected_calls = corpus_size
        else:  # O(n²)
            expected_calls = corpus_size * corpus_size

        # Recommendation
        if detected_class == ComplexityClass.O1:
            recommendation = ExecutionRecommendation.STANDARD
            reasoning = "Single lookup - standard execution sufficient"
        elif detected_class == ComplexityClass.ON and corpus_size <= 10:
            recommendation = ExecutionRecommendation.STANDARD
            reasoning = f"Linear scan of {corpus_size} items - standard execution OK"
        elif detected_class == ComplexityClass.ON:
            recommendation = ExecutionRecommendation.RLM_OPTIONAL
            reasoning = f"Linear scan of {corpus_size} items - RLM recommended for reliability"
        else:  # O(n²)
            recommendation = ExecutionRecommendation.RLM_REQUIRED
            reasoning = f"O(n²) complexity: {expected_calls} comparisons - MUST use RLM"

        return ComplexityAnalysis(
            complexity_class=detected_class,
            expected_calls=expected_calls,
            recommendation=recommendation,
            reasoning=reasoning,
        )
```

#### 4.2.4 Complexity Ceiling and Forced Decomposition

**Status**: 🆕 NEW from architecture review (2026-01-08)

The original RLM shifted complexity to code generation without bounding it. Root LLM can still generate flawed code for complex problems.

**Architecture Review Finding**: "If the problem space is truly O(n²), the Python code required to solve it becomes exponentially harder to write correctly."

```python
"""
Module: agents/rlm/complexity_ceiling.py
Purpose: Detect and enforce complexity ceiling

Architecture Review: "RLM shifts complexity without removing it.
Root LLM still must mentally model O(n²) logic."
"""

class RLMExecutorV2:
    """
    RLM Executor with complexity ceiling.
    
    If O(n²) or >50 branches: FORBIDDEN from direct solution.
    Must decompose into simpler sub-tasks.
    """
    
    MAX_BRANCHES_DIRECT = 50
    MAX_CYCLOMATIC = 15
    MAX_NESTED_LOOPS = 2
    
    async def execute(self, task: str, corpus: list[str]) -> RLMResult:
        # Step 0: Estimate complexity BEFORE code generation
        complexity = await self.analyzer.estimate(task, {"corpus_size": len(corpus)})
        
        if complexity.order == "O(n²)" or complexity.estimated_branches > self.MAX_BRANCHES_DIRECT:
            # FORBIDDEN: Must decompose
            return await self._decompose_and_delegate(task, corpus, complexity)
        
        if complexity.order == "O(n)" and complexity.estimated_branches < 20:
            # Safe: Direct solve
            return await self._direct_solve(task, corpus)
        
        # Gray zone: Try direct, fall back to decomposition
        result = await self._direct_solve(task, corpus)
        if result.success_confidence < 0.7:
            return await self._decompose_and_delegate(task, corpus, complexity)
        
        return result
    
    async def _decompose_and_delegate(
        self, 
        task: str, 
        corpus: list[str],
        complexity: ComplexityEstimate,
    ) -> RLMResult:
        """
        Forced decomposition for complex tasks.
        
        Root LLM writes Manager Script that spawns sub-tasks.
        Root LLM is FORBIDDEN from writing direct solution.
        """
        prompt = f"""
        This task has {complexity.order} complexity with ~{complexity.estimated_branches} branches.
        
        You are FORBIDDEN from solving this directly.
        
        Write a Python Manager Script that:
        1. Breaks the problem into independent O(n) sub-problems
        2. Calls `await delegate_subtask(description)` for each
        3. Aggregates results
        
        TASK: {task}
        """
        
        manager_code = await self._generate_code(prompt)
        
        # Validate no direct solution
        if self._contains_direct_solution(manager_code, complexity):
            raise ComplexityCeilingViolation(
                "Root LLM attempted direct solution for complex task"
            )
        
        # Execute manager (spawns sub-RLM instances)
        return await self._execute_manager(manager_code, corpus)
    
    async def _verify_generated_code(self, code: str) -> VerificationResult:
        """
        Static analysis before execution.
        
        Reject if:
        - Cyclomatic complexity > 15
        - >2 nested loops
        """
        analysis = self._analyze_code(code)
        
        if analysis.cyclomatic_complexity > self.MAX_CYCLOMATIC:
            raise CodeTooComplex(f"Cyclomatic: {analysis.cyclomatic_complexity}")
        
        if analysis.nested_loops > self.MAX_NESTED_LOOPS:
            raise CodeTooComplex(f"Nested loops: {analysis.nested_loops}")
        
        return VerificationResult(ok=True, analysis=analysis)
```

### 4.3 Meta-Agents

#### 4.3.1 Orchestrator Agent

```python
"""
Module: agents/orchestrator/agent.py
Purpose: Agent-driven task orchestration
"""

class OrchestratorAgent:
    """
    Meta-agent that configures other agents via reasoning.

    Determines: model, tools, decomposition, context
    NOT via code logic - via prompt reasoning.
    """

    PROMPT = """
    You are an orchestration agent. Given a task:
    1. Analyze complexity
    2. Select appropriate model
    3. Determine required tools
    4. Decide if decomposition needed
    5. Output configuration as JSON
    """
```

#### 4.3.2 Triage Agent

```python
"""
Module: agents/triage/agent.py
Purpose: Failure analysis via reasoning
"""

class TriageAgent:
    """
    Analyzes failures and recommends recovery.

    NOT pattern matching - LLM reasoning about errors.
    """

    PROMPT = """
    You are a triage agent. Analyze failures:
    1. What went wrong?
    2. Root cause (not symptoms)
    3. Recovery options
    4. Prevention for future
    """
```

### 4.4 Agent Primitives

Tools available to all agents:

```python
"""
Module: agents/primitives/__init__.py
Purpose: Tools for agents
"""

# File Operations
async def file_read(path: str) -> str: ...
async def file_write(path: str, content: str) -> None: ...
async def file_search(pattern: str, query: str = None) -> list[str]: ...

# Memory Operations
async def memory_query(question: str) -> str: ...
async def memory_store(content: str, layer: int, metadata: dict) -> str: ...

# Inter-Agent
async def request_help(specialist: str, question: str) -> str: ...

# External
async def web_search(query: str) -> list[dict]: ...
async def fetch_url(url: str) -> str: ...
```

### 4.5 Sandbox Abstraction

```python
"""
Module: agents/sandbox/service.py
Purpose: Dagger/E2B abstraction
"""

class SandboxService:
    """
    Unified interface for agent sandboxes.

    Backends: Dagger (fast, local, FREE via OAuth), E2B (cloud, parallel)

    CRITICAL: Use Dagger LIBRARY mode, not module mode.
    Module mode has a bug that overwrites user code with templates.
    See: docs/decisions/dagger-library-mode-2026-01-07.md
    """

    async def create(self, backend: str = "dagger") -> Sandbox:
        """Create isolated sandbox."""

    async def execute(self, sandbox: Sandbox, command: str) -> ExecutionResult:
        """Execute command in sandbox."""

    async def export_files(self, sandbox: Sandbox, container_path: str, host_path: str) -> None:
        """Export files from container back to host."""
```

**Dagger Library Mode Pattern:**

```python
# CORRECT: Library mode (dagger.Connection)
async with dagger.Connection() as client:
    container = (
        client.container()
        .from_("python:3.11-slim")
        .with_directory("/workspace", client.host().directory(str(repo_dir)))
        .with_exec(["python", "agent.py"])
    )
    await container.sync()
    # Export results back
    await container.directory("/workspace").export("./output")

# WRONG: Module mode (@function decorators) - has template overwrite bug
```

### 4.6 Agent Execution Patterns

How agents execute tasks in isolation and return results to the host.

#### 4.6.1 The File Sync Problem

Dagger containers are isolated by design. `with_mounted_directory()` provides **read-only** input. Changes made inside containers don't automatically sync back.

**Three solutions, escalating in capability:**

| Approach | Use Case | Audit Trail | Complexity |
|----------|----------|-------------|------------|
| Directory Export | Single agent, simple tasks | None | Low |
| Git Branch Pattern | Parallel agents, production | Full git history | Medium |
| PR-Based Workflow | Team review required | PR + approvals | High |

#### 4.6.2 Directory Export (Simple)

For single-agent execution where audit trail isn't critical:

```python
"""
Module: agents/sandbox/patterns/export.py
Purpose: Simple file export after agent execution
"""

async def execute_with_export(
    task: str,
    repo_dir: Path,
    output_dir: Path,
) -> ExecutionResult:
    """
    Run agent and export modified files.
    
    Files are exported to output_dir after completion.
    Host can then review/merge changes.
    """
    async with dagger.Connection() as client:
        container = (
            client.container()
            .from_("python:3.11-slim")
            .with_directory("/workspace", client.host().directory(str(repo_dir)))
            .with_exec(["claude", "--print", task])
        )
        
        # Wait for completion
        await container.sync()
        
        # Export modified workspace
        await container.directory("/workspace").export(str(output_dir))
        
        return ExecutionResult(
            success=True,
            output_path=output_dir,
        )
```

#### 4.6.3 Git Branch Pattern (Recommended for Production)

Each agent works on its own branch. Full audit trail via git history.

**CRITICAL UPDATE (2026-01-11): Clone-vs-Mount Strategy**

The original implementation mounted local repos into containers and synced changes back. This caused data loss when container state overwrote local uncommitted changes.

**New Strategy:**

| Mode | Trigger | Behavior | Use Case |
|------|---------|----------|----------|
| **Pipeline Mode** | `branch` specified | Clone from remote, push from container, NO sync back | Production, parallel agents |
| **Testing Mode** | `branch` not specified | Mount local, sync back | Development iteration |

**Pipeline Mode (Isolated):**
```python
# Clone fresh from remote (container is isolated)
container = container.with_exec(["git", "clone", "$CLONE_URL", "/home/agent/repo"])

# Agent works in isolation...

# Commit and push FROM container (never syncs to host)
container = container.with_exec(["git", "commit", "-m", message])
container = container.with_exec(["git", "push", "origin", branch])

# Container discarded - local repo UNCHANGED
```

**Testing Mode (Synced):**
```python
# Mount local repo (read-write)
container = container.with_mounted_directory("/home/agent/repo", client.host().directory(str(repo_path)))

# Agent works...

# Sync changes back to host
await container.directory("/home/agent/repo").export(str(repo_path))
```

See `skills/dagger-execution/SKILL.md` for full documentation.

---

**Original Pattern (for reference):**

```python
"""
Module: agents/sandbox/patterns/git_branch.py
Purpose: Git-based file sync with full audit trail

FedRAMP Controls: AU-3 (audit records), CM-3 (change control)
"""

async def execute_with_git_branch(
    task_id: str,
    task: str,
    repo_dir: Path,
    base_branch: str = "main",
) -> GitExecutionResult:
    """
    Run agent on dedicated branch, push changes.
    
    Benefits:
    - Full audit trail (git commits)
    - No merge conflicts (each agent has own branch)
    - Easy review via PR
    - Rollback capability
    
    Args:
        task_id: Unique identifier for this task
        task: The task description for the agent
        repo_dir: Path to the git repository
        base_branch: Branch to create from (default: main)
    
    Returns:
        GitExecutionResult with branch name and commit info
    """
    branch_name = f"agent/{task_id}"
    
    async with dagger.Connection() as client:
        # Mount repo and credentials
        container = (
            client.container()
            .from_("python:3.11-slim")
            # Install git and claude
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git"])
            .with_exec(["sh", "-c", "curl -fsSL https://claude.ai/install.sh | sh"])
            # Mount OAuth credentials for FREE execution
            .with_mounted_directory(
                "/root/.claude-container",
                client.host().directory(str(Path.home() / ".claude-container"))
            )
            # Mount repository
            .with_directory("/workspace", client.host().directory(str(repo_dir)))
            .with_workdir("/workspace")
            # Configure git
            .with_exec(["git", "config", "user.email", "agent@commandcenter.ai"])
            .with_exec(["git", "config", "user.name", f"CC3 Agent ({task_id})"])
            # Create agent branch
            .with_exec(["git", "checkout", "-b", branch_name])
            # Run the agent
            .with_exec([
                "claude", "--print",
                "--dangerously-skip-permissions",
                task
            ])
            # Stage all changes
            .with_exec(["git", "add", "-A"])
            # Commit with task context
            .with_exec([
                "git", "commit", "-m", f"Agent task: {task[:50]}...",
                "--allow-empty"  # In case no changes
            ])
            # Push to remote
            .with_exec(["git", "push", "origin", branch_name, "--force"])
        )
        
        # Execute and get commit hash
        result = await container.with_exec(["git", "rev-parse", "HEAD"]).stdout()
        commit_hash = result.strip()
        
        return GitExecutionResult(
            success=True,
            branch=branch_name,
            commit=commit_hash,
            task_id=task_id,
        )
```

#### 4.6.4 Parallel Agent Execution

Run multiple agents simultaneously, each on their own branch:

```python
"""
Module: agents/sandbox/patterns/parallel.py
Purpose: Parallel agent execution with git isolation
"""

async def execute_parallel_agents(
    tasks: list[AgentTask],
    repo_dir: Path,
) -> list[GitExecutionResult]:
    """
    Execute multiple agents in parallel.
    
    Each agent gets:
    - Isolated container
    - Own git branch
    - Own OAuth session (FREE via Claude Max)
    
    No conflicts possible - branches are independent.
    
    Example:
        tasks = [
            AgentTask(id="task-1", prompt="Implement audit service"),
            AgentTask(id="task-2", prompt="Add signature verification"),
            AgentTask(id="task-3", prompt="Create workflow engine"),
        ]
        results = await execute_parallel_agents(tasks, repo_dir)
        # All 3 run simultaneously, each on agent/task-{id} branch
    """
    async with dagger.Connection() as client:
        # Create all agent tasks
        agent_tasks = [
            _create_agent_container(client, task, repo_dir)
            for task in tasks
        ]
        
        # Execute in parallel
        results = await asyncio.gather(*agent_tasks, return_exceptions=True)
        
        return [
            r if not isinstance(r, Exception) 
            else GitExecutionResult(success=False, error=str(r))
            for r in results
        ]


async def _create_agent_container(
    client: dagger.Client,
    task: AgentTask,
    repo_dir: Path,
) -> GitExecutionResult:
    """Create and execute a single agent container."""
    branch_name = f"agent/{task.id}"
    
    container = (
        client.container()
        .from_("python:3.11-slim")
        # ... same setup as execute_with_git_branch
        .with_exec(["git", "checkout", "-b", branch_name])
        .with_exec(["claude", "--print", task.prompt])
        .with_exec(["git", "add", "-A"])
        .with_exec(["git", "commit", "-m", f"Agent: {task.prompt[:50]}"])
        .with_exec(["git", "push", "origin", branch_name, "--force"])
    )
    
    commit = await container.with_exec(["git", "rev-parse", "HEAD"]).stdout()
    
    return GitExecutionResult(
        success=True,
        branch=branch_name,
        commit=commit.strip(),
        task_id=task.id,
    )
```

#### 4.6.5 Merging Agent Results

After parallel execution, merge branches (with optional review):

```python
"""
Module: agents/sandbox/patterns/merge.py
Purpose: Merge agent branches back to main
"""

class MergeStrategy(Enum):
    AUTO = "auto"           # Merge if no conflicts
    PR = "pr"               # Create PR for review
    SQUASH = "squash"       # Squash merge all commits


async def merge_agent_branches(
    results: list[GitExecutionResult],
    repo_dir: Path,
    strategy: MergeStrategy = MergeStrategy.AUTO,
) -> MergeResult:
    """
    Merge completed agent branches.
    
    Strategies:
    - AUTO: Fast-forward or merge if no conflicts
    - PR: Create GitHub PR for human review
    - SQUASH: Combine all agent commits into one
    """
    if strategy == MergeStrategy.PR:
        # Create PRs via GitHub API
        prs = []
        for result in results:
            if result.success:
                pr = await create_pr(
                    repo_dir,
                    head=result.branch,
                    base="main",
                    title=f"Agent task: {result.task_id}",
                    body=f"Automated changes from agent execution.\n\nCommit: {result.commit}",
                )
                prs.append(pr)
        return MergeResult(strategy=strategy, pull_requests=prs)
    
    elif strategy == MergeStrategy.AUTO:
        # Attempt automatic merge
        merged = []
        conflicts = []
        for result in results:
            if result.success:
                try:
                    await git_merge(repo_dir, result.branch)
                    merged.append(result.branch)
                except MergeConflict as e:
                    conflicts.append((result.branch, e))
        return MergeResult(
            strategy=strategy,
            merged=merged,
            conflicts=conflicts,
        )
```

#### 4.6.6 Complete AEF Executor with Dependency Handling

**CRITICAL**: This section addresses the dependency graph and branch isolation problem.

```python
"""
Module: agents/sandbox/aef_executor.py
Purpose: Execute AEF tasks respecting dependencies

Handles the critical challenge: Tasks with dependencies need changes from
previous tasks, but parallel git branches don't see each other's changes.

Solution: Wave-based execution with sequential merging between waves.
"""

from dataclasses import dataclass
from collections import defaultdict
import networkx as nx


@dataclass
class AEFTask:
    """Task from AEF document."""
    id: str
    name: str
    dependencies: list[str]
    instruction: str
    context: dict
    acceptance_criteria: list[dict]
    on_failure: dict


@dataclass
class ExecutionWave:
    """Tasks that can execute in parallel (no dependencies between them)."""
    wave_number: int
    tasks: list[AEFTask]


class AEFExecutor:
    """
    Executes AEF tasks with dependency-aware parallel execution.

    Strategy:
    1. Build dependency graph from AEF
    2. Compute execution waves (topological sort)
    3. Execute each wave in parallel
    4. Merge wave results to main before next wave

    This ensures tasks see their dependencies' changes.
    """

    def __init__(self, repo_dir: Path, merge_strategy: str = "auto"):
        self.repo_dir = repo_dir
        self.merge_strategy = merge_strategy

    async def execute(
        self,
        aef_doc: dict,
        max_parallel: int = 5,
    ) -> ExecutionResult:
        """
        Execute all tasks in AEF document.

        Steps:
        1. Parse AEF and build dependency graph
        2. Compute execution waves (topological layers)
        3. For each wave:
           a. Execute all tasks in parallel (no deps between them)
           b. Wait for completion
           c. Merge successful branches to main
           d. Delete branches
        4. Return results
        """
        # Step 1: Build dependency graph
        tasks = self._parse_aef(aef_doc)
        graph = self._build_dependency_graph(tasks)

        # Step 2: Compute execution waves
        waves = self._compute_waves(graph, tasks, max_parallel)

        # Step 3: Execute wave by wave
        all_results = []
        failed_tasks = []

        for wave in waves:
            print(f"\n🌊 Wave {wave.wave_number}: {len(wave.tasks)} tasks")

            # Execute wave in parallel
            wave_results = await self._execute_wave(wave)
            all_results.extend(wave_results)

            # Separate successes and failures
            successes = [r for r in wave_results if r.success]
            failures = [r for r in wave_results if not r.success]
            failed_tasks.extend(failures)

            # If any failures, decide whether to continue
            if failures:
                print(f"❌ {len(failures)} tasks failed in wave {wave.wave_number}")
                if not await self._handle_wave_failures(failures, wave):
                    break  # Stop execution

            # Merge successful branches to main
            if successes:
                await self._merge_wave_to_main(successes)

            # Clean up branches
            await self._cleanup_wave_branches(wave_results)

        return ExecutionResult(
            total_tasks=len(tasks),
            completed=[r for r in all_results if r.success],
            failed=failed_tasks,
            waves=len(waves),
        )

    def _build_dependency_graph(
        self,
        tasks: list[AEFTask]
    ) -> nx.DiGraph:
        """
        Build directed graph of task dependencies.

        Edge A→B means "A must complete before B starts"
        """
        G = nx.DiGraph()

        # Add all tasks as nodes
        for task in tasks:
            G.add_node(task.id, task=task)

        # Add dependency edges
        for task in tasks:
            for dep_id in task.dependencies:
                if dep_id not in G:
                    raise ValueError(f"Task {task.id} depends on unknown task {dep_id}")
                G.add_edge(dep_id, task.id)  # dep_id must complete first

        # Check for cycles
        if not nx.is_directed_acyclic_graph(G):
            cycles = list(nx.simple_cycles(G))
            raise ValueError(f"Circular dependencies detected: {cycles}")

        return G

    def _compute_waves(
        self,
        graph: nx.DiGraph,
        tasks: list[AEFTask],
        max_parallel: int,
    ) -> list[ExecutionWave]:
        """
        Compute execution waves via topological sort.

        Wave 0: Tasks with no dependencies
        Wave 1: Tasks that only depend on Wave 0
        Wave 2: Tasks that only depend on Waves 0-1
        ...

        Also respects max_parallel limit by splitting large waves.
        """
        waves = []
        tasks_by_id = {t.id: t for t in tasks}
        remaining = set(graph.nodes())
        wave_num = 0

        while remaining:
            # Find tasks with all dependencies satisfied
            ready = {
                node for node in remaining
                if all(dep not in remaining for dep in graph.predecessors(node))
            }

            if not ready:
                # Shouldn't happen if graph is acyclic
                raise ValueError(f"Deadlock detected with remaining tasks: {remaining}")

            # Group ready tasks into waves (respect max_parallel)
            ready_list = list(ready)
            for i in range(0, len(ready_list), max_parallel):
                wave_tasks = ready_list[i:i + max_parallel]
                waves.append(ExecutionWave(
                    wave_number=wave_num,
                    tasks=[tasks_by_id[tid] for tid in wave_tasks],
                ))
                wave_num += 1

            # Remove ready tasks from remaining
            remaining -= ready

        return waves

    async def _execute_wave(
        self,
        wave: ExecutionWave
    ) -> list[GitExecutionResult]:
        """
        Execute all tasks in wave in parallel.

        Each task:
        1. Branches from current main (which has previous waves' changes)
        2. Runs agent in isolated container
        3. Commits and pushes to its branch
        4. Runs acceptance criteria
        """
        results = []

        async with dagger.Connection() as client:
            # Create containers for all wave tasks
            containers = [
                self._create_task_container(client, task)
                for task in wave.tasks
            ]

            # Execute in parallel
            wave_results = await asyncio.gather(*containers, return_exceptions=True)

            # Process results
            for task, result in zip(wave.tasks, wave_results):
                if isinstance(result, Exception):
                    results.append(GitExecutionResult(
                        success=False,
                        task_id=task.id,
                        error=str(result),
                    ))
                else:
                    # Run acceptance criteria
                    acceptance_passed = await self._run_acceptance_criteria(
                        result.branch,
                        task.acceptance_criteria
                    )

                    result.acceptance_passed = acceptance_passed
                    results.append(result)

        return results

    async def _create_task_container(
        self,
        client: dagger.Client,
        task: AEFTask,
    ) -> GitExecutionResult:
        """
        Create container for single task execution.

        CRITICAL: Branches from current main, which includes all previous
        waves' merged changes. This ensures dependencies are satisfied.
        """
        branch_name = f"agent/{task.id}"

        # Pull latest main first (has previous waves' changes)
        subprocess.run(
            ["git", "pull", "origin", "main"],
            cwd=self.repo_dir,
            check=True,
        )

        container = (
            client.container()
            .from_("python:3.11-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git"])
            .with_exec(["sh", "-c", "curl -fsSL https://claude.ai/install.sh | sh"])
            # Mount OAuth credentials
            .with_mounted_directory(
                "/root/.claude-container",
                client.host().directory(str(Path.home() / ".claude-container"))
            )
            # Mount repo (with latest main)
            .with_directory("/workspace", client.host().directory(str(self.repo_dir)))
            .with_workdir("/workspace")
            # Configure git
            .with_exec(["git", "config", "user.email", "agent@cc3.ai"])
            .with_exec(["git", "config", "user.name", f"CC3 Agent ({task.id})"])
            # Pull main and create branch
            .with_exec(["git", "fetch", "origin", "main"])
            .with_exec(["git", "checkout", "main"])
            .with_exec(["git", "pull", "origin", "main"])
            .with_exec(["git", "checkout", "-b", branch_name])
            # Run agent
            .with_exec([
                "claude", "--print",
                "--dangerously-skip-permissions",
                task.instruction
            ])
            # Commit changes
            .with_exec(["git", "add", "-A"])
            .with_exec([
                "git", "commit", "-m",
                f"Agent: {task.name}\n\nTask ID: {task.id}",
                "--allow-empty"
            ])
            # Push branch
            .with_exec(["git", "push", "origin", branch_name, "--force"])
        )

        # Get commit hash
        commit = await container.with_exec(["git", "rev-parse", "HEAD"]).stdout()

        return GitExecutionResult(
            success=True,
            branch=branch_name,
            commit=commit.strip(),
            task_id=task.id,
        )

    async def _run_acceptance_criteria(
        self,
        branch: str,
        criteria: list[dict],
    ) -> bool:
        """
        Run acceptance tests on branch.

        Returns True if all criteria pass.
        """
        # Checkout branch
        subprocess.run(
            ["git", "checkout", branch],
            cwd=self.repo_dir,
            check=True,
        )

        for criterion in criteria:
            command = criterion.get("command")
            if not command:
                continue

            result = subprocess.run(
                command,
                cwd=self.repo_dir,
                shell=True,
                capture_output=True,
            )

            if result.returncode != 0:
                print(f"❌ Acceptance failed: {criterion['criterion']}")
                print(f"   Command: {command}")
                print(f"   Error: {result.stderr.decode()}")
                return False

        print(f"✅ All acceptance criteria passed for {branch}")
        return True

    async def _merge_wave_to_main(
        self,
        successes: list[GitExecutionResult],
    ) -> None:
        """
        Merge successful branches to main sequentially.

        Sequential merging ensures:
        1. No merge conflicts between wave tasks
        2. Next wave sees all previous changes
        """
        # Checkout main
        subprocess.run(
            ["git", "checkout", "main"],
            cwd=self.repo_dir,
            check=True,
        )

        for result in successes:
            if not result.acceptance_passed:
                print(f"⏭️  Skipping {result.branch} (acceptance failed)")
                continue

            print(f"🔀 Merging {result.branch} to main...")

            try:
                # Merge branch to main
                subprocess.run(
                    ["git", "merge", "--no-ff", result.branch, "-m",
                     f"Merge agent branch: {result.task_id}"],
                    cwd=self.repo_dir,
                    check=True,
                )

                # Push main
                subprocess.run(
                    ["git", "push", "origin", "main"],
                    cwd=self.repo_dir,
                    check=True,
                )

                print(f"✅ Merged {result.branch}")

            except subprocess.CalledProcessError as e:
                print(f"❌ Merge conflict for {result.branch}: {e}")
                # Abort merge
                subprocess.run(["git", "merge", "--abort"], cwd=self.repo_dir)
                result.merge_failed = True

    async def _cleanup_wave_branches(
        self,
        results: list[GitExecutionResult],
    ) -> None:
        """Delete wave branches after merging."""
        for result in results:
            try:
                subprocess.run(
                    ["git", "branch", "-D", result.branch],
                    cwd=self.repo_dir,
                )
                subprocess.run(
                    ["git", "push", "origin", "--delete", result.branch],
                    cwd=self.repo_dir,
                )
            except:
                pass  # Branch might not exist

    async def _handle_wave_failures(
        self,
        failures: list[GitExecutionResult],
        wave: ExecutionWave,
    ) -> bool:
        """
        Handle failures in wave.

        Returns True to continue execution, False to stop.
        """
        print(f"\n🚨 Wave {wave.wave_number} failures:")
        for failure in failures:
            print(f"  • {failure.task_id}: {failure.error}")

        # TODO: Invoke triage agent for analysis
        # TODO: Check retry configuration

        # For now, continue with next wave
        return True
```

**Why This Works:**

1. **Dependency Satisfaction**: Tasks in Wave N only start after Wave N-1 is merged to main
2. **No Branch Conflicts**: Tasks in same wave are independent (by construction)
3. **Audit Trail**: Full git history of each task
4. **Rollback**: Can revert individual wave merges
5. **Acceptance Gating**: Failed acceptance tests block merge

**Tradeoffs:**

- **Slower than pure parallel**: Sequential merging between waves adds overhead
- **But correct**: Ensures dependencies are satisfied
- **And safe**: No risk of conflicting changes

#### 4.6.7 Multi-Provider Subscription System

**Problem**: Current system only supports Claude Max subscription. Users want choice of AI providers (Claude, ChatGPT Plus, Gemini Pro, z.ai) with priority-based fallback, avoiding pay-per-token API costs.

**Solution**: Provider abstraction with OAuth credential mounting and user-defined fallback chains.

##### 4.6.7.1 Provider Abstraction

```python
"""
Module: agents/sandbox/providers.py
Purpose: Multi-provider subscription management with priority fallback
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

@dataclass
class ProviderConfig:
    """Configuration for an AI provider."""
    name: str  # "claude", "chatgpt", "gemini", "zai"
    display_name: str  # "Claude Max", "ChatGPT Plus", "Gemini Pro", "z.ai"
    auth_type: Literal["oauth", "api_key"]
    credentials_path: Path  # e.g., ~/.claude-container, ~/.chatgpt-session
    priority: int  # User-defined fallback order (1 = first choice)
    enabled: bool  # User can disable providers
    supports_code_execution: bool = True
    cli_command: str = "claude"  # CLI tool to invoke in container

    @property
    def is_available(self) -> bool:
        """Check if credentials exist and are valid."""
        if self.auth_type == "oauth":
            return (self.credentials_path / "credentials.json").exists()
        else:
            # Check for API key in env
            return os.getenv(f"{self.name.upper()}_API_KEY") is not None


class ProviderChain:
    """Manages fallback chain of subscription providers."""

    def __init__(self, api_fallback_enabled: bool = False):
        self.providers = self._load_providers()
        self.api_fallback_enabled = api_fallback_enabled

    def get_active_provider(self) -> ProviderConfig:
        """
        Returns first available provider in priority order.

        Strategy:
        1. Try OAuth providers in priority order (subscription-based)
        2. Only try API key providers if api_fallback_enabled=True
        3. Raise error if no providers available
        """
        sorted_providers = sorted(
            [p for p in self.providers if p.enabled],
            key=lambda p: p.priority
        )

        # Try OAuth providers first (free via subscriptions)
        for provider in sorted_providers:
            if provider.is_available and provider.auth_type == "oauth":
                return provider

        # Only fall back to API keys if explicitly enabled
        if self.api_fallback_enabled:
            for provider in sorted_providers:
                if provider.auth_type == "api_key" and provider.is_available:
                    return provider

        raise NoProviderAvailableError(
            "No subscription providers available. "
            "Run 'cc3 auth capture <provider>' to set up credentials."
        )

    def _load_providers(self) -> list[ProviderConfig]:
        """Load provider configuration from user settings."""
        # Read from ~/.config/commandcenter/providers.yaml
        config_path = Path.home() / ".config" / "commandcenter" / "providers.yaml"

        if not config_path.exists():
            return self._default_providers()

        with open(config_path) as f:
            return [ProviderConfig(**p) for p in yaml.safe_load(f)["providers"]]

    def _default_providers(self) -> list[ProviderConfig]:
        """Default provider configuration."""
        return [
            ProviderConfig(
                name="claude",
                display_name="Claude Max",
                auth_type="oauth",
                credentials_path=Path.home() / ".claude-container",
                priority=1,
                enabled=True,
                cli_command="claude",
            ),
            ProviderConfig(
                name="chatgpt",
                display_name="ChatGPT Plus",
                auth_type="oauth",
                credentials_path=Path.home() / ".chatgpt-session",
                priority=2,
                enabled=True,
                cli_command="chatgpt-cli",
            ),
            ProviderConfig(
                name="gemini",
                display_name="Gemini Pro",
                auth_type="oauth",
                credentials_path=Path.home() / ".gemini-session",
                priority=3,
                enabled=True,
                cli_command="gemini-cli",
            ),
            ProviderConfig(
                name="zai",
                display_name="z.ai",
                auth_type="oauth",
                credentials_path=Path.home() / ".zai-session",
                priority=4,
                enabled=True,
                cli_command="zai-cli",
            ),
        ]
```

##### 4.6.7.2 CLI Auth Capture

**User Interface**:
```bash
# Capture OAuth credentials from browser
cc3 auth capture chatgpt

# List all provider status
cc3 auth status

# Test provider connection
cc3 auth test chatgpt

# Remove provider credentials
cc3 auth remove chatgpt
```

**Implementation**:
```python
"""
Module: cli/auth.py
Purpose: Extract browser OAuth credentials for AI providers
"""

import sqlite3
import json
import sys
from pathlib import Path
from datetime import datetime

class AuthCapture:
    """Captures browser session credentials for AI providers."""

    PROVIDER_CONFIGS = {
        "chatgpt": {
            "domain": "chat.openai.com",
            "required_cookies": ["__Secure-next-auth.session-token"],
            "storage_keys": ["oai-did"],
            "output_path": Path.home() / ".chatgpt-session",
        },
        "gemini": {
            "domain": "gemini.google.com",
            "required_cookies": ["__Secure-1PSID", "__Secure-1PSIDTS"],
            "storage_keys": ["google_oauth_token"],
            "output_path": Path.home() / ".gemini-session",
        },
        "zai": {
            "domain": "z.ai",
            "required_cookies": ["session", "auth_token"],
            "storage_keys": [],
            "output_path": Path.home() / ".zai-session",
        },
    }

    def capture(self, provider: str):
        """
        Capture browser credentials for provider.

        Steps:
        1. Detect browser (Chrome/Firefox/Safari)
        2. Find browser profile directory
        3. Read cookies database (SQLite)
        4. Extract required cookies for domain
        5. Read localStorage if needed
        6. Write to provider output path as JSON

        Security:
        - Credentials stored with 600 permissions (owner only)
        - Never transmitted anywhere
        - Only mounted into local Dagger containers
        """

        if provider not in self.PROVIDER_CONFIGS:
            raise ValueError(f"Unknown provider: {provider}")

        config = self.PROVIDER_CONFIGS[provider]
        browser = self._detect_browser()

        print(f"📡 Capturing {provider} credentials from {browser}...")
        print(f"   Make sure you're logged into {config['domain']} in your browser")

        cookies = self._extract_cookies(browser, config["domain"], config["required_cookies"])
        storage = self._extract_local_storage(browser, config["domain"], config["storage_keys"])

        # Save credentials
        credentials = {
            "provider": provider,
            "cookies": cookies,
            "localStorage": storage,
            "captured_at": datetime.now().isoformat(),
            "browser": browser,
        }

        config["output_path"].mkdir(parents=True, exist_ok=True)
        cred_file = config["output_path"] / "credentials.json"

        with open(cred_file, "w") as f:
            json.dump(credentials, f, indent=2)

        # Set secure permissions
        cred_file.chmod(0o600)

        print(f"✅ Credentials saved to {config['output_path']}")
        print(f"⚠️  Keep this directory private - it contains your session!")

    def _detect_browser(self) -> str:
        """Detect which browser is installed and has cookies."""
        if sys.platform == "darwin":
            chrome_cookies = Path.home() / "Library/Application Support/Google/Chrome/Default/Cookies"
            if chrome_cookies.exists():
                return "chrome"
        # ... similar for firefox, safari, edge
        raise RuntimeError("No supported browser found")

    def _extract_cookies(self, browser: str, domain: str, required: list[str]) -> dict:
        """
        Extract cookies from browser's SQLite database.

        Chrome/Edge encrypt cookies - need to decrypt.
        Firefox stores cookies in plain text.
        """
        if browser == "chrome":
            db_path = self._get_chrome_cookies_path()
            return self._decrypt_chrome_cookies(db_path, domain, required)
        elif browser == "firefox":
            db_path = self._get_firefox_cookies_path()
            return self._read_firefox_cookies(db_path, domain, required)
        # ... similar for other browsers

    def _decrypt_chrome_cookies(self, db_path: Path, domain: str, required: list[str]) -> dict:
        """Decrypt Chrome cookies using system keychain."""
        # Chrome stores encrypted cookies
        # macOS: Use keychain to get encryption key
        # Linux: Use libsecret
        # Windows: Use DPAPI
        # Implementation details platform-specific
        pass
```

##### 4.6.7.3 Container Integration

**Modified executor to support multiple providers**:

```python
"""
Module: agents/sandbox/executor.py
Purpose: Execute agents with provider fallback chain
"""

def _create_task_container(
    self,
    client: dagger.Client,
    task: AEFTask,
) -> Container:
    """Create container with active provider credentials mounted."""

    # Get active provider from chain
    provider_chain = ProviderChain(api_fallback_enabled=False)
    provider = provider_chain.get_active_provider()

    print(f"🤖 Using provider: {provider.display_name}")

    container = (
        client.container()
        .from_("python:3.11-slim")
        .with_exec(["apt-get", "update"])
        .with_exec(["apt-get", "install", "-y", "git", "curl"])
    )

    # Install provider CLI
    if provider.name == "claude":
        container = container.with_exec([
            "sh", "-c",
            "curl -fsSL https://claude.ai/install.sh | sh"
        ])
    elif provider.name == "chatgpt":
        container = container.with_exec([
            "pip", "install", "chatgpt-cli"
        ])
    # ... similar for other providers

    # Mount provider credentials
    container = container.with_mounted_directory(
        f"/root/{provider.credentials_path.name}",
        client.host().directory(str(provider.credentials_path))
    )

    # Mount repo and run agent
    container = (
        container
        .with_directory("/workspace", client.host().directory(str(self.repo_dir)))
        .with_workdir("/workspace")
        .with_exec(["git", "config", "user.email", "agent@cc3.ai"])
        .with_exec(["git", "config", "user.name", f"CC3 Agent ({task.id})"])
        .with_exec(["git", "checkout", "-b", f"agent/{task.id}"])
        # Run agent with provider CLI
        .with_exec([
            provider.cli_command,
            "--dangerously-skip-permissions",
            task.instruction
        ])
    )

    return container
```

##### 4.6.7.4 Settings UI Integration

**Frontend: AI Providers Section**

```typescript
// frontend/src/components/Settings/ProvidersSection.tsx

interface Provider {
  id: string;
  name: string;
  displayName: string;
  status: "active" | "inactive" | "error";
  authType: "oauth" | "api_key";
  priority: number;
  enabled: boolean;
  lastUsed?: string;
  credentialsPath?: string;
}

function ProvidersSection() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [apiFallbackEnabled, setApiFallbackEnabled] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header with API fallback toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Provider Priority</h2>
          <p className="text-sm text-gray-400 mt-1">
            System tries providers from top to bottom. Drag to reorder.
          </p>
        </div>
        <Toggle
          label="API Key Fallback"
          checked={apiFallbackEnabled}
          onChange={setApiFallbackEnabled}
        />
      </div>

      {/* Provider cards with priority numbers, drag to reorder */}
      <div className="space-y-2">
        {providers
          .sort((a, b) => a.priority - b.priority)
          .map((provider, index) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              index={index}
              onMoveUp={() => moveProvider(provider.id, -1)}
              onMoveDown={() => moveProvider(provider.id, 1)}
              onToggle={() => toggleProvider(provider.id)}
              onTest={() => testProvider(provider.id)}
              onRecapture={() => showRecaptureInstructions(provider)}
              onRemove={() => removeProvider(provider.id)}
            />
          ))}
      </div>
    </div>
  );
}
```

**UI Features**:
- Large numbered badges (1, 2, 3...) showing fallback priority
- Up/down arrows to reorder providers
- Status indicators: Ready (green) / No Credentials (gray) / Error (red)
- Enable/Disable toggle per provider
- Actions: Test Connection, Recapture Auth, Remove
- API Key Fallback toggle (off by default)

**Recapture Flow**:
```
User clicks "Recapture Auth" on ChatGPT provider
→ Modal shows: "Run this command in your terminal:
               cc3 auth capture chatgpt"
→ User runs command in terminal
→ User clicks "I've captured credentials"
→ System tests connection
→ Provider status updates to "Ready"
```

#### 4.6.8 Execution Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AGENT EXECUTION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SPAWN                                                                    │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│     │  Agent 1    │  │  Agent 2    │  │  Agent 3    │                       │
│     │  Container  │  │  Container  │  │  Container  │                       │
│     │  branch/1   │  │  branch/2   │  │  branch/3   │                       │
│     └─────────────┘  └─────────────┘  └─────────────┘                       │
│           │                │                │                                │
│           ▼                ▼                ▼                                │
│  2. EXECUTE (parallel, isolated, FREE via OAuth)                            │
│           │                │                │                                │
│           ▼                ▼                ▼                                │
│  3. COMMIT + PUSH                                                           │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│     │ agent/task1 │  │ agent/task2 │  │ agent/task3 │                       │
│     │   pushed    │  │   pushed    │  │   pushed    │                       │
│     └─────────────┘  └─────────────┘  └─────────────┘                       │
│           │                │                │                                │
│           └────────────────┼────────────────┘                                │
│                            ▼                                                 │
│  4. MERGE (auto, PR, or squash)                                             │
│                     ┌─────────────┐                                          │
│                     │    main     │                                          │
│                     │  (merged)   │                                          │
│                     └─────────────┘                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 4.6.9 FedRAMP Compliance

The git-based pattern provides:

| Requirement | How It's Met |
|-------------|--------------|
| **AU-3 (Audit Records)** | Git commits capture who, what, when |
| **CM-3 (Change Control)** | Branch-per-agent, PR review option |
| **AU-10 (Non-repudiation)** | Git commit signatures (optional) |
| **AC-6 (Least Privilege)** | Containers run as non-root |

### 4.7 Long-Running Agent Orchestrator

**Status**: ✅ **IMPLEMENTED** in CC2 (`backend/app/services/long_running_orchestrator.py`)

For tasks that exceed a single context window, CC2/CC3 provides multi-session orchestration with PR + review workflow.

#### 4.7.1 The Problem

Single-session agents fail on complex tasks because:
- Context window fills up (~200k tokens)
- Auto-compact loses important details
- Agent declares "done" before actually completing
- No code review catches bugs early

#### 4.7.2 The Solution: Multi-Session with PR + Review

```
┌─────────────────────────────────────────────────────────────────┐
│  INITIALIZER (Session 1 - on main)                              │
│  - Creates AGENT_PROGRESS.md with goal & criteria               │
│  - Breaks task into incremental steps                           │
│  - Commits scaffolding to main                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CODER #1 (on branch: agent/step-1-xxx)                         │
│  - Reads AGENT_PROGRESS.md                                      │
│  - Picks ONE task from "Next Steps"                             │
│  - Completes it, updates progress file, commits                 │
│  - Branch pushed, PR created                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  REVIEWER (fresh context)                                       │
│  - Reviews the PR diff                                          │
│  - Runs tests                                                   │
│  - Approves or requests changes with specific feedback          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        [Issues Found]                  [Approved]
              │                               │
              ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│  FIXER (same branch)    │    │  MERGE PR               │
│  - Addresses feedback   │    │  - Squash merge to main │
│  - Commits fixes        │    │  - Delete branch        │
│  - Back to REVIEWER     │    │  - Pull latest main     │
└─────────────────────────┘    └─────────────────────────┘
                                             │
                                             ▼
                                      CODER #2 ...
```

#### 4.7.3 The Progress File (AGENT_PROGRESS.md)

```markdown
# AGENT_PROGRESS.md

## Project Goal
Implement user authentication with OAuth

## Success Criteria
- [x] Users can sign up with email/password
- [x] Users can log in and receive JWT token
- [ ] Protected routes require valid token
- [ ] All tests pass

## Current Status
Phase: 3 of 5
Last Agent: session-abc123
Last Action: Implemented JWT token generation

## Completed Work
1. [2026-01-07 14:30] Set up project structure - session-init
2. [2026-01-07 14:45] Added User model and signup endpoint - session-abc (PR #42)
3. [2026-01-07 15:02] Implemented JWT token generation - session-def (PR #43)

## Next Steps (for next agent)
1. Add authentication middleware for protected routes
2. Write integration tests for auth flow
3. Add password reset email flow

## Blockers / Notes
- Using bcrypt for password hashing
- JWT secret stored in environment variable
```

#### 4.7.4 API Endpoints

```
POST   /api/v1/agents/run-long           # Start long task with PR workflow
GET    /api/v1/agents/long-tasks/{id}    # Check status + PR cycles
POST   /api/v1/agents/long-tasks/{id}/stop  # Graceful stop
```

**Request Example**:
```bash
curl -X POST http://localhost:8001/api/v1/agents/run-long \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Implement user authentication",
    "success_criteria": [
      "Users can sign up",
      "Users can log in",
      "Tests pass"
    ],
    "use_pr_workflow": true,
    "max_review_rounds": 3
  }'
```

**Response includes PR cycles**:
```json
{
  "status": "completed",
  "total_sessions": 12,
  "pr_cycles": [
    {"branch": "agent/step-1-xxx", "pr_url": "https://...", "merged": true, "review_rounds": 2}
  ]
}
```

#### 4.7.5 Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Fresh context every session** | No exhaustion, full 200k tokens per session |
| **Incremental progress** | ONE task per session, not many partially |
| **External verification** | Separate reviewer agent checks each PR |
| **Fix loop** | Up to N rounds of review/fix before merge |
| **State in git** | Progress file + git history = full audit trail |

#### 4.7.6 Comparison to Simple Commit Mode

| Aspect | Simple Mode | PR Workflow |
|--------|-------------|-------------|
| Speed | Faster | Slower |
| Quality | Lower | Higher |
| Review | None | Every change |
| Recovery | Harder | Easier (branches) |
| Audit trail | Commits only | PRs + reviews |

**References**:
- `backend/app/services/long_running_orchestrator.py` - Implementation
- `backend/app/services/progress_protocol.py` - Progress file handling
- `skills/long-running-agents/SKILL.md` - Full documentation
- `backend/app/routers/agents.py` - API endpoints

---

## 5. Strategic Intelligence

The invisible engine powering CC3: **DISCOVER → VALIDATE → IMPROVE**

### 5.1 Core Principle: Invisible Machinery

Users see **ideas and results**, never the machinery:

| User Sees | Machinery (Hidden) |
|-----------|-------------------|
| "Here's something interesting" | Wander, Source Curator |
| "Confidence: 82%" | AI Arena, Hypothesis Engine |
| "Here's the analysis" | Multi-model synthesis |
| "Done. PR ready." | Agent orchestration, sandbox |

**This principle is non-negotiable.** If implementation exposes machinery, it's wrong.

### 5.2 DISCOVER - Finding What Matters

#### 5.2.1 Wander Agent

Long-running exploration that dwells in knowledge space:

```python
"""
Module: strategic/wander/agent.py
Purpose: Autonomous exploration and insight discovery
"""

class WanderAgent:
    """
    Discovers unexpected connections in knowledge space.

    Unlike task agents, Wander DWELLS. It doesn't try to
    answer questions—it tries to find interesting questions.

    Outputs: Resonances → Crystals
    """

    async def dwell(self, focus_areas: list[str] = None) -> None:
        """
        Continuous exploration loop.

        Uses RLM pattern for 10M+ token exploration:
        - Context as REPL variables (not LLM attention)
        - Sub-LLM spawning for chunk analysis
        """

    async def detect_resonance(self, chunks: list[str]) -> Resonance | None:
        """Detect when ideas unexpectedly connect."""

    async def crystallize(self, resonance: Resonance) -> Crystal:
        """Convert validated resonance into packaged insight."""
```

**Key concepts:**
- **Resonance**: When disparate knowledge unexpectedly connects
- **Dwelling**: Exploring without rushing to completion
- **Crystals**: Validated insights, packaged for use

#### 5.2.2 Source Curator

Background ingestion of external knowledge:

```python
"""
Module: strategic/curator/service.py
Purpose: External source ingestion
"""

class SourceCurator:
    """
    Ingests and processes external sources.

    Sources: HackerNews, arXiv, news, market data (configurable)
    Output: Indexed content in KnowledgeBeast
    """

    async def ingest(self, source_type: str) -> int:
        """Ingest from configured source, return count."""

    async def configure_sources(self, sources: list[SourceConfig]) -> None:
        """Configure which sources to monitor."""
```

#### 5.2.3 Idea Capture

All inputs flow into the Ideas system:

- Voice input from VISLZR/Ideas tab
- Text input from Ideas tab
- Imported documents
- Wander crystals
- User-created nodes

Ideas start fuzzy and crystallize over time.

### 5.3 VALIDATE - Building Confidence

#### 5.3.1 Hypothesis Engine

Decomposes ideas into testable claims:

```python
"""
Module: strategic/hypothesis/engine.py
Purpose: Decompose ideas into testable hypotheses
"""

class HypothesisEngine:
    """
    Breaks ideas into testable claims for validation.

    User inputs: "Should we add GraphQL?"
    Engine outputs:
      ├── Claim: "Would simplify frontend" → testable
      ├── Claim: "Good for nested queries" → testable
      ├── Claim: "Adds backend complexity" → testable
      └── Synthesis with confidence score
    """

    async def decompose(self, idea: str, context: dict) -> list[Hypothesis]:
        """Break idea into testable hypotheses."""

    async def validate(self, hypothesis: Hypothesis) -> ValidationResult:
        """Route hypothesis to appropriate validation method."""

    async def synthesize(self, results: list[ValidationResult]) -> Synthesis:
        """Combine results into overall assessment with confidence."""
```

#### 5.3.2 AI Arena v2 (Three-Layer Validation)

**Status**: 🔨 REDESIGNED based on architecture review (2026-01-08)

Multi-model consensus is necessary but not sufficient. Models share training data, so consensus can be correlated error. We now use **three-layer validation**.

**Architecture Review Finding**: "Consensus among Claude/GPT/Gemini is correlated error, not independent verification."

```python
"""
Module: strategic/arena/service.py
Purpose: Three-layer validation (invisible to users)

Architecture Review: Addresses "correlated errors in AI Arena"
"""

class AIArenaV2:
    """
    Three-layer validation:
    1. Model Consensus (diverse architectures)
    2. Adversarial Challenge (try to disprove)
    3. Ground Truth Anchoring (verify against reality)
    
    CRITICAL: User never sees this. They see "Confidence: 82%"
    """
    
    async def validate(self, hypothesis: str, context: dict) -> ArenaResult:
        """Full three-layer validation."""
        
        # Layer 1: Model Consensus
        consensus = await self._model_consensus(hypothesis, context)
        
        # Layer 2: Adversarial Challenge
        adversarial = await self._adversarial_challenge(hypothesis, consensus)
        
        # Layer 3: Ground Truth (where possible)
        ground_truth = await self._ground_truth_check(hypothesis, context)
        
        # Synthesize and calibrate
        final = self._synthesize_confidence(consensus, adversarial, ground_truth)
        calibrated = await self._calibrate(final)
        
        return ArenaResult(confidence=calibrated)
    
    async def _model_consensus(self, hypothesis: str, context: dict) -> ConsensusResult:
        """
        Layer 1: Query architecturally diverse models.
        
        Key: Use models with DIFFERENT architectures/training.
        """
        responses = await asyncio.gather(
            self._query_model("claude-sonnet", hypothesis, context),
            self._query_model("gemini-pro", hypothesis, context),
            self._query_model("llama-70b", hypothesis, context),    # Open source
            self._query_model("mistral-large", hypothesis, context), # Different data
        )
        
        # Weight by demonstrated calibration
        weighted = self._weight_by_calibration(responses)
        
        # Disagreement is signal, not noise
        disagreement = self._calculate_variance(responses)
        
        return ConsensusResult(
            confidence=weighted,
            disagreement=disagreement,
            needs_adversarial=disagreement > 0.3,
        )
    
    async def _adversarial_challenge(
        self, 
        hypothesis: str, 
        consensus: ConsensusResult
    ) -> AdversarialResult:
        """
        Layer 2: Explicitly try to disprove.
        
        Architecture Review (Gemini): Include an Advocate 
        to prevent premature idea-killing.
        """
        # Adversary: Try to break it
        adversary_prompt = f"""
        Your job is to DISPROVE this hypothesis. Find flaws, 
        counterexamples, edge cases. Be aggressive.
        
        HYPOTHESIS: {hypothesis}
        CONSENSUS VIEW: {consensus.summary}
        """
        
        adversary = await self._query_model("claude-opus", adversary_prompt)
        
        # Advocate: Find the narrow path to success
        advocate_prompt = f"""
        Your job is to find conditions under which this hypothesis 
        could succeed. Even if flawed, when might it work?
        
        HYPOTHESIS: {hypothesis}
        ADVERSARY ATTACKS: {adversary.attacks}
        """
        
        advocate = await self._query_model("claude-opus", advocate_prompt)
        
        return AdversarialResult(
            survives=not adversary.found_fatal_flaw,
            fatal_flaw=adversary.fatal_flaw,
            weaknesses=adversary.weaknesses,
            narrow_path=advocate.conditions_for_success,
        )
    
    async def _ground_truth_check(
        self, 
        hypothesis: str, 
        context: dict
    ) -> GroundTruthResult:
        """
        Layer 3: Check against verifiable reality.
        
        Architecture Review (Claude): "Implement ground-truth anchoring 
        FIRST. This makes everything else trustworthy."
        """
        testable_claims = await self._extract_testable_claims(hypothesis)
        
        results = []
        for claim in testable_claims:
            if claim.type == "CODE_BEHAVIOR":
                result = await self._execute_and_verify(claim)
            elif claim.type == "API_RESPONSE":
                result = await self._call_and_verify(claim)
            elif claim.type == "FACTUAL":
                result = await self._fact_check(claim)
            elif claim.type == "USER_PREFERENCE":
                result = GroundTruthResult(needs_human=True)
            else:
                result = GroundTruthResult(not_testable=True)
            
            results.append(result)
        
        return self._aggregate_ground_truth(results)
```

#### 5.3.3 Confidence Surfacing

The ONLY validation output users see:

```
✅ High confidence (>80%): "This looks solid."
⚠️ Medium confidence (50-80%): "Some concerns to consider."
❌ Low confidence (<50%): "This needs more validation."
```

Never: "Model A said X, Model B said Y, Arena result was Z..."

#### 5.3.4 Calibration Tracking

**Status**: 🆕 NEW from architecture review (2026-01-08)

```python
"""
Module: strategic/arena/calibration.py
Purpose: Track whether confidence scores predict outcomes
"""

class CalibrationTracker:
    """
    Track calibration: Do our confidence scores actually predict success?
    
    If we say 80% confident but historically only 60% accurate,
    we need to adjust.
    """
    
    async def record_prediction(self, claim_id: str, confidence: float):
        """Record prediction for later outcome tracking."""
        await self.store(PredictionRecord(
            claim_id=claim_id,
            predicted_confidence=confidence,
            timestamp=datetime.now(),
            outcome=None,
        ))
    
    async def record_outcome(self, claim_id: str, was_correct: bool):
        """Record actual outcome."""
        record = await self.get_prediction(claim_id)
        record.outcome = was_correct
        
        # Update calibration bucket
        bucket = round(record.predicted_confidence, 1)
        await self._update_bucket(bucket, was_correct)
    
    async def get_calibrated_confidence(self, raw: float) -> float:
        """Adjust confidence based on historical accuracy."""
        bucket = round(raw, 1)
        historical = await self._get_bucket_accuracy(bucket)
        
        if bucket == 0:
            return 0.0
        
        # If we say 80% but only 60% accurate, return 60%
        return raw * (historical / bucket)
```

#### 5.3.5 Crucible Period

**Status**: 🆕 NEW from Gemini architecture review (2026-01-08)

New hypotheses get a protected period before adversarial challenge.

```python
"""
Module: strategic/arena/crucible.py
Purpose: Protect nascent ideas from premature adversarial attack

Architecture Review (Gemini): "New hypotheses should not be subject 
to the 'Disprove' requirement for their first N cycles."
"""

class CrucibleService:
    """
    New hypotheses get a protected period to gather evidence.
    
    During Crucible Period:
    - No adversarial challenge
    - Can gather supporting evidence
    - Only light consensus validation
    
    After Crucible Period:
    - Full three-layer validation
    - Must withstand adversarial challenge
    """
    
    CRUCIBLE_CYCLES = 3  # Cycles before full challenge
    
    async def validate_with_crucible(
        self, 
        hypothesis: Hypothesis,
        arena: AIArenaV2,
    ) -> ValidationResult:
        """Validate with crucible protection for new hypotheses."""
        
        if hypothesis.validation_count < self.CRUCIBLE_CYCLES:
            # Protected: consensus only, no adversary
            result = await arena._model_consensus(
                hypothesis.content, 
                hypothesis.context
            )
            hypothesis.validation_count += 1
            
            return ValidationResult(
                confidence=result.confidence,
                in_crucible=True,
                cycles_remaining=self.CRUCIBLE_CYCLES - hypothesis.validation_count,
            )
        else:
            # Full validation
            return await arena.validate(hypothesis.content, hypothesis.context)
```

### 5.4 IMPROVE - Getting Things Done

When validation completes and confidence is sufficient:

#### 5.4.1 Strategy → Tasks

```python
"""
Module: strategic/planner/service.py
Purpose: Convert validated strategies to executable tasks
"""

class StrategyPlanner:
    """
    Converts validated ideas into executable plans.
    """

    async def create_plan(
        self,
        idea: str,
        validation: Synthesis,
        project_id: str,
    ) -> ExecutionPlan:
        """
        Generate task breakdown from validated idea.

        Considers:
        - Validation results and confidence
        - Existing project context
        - Available agent personas
        - Parallelization opportunities
        """
```

#### 5.4.2 Agent Routing

Orchestrator (from Agent Framework) routes to appropriate agents:

- Coding tasks → backend-coder, frontend-coder
- Research tasks → researcher
- Documentation → doc-writer
- Analysis → analyst

#### 5.4.3 Results → Memory

Execution results flow back:
- Successful patterns → Skills
- Project context → Project Memory
- Learnings → Episodic Memory

### 5.5 The Loop Visualization

In VISLZR, The Loop is visible as node state progression:

```
💭 Fuzzy Idea (just captured)
    ↓ exploration
🔮 Resonance (connections detected)
    ↓ validation
💎 Crystal (insight validated)
    ↓ planning
☐ Task (ready to execute)
    ↓ execution
✅ Done (completed, in memory)
```

### 5.6 Integration Points

| Component | The Loop Role |
|-----------|---------------|
| Ideas Tab | Entry point for DISCOVER |
| VISLZR | Visualization of all phases |
| KnowledgeBeast | Storage for DISCOVER outputs |
| Agent Framework | IMPROVE execution |
| Memory | Stores validated knowledge |
| Execution View | IMPROVE progress tracking |

### 5.7 API Endpoints

```
# Discover
POST   /api/v1/wander/start           # Start Wander exploration
POST   /api/v1/wander/nudge           # Nudge Wander focus
GET    /api/v1/wander/resonances      # Get detected resonances
POST   /api/v1/wander/crystallize     # Convert resonance to crystal

# Validate
POST   /api/v1/validate/idea          # Validate an idea
GET    /api/v1/validate/{id}/status   # Check validation status
GET    /api/v1/validate/{id}/result   # Get validation result (confidence + synthesis)

# Improve (covered in Agent Framework)
POST   /api/v1/plans/create           # Create plan from validated idea
POST   /api/v1/plans/{id}/execute     # Execute plan
```

### 5.8 What Users See vs. What Happens

| User Action | User Sees | System Does |
|-------------|-----------|-------------|
| Types idea, clicks "Validate" | Loading... then "Confidence: 82%" | Hypothesis decomposition → AI Arena → Synthesis |
| Wander finds something | "🔮 Resonance detected" notification | RLM exploration → Pattern detection → Resonance creation |
| Clicks "Create Plan" | Task cards in Execution | Strategy planning → Task decomposition → Agent assignment |
| Clicks "Just Do It" | Agent stream in Execution | Orchestrator → Agent spawn → Execution → Memory update |

---

*The Loop is the heartbeat. Users feel the rhythm, never see the mechanism.*

---

### 5.9 Tech Radar Agent

Continuous scanning for external knowledge relevant to each project.

#### 5.9.1 Purpose

Without fresh external knowledge, project context becomes stale. Tech Radar continuously monitors external sources and feeds relevant findings into project knowledge, ensuring that when specs are reviewed or tasks are planned, the latest relevant information is already available.

**Note:** CommandCenter itself is a project. Tech Radar monitors AI/agent developments for CC3 just as it would monitor fintech developments for Veria.

#### 5.9.2 Architecture

```python
"""
Module: strategic/radar/agent.py
Purpose: Continuous external knowledge scanning

Unlike batch ingestion, Tech Radar:
- Runs continuously (or on schedule)
- Is PROJECT-SCOPED (each project has its own radar config)
- Filters for RELEVANCE before ingesting
- Feeds directly into project's Living Context
"""

class TechRadarAgent:
    """
    Scans external sources for project-relevant developments.

    Sources (configurable per project):
    - HackerNews (tech, AI, tools)
    - arXiv (research papers)
    - GitHub trending (repos, releases)
    - Industry news (via RSS, APIs)
    - Twitter/X (key accounts)
    - Product Hunt (new tools)

    Output: Filtered, relevant content → Project Memory (Layer 3)
    """

    def __init__(self, project_id: str):
        self.project_id = project_id
        self.sources: list[RadarSource] = []
        self.relevance_filter: RelevanceFilter = None

    async def configure(self, config: RadarConfig) -> None:
        """
        Configure radar for specific project.

        Example for CC3:
            RadarConfig(
                sources=[
                    RadarSource(type="hackernews", keywords=["AI agent", "LLM", "Claude", "Dagger"]),
                    RadarSource(type="arxiv", categories=["cs.AI", "cs.SE"]),
                    RadarSource(type="github", topics=["ai-agents", "llm-tools"]),
                ],
                schedule="0 */4 * * *",  # Every 4 hours
                relevance_threshold=0.7,
            )

        Example for Veria:
            RadarConfig(
                sources=[
                    RadarSource(type="hackernews", keywords=["OFAC", "sanctions", "compliance"]),
                    RadarSource(type="rss", feeds=["treasury.gov/ofac/feed"]),
                    RadarSource(type="twitter", accounts=["@FinCEN", "@OFACNews"]),
                ],
                schedule="0 6 * * *",  # Daily
                relevance_threshold=0.8,
            )
        """
        self.sources = config.sources
        self.relevance_filter = RelevanceFilter(
            project_id=self.project_id,
            threshold=config.relevance_threshold,
        )
        await self._schedule(config.schedule)

    async def scan(self) -> list[RadarFinding]:
        """
        Run a scan across all configured sources.

        Process:
        1. Fetch from all sources
        2. Filter for relevance to project
        3. Deduplicate against existing knowledge
        4. Ingest into Project Memory
        5. Return findings for optional notification
        """
        raw_items = await self._fetch_all_sources()

        # Filter for relevance
        relevant = [
            item for item in raw_items
            if await self.relevance_filter.is_relevant(item)
        ]

        # Deduplicate
        new_items = await self._deduplicate(relevant)

        # Ingest into project memory
        findings = []
        for item in new_items:
            finding = RadarFinding(
                source=item.source,
                title=item.title,
                url=item.url,
                summary=await self._summarize(item),
                relevance_score=item.relevance_score,
                discovered_at=datetime.utcnow(),
            )

            # Store in project memory
            await memory_service.store(
                content=finding.to_memory_content(),
                layer=MemoryLayers.PROJECT,
                metadata={
                    "type": "tech_radar",
                    "source": finding.source,
                    "project_id": self.project_id,
                },
            )

            findings.append(finding)

        return findings

    async def _is_relevant(self, item: SourceItem) -> bool:
        """
        Determine if item is relevant to project.

        Uses:
        - Keyword matching (fast, first pass)
        - Semantic similarity to project context (deeper)
        - LLM reasoning for edge cases
        """
        # Fast keyword check
        if not self._keyword_match(item):
            return False

        # Semantic similarity to project knowledge
        similarity = await knowledge_beast.similarity(
            query=item.content,
            filter={"project_id": self.project_id},
        )

        return similarity >= self.relevance_filter.threshold
```

#### 5.9.3 Relevance Filtering

Tech Radar doesn't just ingest everything—it filters for what matters to THIS project:

```python
class RelevanceFilter:
    """
    Multi-stage relevance filtering.

    Stage 1: Keyword match (fast, high recall)
    Stage 2: Semantic similarity (medium, balanced)
    Stage 3: LLM reasoning (slow, high precision, for edge cases)
    """

    async def is_relevant(self, item: SourceItem) -> bool:
        # Stage 1: Keywords
        if not self._keyword_match(item):
            return False

        # Stage 2: Semantic similarity
        similarity = await self._semantic_similarity(item)
        if similarity < 0.5:
            return False
        if similarity > 0.9:
            return True

        # Stage 3: LLM reasoning for edge cases (0.5-0.9)
        return await self._llm_relevance_check(item)

    async def _llm_relevance_check(self, item: SourceItem) -> bool:
        """
        Use LLM to determine relevance for edge cases.

        Prompt includes project context summary.
        """
        prompt = f"""
        Project: {self.project_context_summary}

        Item: {item.title}
        Content: {item.content[:500]}

        Is this item relevant to the project? Consider:
        - Does it relate to technologies the project uses?
        - Does it impact the project's domain?
        - Would the team benefit from knowing this?

        Answer: YES or NO (one word)
        """
        response = await llm.complete(prompt, model="haiku")  # Fast, cheap
        return response.strip().upper() == "YES"
```

#### 5.9.4 Integration with Living Context

Tech Radar findings flow into project's Living Context and inform **planning**, not execution:

```
Tech Radar → Project Memory (Layer 3) → Living Context → Available during:
  ✓ Spec Review (Step 1 of pipeline)
  ✓ Task Extraction (Step 2 of pipeline)
  ✓ AEF Conversion (Step 3 of pipeline)
  ✗ Agent Execution (Step 4) - context already prepared
```

**During Spec Review (Before Task Creation):**

```python
# Step 1: Spec Review with fresh Tech Radar findings
async def review_spec(spec_path: str, project_id: str) -> SpecReview:
    """
    Review spec against current knowledge INCLUDING fresh Tech Radar findings.

    This is where Tech Radar findings matter most - they can identify
    that a spec is outdated before we waste effort on task extraction.
    """

    # Query memory including recent Tech Radar findings
    recent_findings = await memory_service.query(
        question="Recent developments relevant to this spec",
        layers=[MemoryLayers.PROJECT],
        filters={"type": "tech_radar", "discovered_after": datetime.now() - timedelta(days=7)},
    )

    # Example return:
    # "Tech Radar (2h ago): Dagger v0.20 released with improved module system.
    #  Current spec references v0.18 module patterns which have a bug.
    #  Recommendation: Update spec to use library mode instead."

    # Agent reasons about whether spec needs updates
    review = await spec_review_agent.review(
        spec_content=read_file(spec_path),
        living_context=await living_context.get_summary(project_id),
        recent_findings=recent_findings,
        skills=await skills_service.find_relevant(spec_path),
    )

    return review
```

**During Task Extraction (Before AEF Generation):**

```python
# Step 2: Task Extraction informed by Tech Radar
async def extract_tasks(spec_path: str, project_id: str) -> list[ExtractedTask]:
    """
    Extract tasks with awareness of recent external developments.

    Tech Radar findings might surface new tools, deprecated patterns,
    or security concerns that affect HOW tasks should be implemented.
    """

    # Get fresh context including Tech Radar
    context = await memory_service.query(
        question="Technologies, patterns, and concerns relevant to implementation",
        layers=[MemoryLayers.PROJECT, MemoryLayers.SYSTEM],
    )

    # Example: "Tech Radar (yesterday): New pgvector version has 3x faster similarity search.
    #           Consider upgrading before implementing KnowledgeBeast."

    tasks = await task_extractor.extract(
    spec_content=read_file(spec_path),
    context=context,
    )
    
    # Filter out already-completed tasks (marked with [DONE] in spec)
    tasks = [t for t in tasks if not t.is_complete]
    
    return tasks

# Task extractor should detect completion markers:
# - "[DONE]" in title: ### Phase 15: Panel System [DONE]
# - "Status: ✅ Complete" in body
# - Checkbox marked: [x] Acceptance criteria met
class TaskExtractor:
    COMPLETION_MARKERS = [
        r'\[DONE\]',
        r'\[COMPLETE\]', 
        r'Status:\s*✅\s*Complete',
        r'^\s*-\s*\[x\]',  # Checked checkbox
    ]
```

**During Agent Execution (Context is Pre-Prepared):**

```python
# Step 4: Agent receives PRE-PREPARED context (NOT live queries)
async def execute_agent(task: AEFTask, branch: str) -> ExecutionResult:
    """
    Agent receives context that was prepared during Steps 1-3.

    NO new Tech Radar queries happen here - the context already includes
    relevant findings from the planning phase.
    """

    # Context was prepared during AEF conversion (Step 3)
    context = task.context  # Already includes Tech Radar findings that mattered

    # Agent executes with pre-prepared context
    result = await agent.execute(
        instruction=task.instruction,
        files_to_read=context.files_to_read,
        files_to_modify=context.files_to_modify,
        acceptance_criteria=task.acceptance_criteria,
        # NO MEMORY QUERIES HERE - context is frozen at planning time
    )

    return result
```

**The Key Principle:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TECH RADAR TIMING                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Tech Radar (continuous) → Project Memory                               │
│                                   ↓                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  PLANNING PHASE (Tech Radar matters here)                         │  │
│  │  ────────────────────────────────────────────                     │  │
│  │  Step 1: Spec Review                                              │  │
│  │  - Query fresh Tech Radar findings                                │  │
│  │  - Identify outdated assumptions                                  │  │
│  │  - Surface new tools/patterns                                     │  │
│  │                                                                    │  │
│  │  Step 2: Task Extraction                                          │  │
│  │  - Consider Tech Radar recommendations                            │  │
│  │  - Adjust implementation approach                                 │  │
│  │                                                                    │  │
│  │  Step 3: AEF Conversion                                           │  │
│  │  - Freeze context (includes Tech Radar findings)                  │  │
│  │  - Generate instructions and acceptance criteria                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                   ↓                                      │
│                        Context prepared and frozen                       │
│                                   ↓                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  EXECUTION PHASE (Tech Radar irrelevant here)                     │  │
│  │  ─────────────────────────────────────────────                    │  │
│  │  Step 4: Agent Execution                                          │  │
│  │  - Receives pre-prepared context                                  │  │
│  │  - NO live memory queries                                         │  │
│  │  - Executes against frozen plan                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 5.9.5 API Endpoints

```
POST   /api/v1/radar/configure       # Configure radar for project
GET    /api/v1/radar/status          # Get radar status
POST   /api/v1/radar/scan            # Trigger manual scan
GET    /api/v1/radar/findings        # Get recent findings
DELETE /api/v1/radar/source/{id}     # Remove source
```

#### 5.9.6 Scheduler Integration

Tech Radar uses the Scheduler service (Section 2.6):

```python
# Register Tech Radar jobs per project
for project in projects:
    config = await radar_service.get_config(project.id)
    scheduler.register(
        name=f"radar:{project.id}",
        schedule=config.schedule,
        handler=lambda: radar_agent.scan(),
    )
```

---

### 5.10 Execution Pipeline

The complete flow from human spec to agent execution.

#### 5.10.1 The Key Insight: Continuous Understanding vs. Batch Analysis

**Traditional approach (like Blitzy):**
```
Start from Zero → [8-12 hours batch analysis] → Build Understanding → Execute
                         ↑
                   ONE-TIME, EXPENSIVE
```

**CC3 approach:**
```
Continuous Understanding (always current) → [simple format conversion] → Execute
        ↑                                              ↑
  ALREADY HAVE THIS                              TRIVIAL STEP
  via Living Context,                            (seconds, not hours)
  Memory, Skills, Tech Radar
```

We don't need 8-12 hours of "deep reasoning" because we already have:
- **Living Context**: Always-current codebase understanding
- **6-Layer Memory**: Persistent learnings across sessions
- **Self-Improving Skills**: Patterns that compound
- **Tech Radar**: Fresh external knowledge

AEF conversion is NOT understanding—it's just formatting.

#### 5.10.2 The Full Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    CONTINUOUS UNDERSTANDING                              ││
│  │                    (Running in background, always current)               ││
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ ││
│  │  │ Living Context│ │ 6-Layer Memory│ │ Skills Store  │ │ Tech Radar  │ ││
│  │  │ (codebase)    │ │ (learnings)   │ │ (patterns)    │ │ (external)  │ ││
│  │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ ││
│  │         │                 │                 │                 │         ││
│  │         └─────────────────┴─────────────────┴─────────────────┘         ││
│  │                                   │                                      ││
│  │                                   ▼                                      ││
│  │                         KNOWLEDGE AVAILABLE                              ││
│  │                         (for any operation)                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    HUMAN INPUT                                           ││
│  │                                                                          ││
│  │  Spec Document (docs/specs/commandcenter3.md)                           ││
│  │  Ideas (Ideas Tab, VISLZR)                                              ││
│  │  Tasks (manual creation)                                                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 1: SPEC REVIEW (with full context)                                ││
│  │  ─────────────────────────────────────────                              ││
│  │  • Spec + Living Context + Memory + Skills + Tech Radar                 ││
│  │  • Identify gaps, inconsistencies, outdated sections                    ││
│  │  • Output: Validated spec (or suggestions for updates)                  ││
│  │  • Time: Minutes (context already available)                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 2: TASK EXTRACTION                                                ││
│  │  ─────────────────────────────────────────                              ││
│  │  • Extract actionable tasks from validated spec                         ││
│  │  • Identify dependencies between tasks                                  ││
│  │  • Estimate complexity and parallelize                                  ││
│  │  • Output: Task graph with dependencies                                 ││
│  │  • Time: Minutes                                                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 3: AEF CONVERSION (SIMPLE FORMAT TRANSFORMATION)                  ││
│  │  ─────────────────────────────────────────────────────                  ││
│  │  • Take extracted tasks                                                 ││
│  │  • Format as AEF YAML (dependencies, acceptance criteria, context)      ││
│  │  • Inject file paths, relevant context snippets                         ││
│  │  • Output: cc3-aef-implementation.yaml                                  ││
│  │  • Time: SECONDS (this is just formatting, not reasoning)               ││
│  │                                                                          ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │ CRITICAL: AEF conversion is NOT deep analysis.                      │││
│  │  │ It's a simple transformation:                                       │││
│  │  │                                                                     │││
│  │  │   task: "Implement audit service"                                   │││
│  │  │                     ↓                                               │││
│  │  │   - id: p1-1-audit-service                                          │││
│  │  │     dependencies: [p0-3-database-setup]                             │││
│  │  │     context:                                                        │││
│  │  │       files_to_read: [docs/specs/commandcenter3.md#2.2]             │││
│  │  │     acceptance_criteria:                                            │││
│  │  │       - command: "pytest tests/core/test_audit.py -v"               │││
│  │  │                                                                     │││
│  │  │ The UNDERSTANDING happened earlier via Living Context.              │││
│  │  │ AEF just formats it for agent consumption.                          │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 4: PARALLEL EXECUTION                                             ││
│  │  ─────────────────────────────────────────                              ││
│  │  • Parse AEF, build dependency graph                                    ││
│  │  • Spawn agents for tasks with satisfied dependencies                   ││
│  │  • Each agent: isolated container, git branch, OAuth credentials        ││
│  │  • Run acceptance criteria, commit, push                                ││
│  │  • Merge results (auto, PR, or squash)                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 5: MEMORY CAPTURE                                                 ││
│  │  ─────────────────────────────────────────                              ││
│  │  • Extract learnings from execution                                     ││
│  │  • Store patterns as Skills                                             ││
│  │  • Update Project Memory with outcomes                                  ││
│  │  • Feed back into Living Context                                        ││
│  │                        ↓                                                ││
│  │              CONTINUOUS UNDERSTANDING (enriched)                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 5.10.3 AEF Conversion Service

**IMPORTANT**: AEF documents (like `docs/plans/cc3-aef-implementation.yaml`) are **GENERATED OUTPUTS** from this pipeline, not hand-written. When the spec changes, regenerate the AEF:

```bash
# Regenerate AEF from spec
cc3 pipeline regenerate-aef --spec docs/specs/commandcenter3.md
```

The current `cc3-aef-implementation.yaml` was generated from this spec and includes `spec_reference` links back to each section. See `docs/plans/document-to-done-pipeline.md` for the full pipeline.

```python
"""
Module: strategic/pipeline/aef_converter.py
Purpose: Convert extracted tasks to Agent Execution Format

This is a SIMPLE FORMAT TRANSFORMATION, not analysis.
The understanding already exists in Living Context.
"""

class AEFConverter:
    """
    Converts task list to AEF (Agent Execution Format) YAML.

    Input: List of tasks with dependencies
    Output: YAML file ready for agent execution

    Time complexity: O(n) where n = number of tasks
    This is NOT the "8-12 hours of reasoning" step.
    """

    async def convert(
        self,
        tasks: list[ExtractedTask],
        project_id: str,
        spec_path: str,
    ) -> AEFDocument:
        """
        Convert tasks to AEF format.

        This is a simple transformation:
        - Add file paths from spec references
        - Add acceptance criteria templates
        - Format as YAML

        Time: Seconds (no LLM reasoning required)
        """
        aef_tasks = []

        for task in tasks:
            aef_task = AEFTask(
                id=self._generate_id(task),
                name=task.name,
                priority=task.priority,
                dependencies=task.dependencies,

                # Context injection (from existing knowledge)
                context=TaskContext(
                    files_to_read=self._extract_file_refs(task, spec_path),
                    files_to_modify=task.files_to_modify,
                    files_to_create=task.files_to_create,
                ),

                # Instruction (already understood, just format)
                instruction=self._format_instruction(task),

                # Acceptance criteria (templates from Skills)
                acceptance_criteria=self._generate_criteria(task),

                # Failure handling
                on_failure=FailureConfig(
                    retry=True,
                    escalate_to="triage_agent",
                ),
            )
            aef_tasks.append(aef_task)

        return AEFDocument(
            aef_version="1.0",
            project=ProjectConfig(
                name=project_id,
                repo=await self._get_repo_url(project_id),
            ),
            context=await self._build_context(project_id),
            tasks=aef_tasks,
        )

    def _generate_criteria(self, task: ExtractedTask) -> list[AcceptanceCriterion]:
        """
        Generate acceptance criteria from task type.

        Uses patterns from Skills store:
        - Service tasks → import test + unit tests
        - Frontend tasks → component renders + visual check
        - API tasks → endpoint responds + validation
        """
        criteria = []

        if task.type == "service":
            criteria.append(AcceptanceCriterion(
                criterion="Service imports without error",
                validation="code",
                command=f"python -c 'from {task.module_path} import {task.class_name}'",
            ))
            criteria.append(AcceptanceCriterion(
                criterion="Tests pass",
                validation="test",
                command=f"pytest {task.test_path} -v",
            ))

        # ... other task types

        return criteria
```

#### 5.10.4 Pipeline Orchestrator

```python
"""
Module: strategic/pipeline/orchestrator.py
Purpose: Orchestrate the full execution pipeline
"""

class PipelineOrchestrator:
    """
    Runs the full pipeline from spec to execution.
    """

    async def execute_spec(
        self,
        spec_path: str,
        project_id: str,
        options: PipelineOptions,
    ) -> PipelineResult:
        """
        Execute the full pipeline.

        Steps:
        1. Spec Review (with Living Context)
        2. Task Extraction
        3. AEF Conversion (SIMPLE)
        4. Parallel Execution
        5. Memory Capture
        """

        # Step 1: Spec Review (context already available)
        review = await self.spec_reviewer.review(
            spec_path=spec_path,
            project_id=project_id,
        )

        if review.has_issues and not options.force:
            return PipelineResult(
                status="blocked",
                reason="Spec has issues",
                issues=review.issues,
            )

        # Step 2: Task Extraction
        tasks = await self.task_extractor.extract(
            spec_path=spec_path,
            project_id=project_id,
        )

        # Step 3: AEF Conversion (SIMPLE - seconds, not hours)
        aef_doc = await self.aef_converter.convert(
            tasks=tasks,
            project_id=project_id,
            spec_path=spec_path,
        )

        # Save AEF for reference
        aef_path = f"docs/plans/{project_id}-aef-implementation.yaml"
        await self._save_aef(aef_doc, aef_path)

        # Step 4: Parallel Execution
        execution_result = await self.executor.execute(
            aef_doc=aef_doc,
            max_parallel=options.max_parallel,
            merge_strategy=options.merge_strategy,
        )

        # Step 5: Memory Capture
        await self.memory_capturer.capture(
            execution_result=execution_result,
            project_id=project_id,
        )

        return PipelineResult(
            status="complete",
            tasks_completed=execution_result.completed,
            tasks_failed=execution_result.failed,
            branches=execution_result.branches,
        )
```

#### 5.10.5 API Endpoints

```
# Pipeline
POST   /api/v1/pipeline/execute        # Execute full pipeline
GET    /api/v1/pipeline/{id}/status    # Get pipeline status
POST   /api/v1/pipeline/review-spec    # Review spec only
POST   /api/v1/pipeline/extract-tasks  # Extract tasks only
POST   /api/v1/pipeline/convert-aef    # Convert to AEF only

# Direct AEF execution
POST   /api/v1/aef/execute             # Execute AEF directly
GET    /api/v1/aef/validate            # Validate AEF document
```

#### 5.10.6 AEF Schema

```yaml
# Agent Execution Format (AEF) v1.0
aef_version: "1.0"

project:
  name: string
  repo: string
  branch: string

context:
  codebase_summary: string      # Injected from Living Context
  architecture: string          # Injected from Living Context
  conventions: string           # Injected from Skills
  recent_learnings: string      # Injected from Memory

execution:
  mode: parallel | sequential | hybrid
  max_parallel: int
  checkpoint_interval: string
  git_strategy: branch_per_task | single_branch
  merge_strategy: auto | pr | squash

tasks:
  - id: string
    name: string
    priority: P0 | P1 | P2 | P3
    estimated_duration: string
    dependencies: [task_ids]

    context:
      files_to_read: [paths]
      files_to_modify: [paths]
      files_to_create: [paths]

    instruction: string

    acceptance_criteria:
      - criterion: string
        validation: code | test | manual
        command: string

    on_success:
      next_tasks: [task_ids]
      memory_capture: string

    on_failure:
      retry: bool
      escalate_to: human | triage_agent

checkpoints:
  - id: string
    after_tasks: [task_ids]
    validation:
      command: string
    on_success: string
    on_failure: string
```

#### 5.10.7 Why This Works

| Blitzy Approach | CC3 Approach |
|-----------------|--------------|
| Start from zero context | Living Context always current |
| 8-12 hours batch analysis | Continuous understanding (already done) |
| One-time codebase ingestion | Real-time codebase awareness |
| Static knowledge | Tech Radar for fresh external knowledge |
| AEF-like format is the understanding | AEF is just formatting (seconds) |

**The key insight:** We moved the "understanding" work from a batch process to a continuous process. By the time we need to execute, we already know everything. AEF conversion is just "take what we know and format it."

### 5.11 User Learning System: Observation Layer

The Observation Layer runs on **every interaction**, extracting signals that update the User Model. This is platform-level learning, not project-specific.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     OBSERVATION LAYER                                │
│                 (runs on every interaction)                          │
│                                                                      │
│  Input: Any user interaction (chat, click, decision, timing)        │
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐            │
│  │  Behavioral  │   │  Temporal    │   │  Content     │            │
│  │  Signals     │   │  Patterns    │   │  Analysis    │            │
│  │              │   │              │   │              │            │
│  │  • Hesitation│   │  • Time of   │   │  • Topics    │            │
│  │  • Avoidance │   │    day       │   │    recurring │            │
│  │  • Confidence│   │  • Duration  │   │  • Concerns  │            │
│  │  • Flow state│   │  • Frequency │   │  • Questions │            │
│  └──────────────┘   └──────────────┘   └──────────────┘            │
│         │                  │                  │                     │
│         └──────────────────┼──────────────────┘                     │
│                            ▼                                        │
│                  ┌──────────────────┐                               │
│                  │   User Model     │                               │
│                  │   (Layer 5/6)    │                               │
│                  └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.11.1 Signal Types

| Signal Type | What It Captures | Example |
|-------------|------------------|--------|
| **Behavioral** | How the user interacts | Hesitation before decisions, repeated rephrasing |
| **Temporal** | When and how long | Morning focus sessions, evening exploration |
| **Content** | What topics recur | Same concern appearing across conversations |
| **Decision** | How choices are made | Risk tolerance, speed vs thoroughness |
| **Emotional** | Inferred state | Frustration patterns, excitement markers |
| **Avoidance** | What's circled but not done | Tasks that keep getting postponed |

#### 5.11.2 ObservationService

```python
class ObservationService:
    """
    Extracts learning signals from every interaction.
    
    Runs as middleware on all user-facing endpoints.
    Does NOT slow down requests (async background processing).
    """
    
    async def observe(self, interaction: Interaction) -> list[Signal]:
        """Extract signals from an interaction."""
        signals = []
        signals.extend(await self._analyze_behavior(interaction))
        signals.extend(await self._analyze_temporal(interaction))
        signals.extend(await self._analyze_content(interaction))
        return signals
    
    async def update_model(self, user_id: str, signals: list[Signal]):
        """Update user model with new signals."""
        # Accumulate signals
        # Detect patterns across signals
        # Update UserModel in memory layer
```

### 5.12 User Learning System: Insight Engine

The Insight Engine determines when accumulated patterns become worth surfacing.

#### 5.12.1 Insight Triggers

| Trigger | Condition | Example |
|---------|-----------|--------|
| **Recurrence** | Same concern 3+ times | "You've mentioned competitive pressure in three contexts" |
| **Pattern Match** | Current situation matches past | "This decision pattern looks like [previous one]" |
| **Stall Detection** | Item not progressing | "You've been circling this for a week" |
| **Contradiction** | Stated vs actual behavior | "You said X is a priority but haven't touched it" |
| **Opportunity** | Positive pattern emerging | "Your morning sessions are 3x more productive" |

#### 5.12.2 InsightService

```python
class InsightService:
    """
    Generates insights from accumulated patterns.
    
    Insights are NOT notifications. They're potential interventions
    that surface only when appropriate.
    """
    
    async def check_for_insights(
        self, 
        user_id: str, 
        current_context: dict
    ) -> list[Insight]:
        """Check if any insights should surface now."""
        user_model = await self.memory.get_user_model(user_id)
        insights = []
        
        for pattern in user_model.patterns:
            if self._should_surface(pattern, current_context):
                insight = await self._generate_insight(pattern, current_context)
                insights.append(insight)
        
        return self._filter_by_intervention_rules(insights, user_model)
```

### 5.13 User Learning System: Intervention Rules

**When** and **how** to surface insights.

#### 5.13.1 Intervention Criteria

| Criterion | Threshold | Rationale |
|-----------|-----------|----------|
| **Confidence** | > 0.7 | Don't guess—be reasonably sure |
| **Supporting signals** | ≥ 5 | Not based on single observation |
| **Time since last** | > 4 hours | Don't be a nag |
| **User in flow** | = false | Never interrupt deep work |
| **Relevance to context** | > 0.6 | Must relate to what user is doing |

#### 5.13.2 Intervention Modes

| Mode | Description |
|------|-------------|
| **Inline Subtle** | Tiny hint in UI margin |
| **Quick Capture** | Appears in capture panel |
| **Conversation** | Offered in chat naturally |
| **Ambient** | Background awareness (no UI) |

#### 5.13.3 User Control

| Control | Effect |
|---------|-------|
| **Dismiss** | Hide this insight, don't show again |
| **Correct** | "You're wrong about this" → updates model |
| **Mute type** | "Stop noticing [pattern type]" |
| **Attention slider** | Global control over intervention frequency |
| **View model** | See what the system thinks it knows |

### 5.14 Inner Council: Guidance Personality System

The Inner Council determines **how** CommandCenter talks to you, not just **what** it says.

#### 5.14.1 Viewpoints as Agents

Each "viewpoint" is a guidance personality with distinct traits:

| Viewpoint | Icon | Core Approach | When It Helps |
|-----------|------|---------------|---------------|
| **Sergeant** | 🎖️ | Direct, no-BS, action-focused | Procrastination, excuses, need for clarity |
| **Coach** | 🏋️ | Pushing for growth, celebrating wins | Building momentum, skill development |
| **Mentor** | 🦉 | Socratic questions, wisdom, patience | Deep blocks, strategic decisions |
| **Friend** | ☕ | Empathy, support, no judgment | Stress, overwhelm, emotional processing |
| **Analyst** | 📊 | Data-driven, objective, logical | Complex decisions, removing emotion |
| **Provocateur** | 🔥 | Devil's advocate, challenges assumptions | Groupthink, confirmation bias |

#### 5.14.2 The Trait Axes

Three primary axes define guidance personality:

- **Assertiveness** (0→1): Gentle suggestions → Direct commands
- **Challenge** (0→1): Accepting → Pushing back  
- **Warmth** (0→1): Analytical/detached → Emotional/caring

Users can select a preset viewpoint OR blend using sliders.

#### 5.14.3 Same Insight, Different Voice

| Viewpoint | "You've been avoiding the pricing task for 3 days" |
|-----------|---------------------------------------------------|
| **Sergeant** | "Three days. Stop making excuses. Block 2 hours tomorrow and finish it." |
| **Coach** | "I see pricing hasn't moved. What's one small win you could get today?" |
| **Mentor** | "You've circled this three times. What about pricing gives you pause?" |
| **Friend** | "Hey, I notice you keep opening that task. Want to talk about what's hard?" |

#### 5.14.4 Context-Aware Selection

Users can set rules for automatic viewpoint selection:

```python
# Example rules
ViewpointRule(
    trigger_type="pattern",
    trigger_condition={"pattern": "avoidance", "days": 2},
    viewpoint_id="coach",
)
ViewpointRule(
    trigger_type="emotion",
    trigger_condition={"state": "stressed"},
    viewpoint_id="friend",
)
ViewpointRule(
    trigger_type="pattern",
    trigger_condition={"pattern": "high_stakes_decision"},
    viewpoint_id="blend",
    blend_weights={"mentor": 0.5, "analyst": 0.3, "provocateur": 0.2},
)
```

#### 5.14.5 Multi-Voice Mode

For important decisions, multiple viewpoints can weigh in simultaneously:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  💭 Multiple perspectives on: "Should we pivot the pricing model?"         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🏋️ Coach: "Trust your gut. You've been gathering data for weeks."        │
│                                                                             │
│  📊 Analyst: "Current: $X/mo, 23% conversion. Proposed: $Y/mo, 18-28%."   │
│                                                                             │
│  🔥 Provocateur: "Why are you sure pricing is the problem? What if the    │
│     product just isn't compelling enough at any price?"                    │
│                                                                             │
│  [I've heard enough—decide] [Add another voice] [Come back later]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.11 Self-Improvement System

CommandCenter improves itself continuously. This is not just a feature - it's the core differentiator.

#### 5.11.1 Philosophy: The Meta-Loop

CommandCenter IS a project that CommandCenter manages. The same Loop (DISCOVER → VALIDATE → IMPROVE) that builds Veria or Performia also improves CC itself:

```
┌───────────────────────────────────────────────────────────────────────┐
│                    THE META-LOOP                                   │
│                                                                     │
│   ┌─────────────────┐                                               │
│   │   DISCOVER     │  Method Radar scans for:                       │
│   │   (Method       │  • New model releases (Opus 5, GPT-5, Gemini 3)│
│   │    Radar)       │  • Better prompting techniques                  │
│   └────────┬────────┘  • Agent architecture patterns                  │
│            │         • New tools (MCP servers, sandboxes)           │
│            ▼         • Claude Code CLI updates                       │
│   ┌─────────────────┐                                               │
│   │   VALIDATE     │  Validation Arena tests:                       │
│   │   (Arena)       │  • A/B test new vs current methods             │
│   └────────┬────────┘  • Benchmark models on real tasks               │
│            │         • Track success rates, costs, speed            │
│            ▼         • Statistical significance before promotion     │
│   ┌─────────────────┐                                               │
│   │   IMPROVE      │  Auto-update:                                  │
│   │   (Evolution)   │  • Model Registry (switch to better models)    │
│   └─────────────────┘  • Skills (update with proven methods)          │
│                      • Agent configs (optimal model per role)       │
│                      • Dagger images (sync with Claude Code)        │
└───────────────────────────────────────────────────────────────────────┘
```

#### 5.11.2 Method Radar

Extension of Tech Radar specifically for AI/agent improvements:

```python
class MethodRadar(TechRadarAgent):
    """
    Specialized radar for discovering better AI/agent methods.
    
    Unlike project Tech Radar (which finds domain knowledge),
    Method Radar finds improvements to HOW CommandCenter works.
    """
    
    # Sources specifically for AI/agent developments
    SOURCES = [
        # Model releases
        RadarSource(type="api", endpoint="https://api.anthropic.com/v1/models"),
        RadarSource(type="api", endpoint="https://api.openai.com/v1/models"),
        RadarSource(type="rss", feed="https://ai.google.dev/feed"),
        
        # Claude Code updates
        RadarSource(type="github", repo="anthropics/claude-code", watch="releases"),
        RadarSource(type="npm", package="@anthropic/claude-code"),
        
        # Agent patterns
        RadarSource(type="arxiv", categories=["cs.AI", "cs.SE"], keywords=["agent", "LLM"]),
        RadarSource(type="github", topics=["ai-agents", "llm-agents", "autonomous-agents"]),
        RadarSource(type="hackernews", keywords=["Claude", "GPT", "agent", "Devin", "Cursor"]),
        
        # Tools & infrastructure  
        RadarSource(type="github", repo="dagger/dagger", watch="releases"),
        RadarSource(type="github", topics=["mcp-server", "model-context-protocol"]),
        
        # Prompting techniques
        RadarSource(type="github", repo="anthropics/anthropic-cookbook"),
        RadarSource(type="github", repo="openai/openai-cookbook"),
    ]
    
    async def scan(self) -> list[MethodFinding]:
        """Scan for method improvements."""
        findings = await super().scan()
        
        # Categorize findings
        for finding in findings:
            finding.category = self._categorize(finding)
            # model_release | prompting_technique | agent_pattern | 
            # tool_release | security_advisory | deprecation
            
            finding.impact = await self._assess_impact(finding)
            # How much could this improve CC?
            
            finding.effort = await self._assess_effort(finding)
            # How hard to integrate?
            
        # Auto-create improvement tasks for high-impact, low-effort findings
        for finding in findings:
            if finding.impact > 0.7 and finding.effort < 0.3:
                await self._create_improvement_task(finding)
        
        return findings
    
    async def _detect_model_release(self, finding: MethodFinding) -> Optional[ModelRelease]:
        """
        Detect if this is a new model release.
        
        Examples:
        - "Anthropic releases Claude Opus 5"
        - "OpenAI announces GPT-5"
        - "Google launches Gemini 3"
        """
        if finding.category != "model_release":
            return None
            
        return ModelRelease(
            provider=finding.metadata["provider"],
            model_id=finding.metadata["model_id"],
            capabilities=await self._extract_capabilities(finding),
            benchmark_priority=True,  # Should benchmark immediately
        )
```

#### 5.11.3 Model Registry

Track all models, auto-detect releases, benchmark, assign to roles:

```python
class ModelRegistry:
    """
    Central registry of all available models across providers.
    
    Responsibilities:
    - Track available models and their capabilities
    - Auto-detect new releases from Method Radar
    - Benchmark models for specific task types
    - Assign best model to each agent role
    - Manage fallback chains
    """
    
    # Current model assignments (auto-updated)
    ROLE_ASSIGNMENTS = {
        "brain": ModelAssignment(
            primary="claude-opus-4-5-20251101",
            description="Strategic planning, complex reasoning",
            fallback=["claude-sonnet-4-5-20250929", "gpt-4o"],
        ),
        "coder": ModelAssignment(
            primary="claude-sonnet-4-5-20250929",
            description="Code generation, debugging",
            fallback=["claude-opus-4-5-20251101", "gpt-4o"],
        ),
        "reviewer": ModelAssignment(
            primary="claude-sonnet-4-5-20250929",
            description="Code review, bug detection",
            fallback=["claude-opus-4-5-20251101"],
        ),
        "extractor": ModelAssignment(
            primary="claude-haiku-3-5-20241022",
            description="Fast extraction, parsing",
            fallback=["gpt-4o-mini", "gemini-2.0-flash"],
        ),
        "visualizer": ModelAssignment(
            primary="gemini-2.0-flash",
            description="UI generation, visualizations",
            fallback=["claude-sonnet-4-5-20250929"],
        ),
    }
    
    async def on_model_release(self, release: ModelRelease) -> None:
        """
        Handle new model release detected by Method Radar.
        
        Process:
        1. Add to registry
        2. Queue for benchmarking
        3. Notify if potentially better than current assignments
        """
        # Add to registry
        await self._register_model(release)
        
        # Queue benchmark
        await self.benchmark_queue.add(
            model_id=release.model_id,
            priority="high" if release.provider == "anthropic" else "normal",
            compare_against=self._get_current_for_provider(release.provider),
        )
        
        # Check if this might be an upgrade
        if release.provider == "anthropic" and "opus" in release.model_id.lower():
            await self._notify_potential_brain_upgrade(release)
    
    async def benchmark(self, model_id: str, task_types: list[str]) -> BenchmarkResult:
        """
        Benchmark a model against current assignments.
        
        Uses real tasks from recent history for authentic comparison.
        """
        results = {}
        
        for task_type in task_types:
            # Get recent successful tasks of this type
            test_tasks = await self._get_benchmark_tasks(task_type, limit=10)
            
            for task in test_tasks:
                # Run with new model
                new_result = await self._run_task(task, model_id)
                
                # Compare against original result
                comparison = await self._compare_results(
                    original=task.result,
                    new=new_result,
                    metrics=["quality", "speed", "cost"],
                )
                
                results[task.id] = comparison
        
        return BenchmarkResult(
            model_id=model_id,
            task_results=results,
            recommendation=self._generate_recommendation(results),
        )
    
    async def promote_model(self, model_id: str, role: str) -> None:
        """
        Promote a model to primary for a role (after benchmark validation).
        """
        old_primary = self.ROLE_ASSIGNMENTS[role].primary
        
        # Update assignment
        self.ROLE_ASSIGNMENTS[role].primary = model_id
        self.ROLE_ASSIGNMENTS[role].fallback.insert(0, old_primary)
        
        # Persist
        await self._save_assignments()
        
        # Log for audit
        await self._log_promotion(role, old_primary, model_id)
```

#### 5.11.4 Claude Code Sync

Our Dagger agents ARE Claude Code. Keep them in sync:

```python
class ClaudeCodeSync:
    """
    Sync CommandCenter's Dagger agents with Claude Code CLI updates.
    
    Claude Code CLI is the reference implementation from Anthropic.
    Our Dagger agents should inherit its improvements.
    """
    
    async def check_for_updates(self) -> Optional[ClaudeCodeUpdate]:
        """
        Check if Claude Code CLI has updates.
        
        Sources:
        - npm registry (@anthropic/claude-code)
        - GitHub releases (anthropics/claude-code)
        - Anthropic changelog
        """
        current_version = await self._get_installed_version()
        latest_version = await self._get_latest_version()
        
        if latest_version > current_version:
            changelog = await self._fetch_changelog(current_version, latest_version)
            return ClaudeCodeUpdate(
                current=current_version,
                latest=latest_version,
                changelog=changelog,
                breaking_changes=self._detect_breaking_changes(changelog),
            )
        
        return None
    
    async def sync_dagger_image(self, update: ClaudeCodeUpdate) -> None:
        """
        Update Dagger agent image with new Claude Code version.
        
        Process:
        1. Build new image with updated Claude Code
        2. Test against benchmark tasks
        3. If passing, promote to default
        4. Keep old image as fallback
        """
        # Build new image
        new_image = await self._build_image(
            base="dagger-claude-agent",
            claude_code_version=update.latest,
        )
        
        # Benchmark
        benchmark = await self.model_registry.benchmark(
            model_id=f"dagger-agent:{update.latest}",
            task_types=["coding", "testing", "refactoring"],
        )
        
        if benchmark.recommendation == "promote":
            await self._promote_image(new_image)
            await self._update_dagger_config(new_image)
        else:
            await self._log_benchmark_failure(benchmark)
    
    async def extract_learnings(self) -> list[Learning]:
        """
        Extract learnings from Claude Code's self-improvements.
        
        Claude Code updates its own CLAUDE.md and .claude/ files.
        We should learn from what it learns.
        """
        # Get Claude Code's learned patterns
        claude_patterns = await self._read_claude_code_memory()
        
        # Compare against our skills
        our_skills = await self.skills_service.list_all()
        
        learnings = []
        for pattern in claude_patterns:
            matching_skill = self._find_matching_skill(pattern, our_skills)
            
            if matching_skill:
                # Check if Claude Code's version is better
                if await self._is_improvement(pattern, matching_skill):
                    learnings.append(Learning(
                        type="skill_update",
                        skill_id=matching_skill.id,
                        improvement=pattern,
                        source="claude_code_sync",
                    ))
            else:
                # New pattern we don't have
                learnings.append(Learning(
                    type="new_skill",
                    content=pattern,
                    source="claude_code_sync",
                ))
        
        return learnings
```

#### 5.11.5 Skill Evolution

Skills auto-update from agent learnings (like Claude Code CLI does):

```python
class SkillEvolution:
    """
    Evolve skills based on agent task outcomes.
    
    After every task:
    1. Extract what worked (or didn't)
    2. Compare against current skill
    3. Update skill if improvement detected
    4. Version control for rollback
    """
    
    async def post_task_learning(self, task_result: TaskResult) -> list[SkillUpdate]:
        """
        Extract learnings after task completion.
        
        Called automatically by BatchExecutor after every task.
        """
        updates = []
        
        if task_result.success:
            # Extract successful patterns
            patterns = await self._extract_patterns(task_result)
            
            for pattern in patterns:
                # Find related skill
                skill = await self.skills_service.find_by_topic(pattern.topic)
                
                if skill:
                    # Check if this is an improvement
                    if await self._is_better(pattern, skill):
                        updates.append(SkillUpdate(
                            skill_id=skill.id,
                            change_type="improve",
                            new_content=self._merge_pattern(skill, pattern),
                            evidence=task_result.id,
                            confidence=pattern.confidence,
                        ))
                else:
                    # Potential new skill
                    if pattern.confidence > 0.8:
                        updates.append(SkillUpdate(
                            skill_id=None,
                            change_type="create",
                            new_content=pattern.to_skill(),
                            evidence=task_result.id,
                            confidence=pattern.confidence,
                        ))
        
        else:  # Task failed
            # Extract what went wrong
            failure_patterns = await self._extract_failure_patterns(task_result)
            
            for pattern in failure_patterns:
                skill = await self.skills_service.find_by_topic(pattern.topic)
                if skill:
                    # Add warning/caveat to skill
                    updates.append(SkillUpdate(
                        skill_id=skill.id,
                        change_type="add_warning",
                        warning=pattern.failure_reason,
                        evidence=task_result.id,
                    ))
        
        return updates
    
    async def apply_updates(self, updates: list[SkillUpdate]) -> None:
        """
        Apply skill updates with version control.
        """
        for update in updates:
            # Create version snapshot
            if update.skill_id:
                await self._create_version(update.skill_id)
            
            # Apply update
            if update.change_type == "improve":
                await self.skills_service.update(
                    update.skill_id,
                    content=update.new_content,
                    evidence=[update.evidence],
                )
            elif update.change_type == "create":
                await self.skills_service.create(
                    content=update.new_content,
                    evidence=[update.evidence],
                    auto_generated=True,
                )
            elif update.change_type == "add_warning":
                await self.skills_service.add_warning(
                    update.skill_id,
                    warning=update.warning,
                    evidence=[update.evidence],
                )
    
    async def rollback_skill(self, skill_id: str, version: int) -> None:
        """
        Rollback a skill to a previous version.
        
        Used when an update causes regressions.
        """
        version_content = await self._get_version(skill_id, version)
        await self.skills_service.update(skill_id, content=version_content)
        await self._log_rollback(skill_id, version)
```

#### 5.11.6 Cross-Provider Benchmarking

Continuously compare models across providers:

```python
class CrossProviderBenchmark:
    """
    Compare models across providers for specific task types.
    
    Goal: Always use the BEST model for each task type,
    regardless of provider loyalty.
    """
    
    PROVIDERS = {
        "anthropic": ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-3-5"],
        "openai": ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
        "google": ["gemini-2.0-flash", "gemini-2.0-pro"],
        "deepseek": ["deepseek-v3", "deepseek-r1"],
    }
    
    TASK_TYPES = [
        "code_generation",
        "code_review", 
        "bug_detection",
        "refactoring",
        "documentation",
        "task_extraction",
        "ui_generation",
        "complex_reasoning",
        "fast_classification",
    ]
    
    async def run_benchmark_suite(self) -> BenchmarkReport:
        """
        Run full cross-provider benchmark.
        
        Schedule: Weekly, or on new model release.
        """
        results = {}
        
        for task_type in self.TASK_TYPES:
            # Get benchmark tasks
            tasks = await self._get_benchmark_tasks(task_type)
            
            task_results = {}
            for provider, models in self.PROVIDERS.items():
                for model in models:
                    try:
                        result = await self._benchmark_model(
                            model=model,
                            provider=provider,
                            tasks=tasks,
                        )
                        task_results[f"{provider}/{model}"] = result
                    except Exception as e:
                        task_results[f"{provider}/{model}"] = BenchmarkError(str(e))
            
            results[task_type] = task_results
        
        # Generate report with recommendations
        return BenchmarkReport(
            results=results,
            recommendations=self._generate_recommendations(results),
            current_assignments=self.model_registry.ROLE_ASSIGNMENTS,
            suggested_changes=self._suggest_changes(results),
        )
    
    def _generate_recommendations(self, results: dict) -> dict:
        """
        Generate model recommendations per task type.
        
        Considers:
        - Quality (primary)
        - Speed (secondary)
        - Cost (tertiary)
        - Reliability (must be >95%)
        """
        recommendations = {}
        
        for task_type, task_results in results.items():
            # Score each model
            scores = []
            for model_key, result in task_results.items():
                if isinstance(result, BenchmarkError):
                    continue
                    
                score = (
                    result.quality * 0.5 +
                    result.speed * 0.25 +
                    (1 - result.cost_normalized) * 0.15 +
                    result.reliability * 0.10
                )
                scores.append((model_key, score, result))
            
            # Sort by score
            scores.sort(key=lambda x: x[1], reverse=True)
            
            recommendations[task_type] = {
                "best": scores[0] if scores else None,
                "runner_up": scores[1] if len(scores) > 1 else None,
                "best_value": self._find_best_value(scores),  # Best quality/cost ratio
            }
        
        return recommendations
```

#### 5.11.7 The Gold Standard: Opus as Brain

Opus 4.5 is the strategic brain. When Opus 5 releases, auto-benchmark and promote:

```python
class BrainManager:
    """
    Manages the "brain" model - the strategic reasoning core.
    
    Current: Claude Opus 4.5
    Policy: Always use the most capable model for strategic decisions.
    """
    
    BRAIN_ROLE = "brain"
    BRAIN_TASKS = [
        "spec_review",
        "architecture_decisions", 
        "complex_debugging",
        "strategic_planning",
        "cross_project_reasoning",
    ]
    
    async def on_opus_release(self, release: ModelRelease) -> None:
        """
        Handle new Opus release.
        
        Opus is special - it's the brain. New Opus = immediate benchmark.
        """
        if "opus" not in release.model_id.lower():
            return
            
        # Immediate high-priority benchmark
        benchmark = await self.model_registry.benchmark(
            model_id=release.model_id,
            task_types=self.BRAIN_TASKS,
            priority="critical",
        )
        
        # If better on brain tasks, auto-promote
        if benchmark.recommendation == "promote":
            await self.model_registry.promote_model(
                model_id=release.model_id,
                role=self.BRAIN_ROLE,
            )
            
            # Notify
            await self._notify_brain_upgrade(
                old=self.model_registry.ROLE_ASSIGNMENTS[self.BRAIN_ROLE].primary,
                new=release.model_id,
                benchmark=benchmark,
            )
```

#### 5.11.8 Integration with Tech Radar

Method Radar is a specialized Tech Radar:

```python
# In strategic/radar/agent.py

class TechRadarAgent:
    """Base radar for project knowledge."""
    pass

class MethodRadar(TechRadarAgent):
    """
    Specialized radar for CC self-improvement.
    
    Inherits from TechRadarAgent but:
    - Different sources (AI/agent focused)
    - Different actions (benchmark, promote, sync)
    - Feeds Model Registry and Skill Evolution
    """
    
    PROJECT_ID = "commandcenter"  # CC is its own project
    
    async def on_finding(self, finding: MethodFinding) -> None:
        """
        Handle a method finding.
        
        Unlike regular Tech Radar (which just stores in memory),
        Method Radar triggers actions.
        """
        if finding.category == "model_release":
            await self.model_registry.on_model_release(finding.to_model_release())
            
        elif finding.category == "claude_code_update":
            await self.claude_code_sync.sync_dagger_image(finding.to_update())
            
        elif finding.category == "prompting_technique":
            await self.skill_evolution.evaluate_technique(finding)
            
        elif finding.category == "tool_release":
            await self._evaluate_tool(finding)
            
        elif finding.category == "security_advisory":
            await self._handle_security_advisory(finding)  # High priority!
```

#### 5.11.9 Multi-Project Radar System

Radars are **project-scoped**. Each project configures its own scanners based on project type:

```python
class ProjectRadarSystem:
    """
    Multi-project radar management.
    
    Each project gets scanners appropriate to its type:
    - Engineering projects: Tech Radar, Method Radar
    - Business projects: Strategy Radar, Opportunity Radar
    - All projects: Competitor Radar (if applicable)
    """
    
    PROJECT_TYPE_SCANNERS = {
        "engineering": [
            ScannerConfig(type="tech", description="Tools, frameworks, security updates"),
            ScannerConfig(type="method", description="Patterns, architectures, best practices"),
        ],
        "fintech": [
            ScannerConfig(type="tech", description="APIs, compliance tools, security"),
            ScannerConfig(type="strategy", description="Regulations, market shifts, policy changes"),
            ScannerConfig(type="opportunity", description="Partnerships, whitespace, M&A targets"),
            ScannerConfig(type="competitor", description="Competitor moves, pricing, features"),
        ],
        "healthcare": [
            ScannerConfig(type="tech", description="EMR integrations, HIPAA tools"),
            ScannerConfig(type="strategy", description="CMS changes, reimbursement shifts"),
            ScannerConfig(type="regulatory", description="FDA, state licensing, compliance"),
        ],
        "platform": [  # CommandCenter itself
            ScannerConfig(type="method", description="AI/agent improvements"),
            ScannerConfig(type="tech", description="Infrastructure, tooling"),
            ScannerConfig(type="forecaster", description="Better prediction methods"),
        ],
    }
    
    async def configure_project(self, project: Project) -> list[RadarScanner]:
        """
        Configure scanners for a project based on its type.
        """
        scanner_configs = self.PROJECT_TYPE_SCANNERS.get(
            project.type, 
            self.PROJECT_TYPE_SCANNERS["engineering"]  # Default
        )
        
        scanners = []
        for config in scanner_configs:
            scanner = await self._create_scanner(
                project_id=project.id,
                scanner_type=config.type,
                sources=self._get_sources_for_type(config.type, project),
            )
            scanners.append(scanner)
        
        return scanners
```

#### 5.11.10 Scanner Types

Different scanner types for different intelligence needs:

```python
class ScannerType(Enum):
    TECH = "tech"            # Tools, frameworks, libraries, security
    METHOD = "method"        # Patterns, architectures, best practices
    STRATEGY = "strategy"    # Market shifts, regulations, macro trends
    OPPORTUNITY = "opportunity"  # Partnerships, whitespace, expansion
    COMPETITOR = "competitor"    # Competitor moves, pricing, features
    REGULATORY = "regulatory"    # Compliance, licensing, policy
    FORECASTER = "forecaster"    # Better prediction/forecasting methods


class TechScanner(BaseScanner):
    """Scans for technical improvements."""
    
    async def get_sources(self, project: Project) -> list[RadarSource]:
        # Base sources for all tech projects
        sources = [
            RadarSource(type="github", topics=project.tech_stack),
            RadarSource(type="hackernews", keywords=project.tech_keywords),
            RadarSource(type="security", feeds=["nvd", "cve", "snyk"]),
        ]
        
        # Add project-specific sources
        if "python" in project.tech_stack:
            sources.append(RadarSource(type="pypi", packages=project.python_deps))
        if "typescript" in project.tech_stack:
            sources.append(RadarSource(type="npm", packages=project.npm_deps))
            
        return sources


class StrategyScanner(BaseScanner):
    """Scans for strategic intelligence."""
    
    async def get_sources(self, project: Project) -> list[RadarSource]:
        sources = []
        
        if project.type == "fintech":
            sources.extend([
                RadarSource(type="rss", feeds=[
                    "treasury.gov/ofac/feed",
                    "federalreserve.gov/feeds/press_all.xml",
                    "sec.gov/news/pressreleases.rss",
                ]),
                RadarSource(type="twitter", accounts=[
                    "@FinCEN", "@OFACNews", "@SECGov", "@ABORDC"
                ]),
                RadarSource(type="news", keywords=[
                    "fintech regulation", "OFAC sanctions", "AML compliance"
                ]),
            ])
        
        return sources


class OpportunityScanner(BaseScanner):
    """Scans for business opportunities."""
    
    async def get_sources(self, project: Project) -> list[RadarSource]:
        return [
            RadarSource(type="crunchbase", filters={
                "industry": project.industry,
                "funding_stage": ["seed", "series_a"],
            }),
            RadarSource(type="news", keywords=[
                f"{project.industry} partnership",
                f"{project.industry} acquisition",
                f"{project.industry} expansion",
            ]),
            RadarSource(type="linkedin", companies=project.competitor_companies),
        ]
```

#### 5.11.11 Forecaster Evolution

The Forecaster (OpenForecaster) should itself be subject to improvement:

```python
class ForecasterEvolution:
    """
    Continuously improve forecasting capabilities.
    
    Scans for:
    - Better forecasting methods (new algorithms, techniques)
    - New data sources (APIs, datasets)
    - Calibration improvements (Brier score optimization)
    """
    
    # Sources for forecasting method discovery
    FORECASTER_SOURCES = [
        RadarSource(type="arxiv", categories=["stat.ML", "cs.LG"], 
                    keywords=["forecasting", "prediction", "calibration"]),
        RadarSource(type="github", topics=["forecasting", "prediction-markets", "superforecasting"]),
        RadarSource(type="metaculus", watch="methods"),  # What top forecasters use
        RadarSource(type="polymarket", watch="accuracy"),  # Market-based methods
    ]
    
    # Data sources to ping daily
    DAILY_DATA_SOURCES = [
        DataSource(name="polymarket", endpoint="https://api.polymarket.com/markets"),
        DataSource(name="metaculus", endpoint="https://www.metaculus.com/api/questions"),
        DataSource(name="predictit", endpoint="https://www.predictit.org/api/markets"),
        DataSource(name="manifold", endpoint="https://manifold.markets/api/v0/markets"),
    ]
    
    async def daily_data_ingestion(self) -> DataIngestionReport:
        """
        Daily task: Pull fresh data from forecasting APIs.
        
        Scheduled: 6:00 AM UTC daily
        """
        results = []
        
        for source in self.DAILY_DATA_SOURCES:
            try:
                data = await self._fetch_source(source)
                
                # Store for training/calibration
                await self.forecaster_store.ingest(
                    source=source.name,
                    data=data,
                    timestamp=datetime.utcnow(),
                )
                
                # Check for resolved predictions (for calibration)
                resolved = await self._extract_resolved(data)
                if resolved:
                    await self._update_calibration(resolved)
                
                results.append(IngestionResult(source=source.name, success=True, count=len(data)))
                
            except Exception as e:
                results.append(IngestionResult(source=source.name, success=False, error=str(e)))
        
        return DataIngestionReport(results=results, timestamp=datetime.utcnow())
    
    async def scan_for_methods(self) -> list[ForecasterFinding]:
        """
        Scan for better forecasting methods.
        
        Looks for:
        - New algorithms (LLM-based forecasting, ensemble methods)
        - Calibration techniques (Platt scaling, isotonic regression)
        - Aggregation methods (extremized means, meta-prediction)
        """
        findings = []
        
        for source in self.FORECASTER_SOURCES:
            raw_findings = await self._scan_source(source)
            
            for finding in raw_findings:
                # Assess if this could improve our forecaster
                assessment = await self._assess_method(finding)
                
                if assessment.potential_improvement > 0.1:  # >10% improvement potential
                    findings.append(ForecasterFinding(
                        method=finding,
                        potential_improvement=assessment.potential_improvement,
                        implementation_effort=assessment.effort,
                        research_task=self._create_research_task(finding),
                    ))
        
        return findings
    
    async def benchmark_method(self, method: ForecasterMethod) -> BenchmarkResult:
        """
        Benchmark a new forecasting method against current.
        
        Uses historical predictions with known outcomes.
        """
        # Get test set of resolved predictions
        test_set = await self.forecaster_store.get_resolved_predictions(limit=100)
        
        # Run current method
        current_scores = []
        for pred in test_set:
            current_forecast = await self.current_forecaster.predict(pred.question)
            current_scores.append(self._brier_score(current_forecast, pred.outcome))
        
        # Run new method
        new_scores = []
        for pred in test_set:
            new_forecast = await method.predict(pred.question)
            new_scores.append(self._brier_score(new_forecast, pred.outcome))
        
        return BenchmarkResult(
            current_brier=np.mean(current_scores),
            new_brier=np.mean(new_scores),
            improvement=(np.mean(current_scores) - np.mean(new_scores)) / np.mean(current_scores),
            recommendation="promote" if np.mean(new_scores) < np.mean(current_scores) else "keep_current",
        )


# Daily task registration
@scheduler.task(cron="0 6 * * *")  # 6:00 AM UTC daily
async def forecaster_daily_ingestion():
    """Daily forecaster data ingestion."""
    evolution = ForecasterEvolution()
    report = await evolution.daily_data_ingestion()
    await notify_if_errors(report)


@scheduler.task(cron="0 0 * * 0")  # Weekly on Sunday
async def forecaster_method_scan():
    """Weekly scan for better forecasting methods."""
    evolution = ForecasterEvolution()
    findings = await evolution.scan_for_methods()
    
    for finding in findings:
        if finding.potential_improvement > 0.2:  # >20% improvement
            await create_research_task(finding.research_task)
```

#### 5.11.12 Self-Improvement Dashboard (UI)

View and manage all improvement systems in one place:

```typescript
// frontend/src/components/settings/SelfImprovementDashboard.tsx

interface SelfImprovementDashboardProps {
  projectId?: string;  // If set, show project-specific radars
}

function SelfImprovementDashboard({ projectId }: SelfImprovementDashboardProps) {
  return (
    <div className="self-improvement-dashboard">
      {/* Model Registry Section */}
      <section className="model-registry">
        <h2>Model Registry</h2>
        <ModelAssignmentTable />
        <RecentBenchmarks />
        <PendingPromotions />
      </section>
      
      {/* Scanner Status */}
      <section className="scanners">
        <h2>Active Scanners</h2>
        <ScannerGrid projectId={projectId} />
        {/* Shows: Tech, Method, Strategy, Opportunity scanners */}
        {/* Each with: Last scan, findings count, health status */}
      </section>
      
      {/* Recent Findings */}
      <section className="findings">
        <h2>Recent Findings</h2>
        <FindingsTimeline />
        {/* Filterable by: scanner type, impact, status */}
      </section>
      
      {/* Skill Evolution */}
      <section className="skill-evolution">
        <h2>Skill Updates</h2>
        <SkillVersionHistory />
        <PendingSkillUpdates />
      </section>
      
      {/* Forecaster Health */}
      <section className="forecaster">
        <h2>Forecaster</h2>
        <CalibrationChart />  {/* Brier score over time */}
        <DataSourceStatus />  {/* Daily ingestion health */}
        <MethodBenchmarks />  {/* A/B test results */}
      </section>
    </div>
  );
}

// Model Assignment Table
function ModelAssignmentTable() {
  const { assignments } = useModelRegistry();
  
  return (
    <table>
      <thead>
        <tr>
          <th>Role</th>
          <th>Primary Model</th>
          <th>Fallbacks</th>
          <th>Last Benchmark</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(assignments).map(([role, config]) => (
          <tr key={role}>
            <td>{role}</td>
            <td>
              <ModelBadge model={config.primary} />
            </td>
            <td>
              {config.fallback.map(m => <ModelBadge key={m} model={m} small />)}
            </td>
            <td>{formatDate(config.lastBenchmark)}</td>
            <td>
              <button onClick={() => triggerBenchmark(role)}>Benchmark</button>
              <button onClick={() => editAssignment(role)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Scanner Grid
function ScannerGrid({ projectId }: { projectId?: string }) {
  const { scanners } = useScanners(projectId);
  
  return (
    <div className="scanner-grid">
      {scanners.map(scanner => (
        <ScannerCard key={scanner.id} scanner={scanner} />
      ))}
    </div>
  );
}

function ScannerCard({ scanner }: { scanner: Scanner }) {
  return (
    <div className={`scanner-card ${scanner.status}`}>
      <div className="scanner-header">
        <ScannerIcon type={scanner.type} />
        <h3>{scanner.name}</h3>
        <StatusBadge status={scanner.status} />
      </div>
      
      <div className="scanner-stats">
        <div>Last scan: {formatRelative(scanner.lastScan)}</div>
        <div>Findings: {scanner.findingsCount}</div>
        <div>Sources: {scanner.sourceCount}</div>
      </div>
      
      <div className="scanner-actions">
        <button onClick={() => scanner.scanNow()}>Scan Now</button>
        <button onClick={() => scanner.configure()}>Configure</button>
        <button onClick={() => scanner.viewFindings()}>View Findings</button>
      </div>
    </div>
  );
}

// Forecaster Calibration Chart
function CalibrationChart() {
  const { calibrationHistory } = useForecaster();
  
  return (
    <div className="calibration-chart">
      <h3>Forecaster Calibration (Brier Score)</h3>
      <LineChart data={calibrationHistory}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 0.5]} />
        <Line dataKey="brierScore" stroke="#8884d8" />
        <ReferenceLine y={0.25} stroke="red" label="Random" />
      </LineChart>
      <p className="calibration-note">
        Lower is better. 0 = perfect, 0.25 = random guessing
      </p>
    </div>
  );
}
```

**Dashboard location:** Settings → Self-Improvement

**Key views:**

| Section | What it shows |
|---------|---------------|
| Model Registry | Current assignments, fallbacks, benchmark history |
| Scanners | Active scanners per project, health, findings count |
| Findings | Timeline of discoveries, filterable by type/impact |
| Skill Evolution | Recent skill updates, version history, rollbacks |
| Forecaster | Calibration chart, data source health, method benchmarks |

#### 5.11.13 Research Task Generation

When Method Radar or Forecaster Evolution finds something promising, auto-create research tasks:

```python
class ResearchTaskGenerator:
    """
    Generate research tasks from radar findings.
    
    Research tasks go through the standard pipeline:
    DISCOVER (radar) → Research Task → Agent investigates → VALIDATE → IMPROVE
    """
    
    async def create_from_finding(self, finding: RadarFinding) -> Task:
        """
        Create a research task from a radar finding.
        """
        if finding.category == "forecaster_method":
            return Task(
                title=f"Research: {finding.title}",
                description=f"""
                    Investigate this forecasting method for potential integration:
                    
                    **Finding:** {finding.summary}
                    **Source:** {finding.url}
                    **Potential Improvement:** {finding.potential_improvement:.0%}
                    
                    **Research Questions:**
                    1. How does this method work?
                    2. What are the implementation requirements?
                    3. What data does it need?
                    4. How does it compare to our current approach?
                    5. What's the effort to integrate?
                    
                    **Deliverables:**
                    - Summary document with findings
                    - Recommendation: integrate / skip / needs more research
                    - If integrate: implementation plan
                """,
                type="research",
                project_id="commandcenter",  # Or relevant project
                tags=["forecaster", "self-improvement", "research"],
                auto_generated=True,
                source_finding_id=finding.id,
            )
        
        # Similar templates for other finding types...
```

---

## 6. Knowledge Layer

Memory and learning that persists and compounds.

### 6.1 KnowledgeBeast

```python
"""
Module: knowledge/beast/service.py
Purpose: Vector + graph knowledge store
"""

class KnowledgeBeast:
    """
    Hybrid semantic search + relationship traversal.

    Storage: pgvector for embeddings
    """

    async def ingest(self, content: str, metadata: dict) -> str:
        """Ingest content with embeddings."""

    async def search(self, query: str, limit: int = 10) -> list[KnowledgeResult]:
        """Semantic search."""

    async def traverse(self, start_id: str, relationship: str) -> list[KnowledgeNode]:
        """Graph traversal."""
```

### 6.2 Provenance-First Memory

**Status**: 🔨 REDESIGNED based on 4-model architecture review (2026-01-08)

The original 6-layer memory was vulnerable to "epistemic drift" where claims became indistinguishable from facts. The new design treats everything as **claims with mandatory provenance**.

**Architecture Review Finding**: "Your memory design risks becoming a self-poisoning belief engine. Once promoted to semantic memory, errors become high-retrieval, high-authority."

#### 6.2.1 Core Principle: Claims, Not Facts

Every memory entry is a `MemoryClaim` with full lineage:

```python
"""
Module: knowledge/memory/claims.py
Purpose: Provenance-first memory claims

Security Classification: Internal
Architecture Review: Addresses "self-poisoning belief engine" (Round 1)
"""

from enum import Enum
from dataclasses import dataclass
from datetime import datetime


class ClaimType(Enum):
    """How this claim originated."""
    OBSERVATION = "observation"      # Direct from code/data analysis
    INFERENCE = "inference"          # Agent reasoning
    SYNTHESIS = "synthesis"          # Combined from multiple claims
    USER_STATED = "user_stated"      # User explicitly said this
    EXTERNAL_SOURCE = "external"     # From web search, Tech Radar, etc.


class TrustLevel(Enum):
    """Security trust classification."""
    SYSTEM = 4          # Core system, manually verified
    USER_VERIFIED = 3   # User explicitly confirmed
    AGENT_DERIVED = 2   # Agent reasoning from trusted sources
    EXTERNAL = 1        # Web search, APIs
    UNTRUSTED = 0       # Quarantined, potential threat


@dataclass
class SourceReference:
    """Where a claim came from."""
    source_type: str              # EPISODIC_MEMORY | USER_INPUT | WEB_SEARCH | CODE_EXECUTION
    source_id: str                # Reference to original
    timestamp: datetime
    confidence_at_source: float   # What was confidence when extracted
    extraction_method: str        # How was this extracted


@dataclass
class MemoryClaim:
    """
    A memory entry with full provenance.
    
    Key insight from architecture review: "If semantic memory stores 
    'facts' vs 'claims' differently, consolidation will silently corrupt."
    
    Solution: Everything is a claim. Nothing is ever just a "fact."
    """
    id: str
    content: str
    
    # Provenance (MANDATORY)
    claim_type: ClaimType
    sources: list[SourceReference]
    derived_from: list[str]       # IDs of claims this was synthesized from
    
    # Confidence (calibrated)
    confidence: float             # 0.0 - 1.0
    last_validated: datetime
    validation_method: str
    
    # Epistemics
    contradicts: list[str]        # IDs of conflicting claims
    trust_level: TrustLevel
    trust_ceiling: TrustLevel     # Can never exceed this
    
    # Utility tracking (for forgetting)
    retrieval_count: int = 0
    utility_score: float = 0.5    # Updated based on task outcomes
    last_retrieved: datetime | None = None
    
    # Lifecycle
    created_at: datetime
    expires_at: datetime | None = None
    tombstoned: bool = False
    tombstone_reason: str | None = None
```

#### 6.2.2 Synthesis, Not Promotion

**OLD (dangerous)**: Episodic → (pattern detection) → Semantic (loses provenance)

**NEW (safe)**:
```
Episodic claims → (synthesis with full lineage) → Synthesized claims
  - Original episodic claims remain accessible
  - Synthesized claim explicitly lists derived_from
  - Confidence = MIN(source confidences) × synthesis_penalty
  - Contradictions flagged, not overwritten
```

```python
class MemorySynthesizer:
    """
    Synthesize claims without losing provenance.
    
    Architecture Review Note: "Once promoted to semantic memory, errors 
    become high-retrieval, high-authority." We prevent this by never 
    deleting source claims and always tracking derivation.
    """
    
    SYNTHESIS_PENALTY = 0.9  # Each synthesis hop reduces confidence
    
    async def synthesize(
        self, 
        claims: list[MemoryClaim],
        synthesis_prompt: str
    ) -> MemoryClaim:
        """
        Create synthesized claim from multiple sources.
        
        - Sources remain accessible
        - Confidence = MIN(sources) × SYNTHESIS_PENALTY
        - derived_from links to all sources
        """
        min_confidence = min(c.confidence for c in claims)
        min_trust = min(c.trust_level.value for c in claims)
        
        synthesized_content = await self._llm_synthesize(claims, synthesis_prompt)
        
        return MemoryClaim(
            id=generate_id(),
            content=synthesized_content,
            claim_type=ClaimType.SYNTHESIS,
            sources=[],  # Synthesis has no direct sources
            derived_from=[c.id for c in claims],
            confidence=min_confidence * self.SYNTHESIS_PENALTY,
            trust_level=TrustLevel(min_trust),
            trust_ceiling=TrustLevel(min_trust),  # Can't exceed sources
            last_validated=datetime.now(),
            validation_method="synthesis",
            contradicts=[],
            created_at=datetime.now(),
        )
```

#### 6.2.3 Retrieval Surfaces Provenance

Agents see full context, not just content:

```python
class MemoryService:
    """Query memory with provenance surfacing."""
    
    async def query(
        self, 
        question: str,
        required_trust: TrustLevel = TrustLevel.EXTERNAL,
        include_tombstoned: bool = False,
    ) -> list[ClaimWithContext]:
        """
        Query memory with provenance.
        
        Returns claims enriched with:
        - Provenance chain (how we got here)
        - Contradiction warnings
        - Staleness warnings
        - Trust level
        """
        claims = await self._vector_search(question)
        
        # Filter by trust level
        claims = [c for c in claims if c.trust_level.value >= required_trust.value]
        
        # Filter tombstoned unless explicitly requested
        if not include_tombstoned:
            claims = [c for c in claims if not c.tombstoned]
        
        # Enrich with context
        enriched = []
        for claim in claims:
            enriched.append(ClaimWithContext(
                claim=claim,
                provenance_chain=await self._trace_sources(claim),
                contradiction_warnings=await self._find_contradictions(claim),
                staleness_warning=self._assess_staleness(claim),
            ))
        
        return enriched
```

**What agents see in context:**

```
RELEVANT CONTEXT (from memory):

CLAIM: "Authentication uses JWT with 24-hour expiration"
  Type: OBSERVATION (from code analysis)
  Confidence: 0.92
  Source: Agent session abc123, 2026-01-05
  Last validated: 2026-01-07
  Trust: AGENT_DERIVED
  ⚠️ Note: Contradicts claim #xyz ("JWT uses 1-hour expiration")

CLAIM: "Users prefer dark mode"
  Type: SYNTHESIS (from 3 user feedback sessions)
  Confidence: 0.67
  Derived from: [episodic_001, episodic_002, episodic_003]
  Last validated: 2025-12-20
  Trust: USER_VERIFIED
  ⚠️ Stale: Not validated in 18 days
```

#### 6.2.4 Interference-Based Forgetting

**Status**: 🆕 NEW from architecture review (2026-01-08)

Time-based retention doesn't match actual usefulness. This system uses **Saliency = Utility × Confidence × Recency** with difficulty adjustment.

```python
"""
Module: knowledge/memory/utility.py
Purpose: Track claim utility based on task outcomes

Architecture Review: Addresses "Goodhart's Law on utility" concern
by using Difficulty-Adjusted Utility (DAU) from Gemini review.
"""

class UtilityTracker:
    """
    Track whether retrieving a claim led to good outcomes.
    
    Key insight: Easy wins shouldn't inflate utility. We use
    Difficulty-Adjusted Utility (DAU) to value hard wins more.
    """
    
    async def on_memory_retrieved(self, claim_id: str, task_id: str):
        """Called whenever a memory is retrieved for a task."""
        claim = await self.get_claim(claim_id)
        claim.retrieval_count += 1
        claim.last_retrieved = datetime.now()
        
        # Register callback for when task completes
        self.register_callback(task_id, claim_id)
    
    async def on_task_complete(self, task_id: str, outcome: TaskOutcome):
        """Update utility for all claims used in this task."""
        cited_claims = await self.get_cited_claims(task_id)
        
        for claim_id in cited_claims:
            claim = await self.get_claim(claim_id)
            
            # Difficulty-Adjusted Utility (DAU)
            # DAU = (Outcome × Complexity) / Relative_Confidence
            dau = self._calculate_dau(outcome, claim)
            
            # Exponential moving average
            if outcome.success:
                claim.utility_score = self._ema(claim.utility_score, dau, alpha=0.1)
            else:
                # Faster decay for failures
                claim.utility_score = self._ema(claim.utility_score, 0.0, alpha=0.2)
    
    def _calculate_dau(self, outcome: TaskOutcome, claim: MemoryClaim) -> float:
        """
        Difficulty-Adjusted Utility.
        
        - Hard wins (high complexity, success) = high DAU
        - Easy wins (low complexity, success) = moderate DAU  
        - Overconfident failures (high confidence, failure) = severe penalty
        - Surprising discoveries (low confidence, success) = massive boost
        """
        complexity = outcome.complexity_score  # From RLM decomposition depth
        relative_confidence = claim.confidence
        
        if outcome.success:
            # Reward hard wins and surprises
            return (1.0 * complexity) / max(relative_confidence, 0.1)
        else:
            return 0.0  # Flat zero, alpha handles decay speed


class SaliencyScorer:
    """
    Calculate saliency for retrieval ranking and tombstoning.
    
    Saliency = utility × 0.4 + confidence × 0.3 + recency × 0.2 + frequency × 0.1
    """
    
    def calculate_saliency(self, claim: MemoryClaim) -> float:
        recency = self._exponential_decay(
            days_since(claim.last_retrieved), 
            half_life=14
        )
        frequency = self._log_normalize(claim.retrieval_count)
        
        saliency = (
            claim.utility_score * 0.4 +
            claim.confidence * 0.3 +
            recency * 0.2 +
            frequency * 0.1
        )
        
        # Contradiction penalty
        if claim.contradicts:
            saliency *= 0.7
        
        # Staleness penalty
        if days_since(claim.last_validated) > 30:
            saliency *= 0.8
        
        return saliency


class TombstoneService:
    """
    Mark low-saliency claims for decay.
    
    Tombstoned claims:
    - Excluded from default retrieval
    - Still accessible via explicit query
    - Permanently deleted after 90 days
    """
    
    async def sweep(self):
        """Periodic job to tombstone low-saliency claims."""
        candidates = await self.query("""
            SELECT * FROM claims 
            WHERE saliency < 0.2 
            AND retrieval_count > 5
            AND NOT tombstoned
        """)
        
        for claim in candidates:
            if await self._is_sole_source(claim):
                continue
            
            claim.tombstoned = True
            claim.tombstone_reason = f"Low saliency ({claim.saliency:.2f})"
            claim.expires_at = datetime.now() + timedelta(days=90)
```

#### 6.2.5 ε-Greedy Exploration (Metabolic Governor)

**Status**: 🆕 NEW from Gemini architecture review (2026-01-08)

To prevent "systemic ossification" where the system only retrieves what worked before, we implement ε-greedy exploration.

```python
"""
Module: knowledge/memory/exploration.py
Purpose: Prevent echo chamber via exploration

Architecture Review (Gemini): "The system should not treat Utility Scores 
as static. It should adopt an ε-greedy strategy."
"""

class ExplorationGovernor:
    """
    Balance exploitation (high-saliency) with exploration (low-saliency).
    
    For every retrieval:
    - (1-ε): Retrieve top-ranked by saliency (exploitation)
    - (ε): Retrieve tombstoned/low-utility/resonance claims (exploration)
    """
    
    def __init__(self):
        self.base_epsilon = 0.1  # 10% exploration by default
    
    def get_epsilon(self, context: RetrievalContext) -> float:
        """
        Dynamic ε based on system state.
        
        High ε (0.2+): Bootstrap phase, high contradiction rates
        Low ε (0.05): High-stakes tasks, need reliability
        """
        if context.is_bootstrap_phase:
            return 0.25  # Explore heavily when starting
        
        if context.contradiction_rate > 0.3:
            return 0.20  # Search harder when confused
        
        if context.is_high_stakes:
            return 0.05  # Reliability over novelty
        
        return self.base_epsilon
    
    async def retrieve(
        self, 
        question: str, 
        n: int = 10,
        context: RetrievalContext = None,
    ) -> list[MemoryClaim]:
        """Retrieve with exploration."""
        epsilon = self.get_epsilon(context or RetrievalContext())
        
        n_explore = int(n * epsilon)
        n_exploit = n - n_explore
        
        # Exploitation: top by saliency
        exploited = await self.memory.query(
            question, 
            limit=n_exploit,
            order_by="saliency DESC"
        )
        
        # Exploration: random from low-saliency/tombstoned
        explored = await self.memory.query(
            question,
            limit=n_explore,
            include_tombstoned=True,
            order_by="RANDOM()",
            where="saliency < 0.3 OR tombstoned = true"
        )
        
        return exploited + explored
```

#### 6.2.6 Belief Revision Protocol

**Status**: 🆕 NEW from architecture review (2026-01-08)

Contradiction flagging is not enough. We need a mechanism to **resolve** contradictions.

```python
"""
Module: knowledge/memory/belief_revision.py
Purpose: AGM-style belief revision for contradictions

Architecture Review (GPT-4): "You don't have a principled way to revise 
beliefs when conflicts appear. This is the domain of Truth Maintenance 
Systems / belief revision (AGM)."

Reference: Alchourrón, Gärdenfors, Makinson (1985)
"""

class BeliefRevisionService:
    """
    Resolve contradictions using principled belief revision.
    
    Options:
    1. Keep A, reject B (A has higher trust/confidence/recency)
    2. Keep B, reject A
    3. Synthesize C that reconciles both
    4. Keep both with mutual contradiction flags (unresolved)
    5. Escalate to human
    """
    
    async def resolve_contradiction(
        self,
        claim_a: MemoryClaim,
        claim_b: MemoryClaim,
    ) -> RevisionResult:
        """Resolve contradiction between two claims."""
        
        # Score each claim
        score_a = self._revision_score(claim_a)
        score_b = self._revision_score(claim_b)
        
        # Clear winner?
        if score_a > score_b * 1.5:
            return self._accept_reject(claim_a, claim_b)
        if score_b > score_a * 1.5:
            return self._accept_reject(claim_b, claim_a)
        
        # Try synthesis
        synthesis = await self._attempt_synthesis(claim_a, claim_b)
        if synthesis.success:
            return synthesis.result
        
        # Ground truth check if possible
        ground_truth = await self._check_ground_truth(claim_a, claim_b)
        if ground_truth.resolved:
            return ground_truth.result
        
        # Escalate or coexist
        return RevisionResult(
            resolved=False,
            action="ESCALATE_OR_COEXIST",
            reason="Cannot automatically resolve"
        )
    
    def _revision_score(self, claim: MemoryClaim) -> float:
        """Score claim for revision priority. Higher = more likely kept."""
        return (
            claim.trust_level.value * 0.4 +
            claim.confidence * 0.3 +
            self._recency_score(claim) * 0.2 +
            (1.0 if claim.claim_type == ClaimType.OBSERVATION else 0.5) * 0.1
        )
```

### 6.3 Tiered Visual Memory

**Status**: ✅ **VALIDATED** in CC2 (Phase 3d) - 93% token savings at scale

CC2 validated a 4-tier visual memory architecture that keeps images as images for Claude vision, achieving massive token savings at scale.

#### 6.3.1 The Architecture

| Tier | Storage | Tokens | Scope | Compression |
|------|---------|--------|-------|-------------|
| **HOT** | JSON | ~500 | Current session | None |
| **WARM** | JSON | ~2,500 | Last 5 sessions | None |
| **COLD** | Images | ~1,500/image | Historical (500+ sessions) | **10:1** |
| **ARCHIVE** | Images | Variable | Cross-project patterns | - |

**Key Insight**: Images stay as images for Claude vision - NOT extracted to text.

**Token Savings**: At 500 sessions, visual memory uses ~15,000 tokens vs ~150,000 tokens for text-based memory (93% reduction).

#### 6.3.2 Implementation

```python
"""
Module: knowledge/memory/visual/service.py
Purpose: Tiered visual memory (validated in CC2)

Security Classification: Internal
"""

from enum import Enum
from datetime import datetime
from pathlib import Path


class MemoryTier(Enum):
    """Memory tier classification."""
    HOT = "hot"           # JSON, current session
    WARM = "warm"         # JSON, recent sessions
    COLD = "cold"         # Images, historical
    ARCHIVE = "archive"   # Images, cross-project


@dataclass
class MemorySnapshot:
    """A memory snapshot at a point in time."""
    session_id: str
    timestamp: datetime
    tier: MemoryTier
    content: str | Path    # JSON content or image path
    metadata: dict


class TieredVisualMemory:
    """
    Tiered memory system with visual compression.

    Validated results (CC2 Phase 3d):
    - 93% token savings at 500+ sessions
    - Images contain rich context (code, diagrams, state)
    - Claude vision reads images directly, no extraction needed

    Tier transitions:
    - Session ends → HOT promoted to WARM
    - WARM full (5 sessions) → Oldest compressed to COLD (image)
    - COLD grows → Archive least-accessed
    """

    def __init__(self, storage_dir: Path):
        self.storage_dir = storage_dir
        self.hot = []          # Current session memories
        self.warm = []         # Last 5 sessions
        self.cold_dir = storage_dir / "cold"
        self.archive_dir = storage_dir / "archive"

    async def store_hot(self, content: str, metadata: dict) -> str:
        """
        Store in HOT tier (current session).

        Format: JSON with full context
        Typical: Code snippets, decisions, state
        """
        snapshot = MemorySnapshot(
            session_id=metadata.get("session_id"),
            timestamp=datetime.now(),
            tier=MemoryTier.HOT,
            content=content,
            metadata=metadata,
        )
        self.hot.append(snapshot)
        return snapshot.session_id

    async def promote_to_warm(self) -> None:
        """
        End session: HOT → WARM transition.

        Called when session ends.
        """
        if not self.hot:
            return

        # Add current HOT to WARM
        self.warm.extend(self.hot)
        self.hot = []

        # If WARM exceeds 5 sessions, compress oldest to COLD
        if len(self.warm) > 5:
            await self._compress_to_cold()

    async def _compress_to_cold(self) -> None:
        """
        Compress oldest WARM session to COLD (image).

        Creates a visual snapshot of the session:
        - Code changes (diff format)
        - Decisions made
        - Key conversations
        - State transitions

        10:1 compression via image encoding
        """
        oldest = self.warm.pop(0)  # Remove oldest session

        # Generate visual representation
        image_path = await self._render_session_image(oldest)

        # Store as COLD
        cold_snapshot = MemorySnapshot(
            session_id=oldest.session_id,
            timestamp=oldest.timestamp,
            tier=MemoryTier.COLD,
            content=image_path,
            metadata=oldest.metadata,
        )

        await self._save_cold(cold_snapshot)

    async def _render_session_image(self, session: MemorySnapshot) -> Path:
        """
        Render session as visual snapshot.

        Layout:
        ┌────────────────────────────────────────┐
        │ Session: {id}                          │
        │ Time: {timestamp}                      │
        ├────────────────────────────────────────┤
        │                                        │
        │  📝 DECISIONS MADE                     │
        │  • Implemented RLM executor            │
        │  • Chose Dagger over E2B               │
        │                                        │
        │  📂 FILES CHANGED                      │
        │  agents/rlm/executor.py (+250 lines)   │
        │  agents/rlm/complexity.py (+120 lines) │
        │                                        │
        │  🔍 KEY FINDINGS                       │
        │  RLM improves O(n²) tasks by 1000x     │
        │                                        │
        │  💬 CONVERSATIONS (summary)            │
        │  "How should we handle complex..."     │
        │                                        │
        └────────────────────────────────────────┘

        Image format: PNG, ~1500 tokens when read by Claude vision
        """
        image_path = self.cold_dir / f"{session.session_id}.png"

        # Use PIL/Cairo to render structured layout
        # Include: decisions, code changes, key conversations
        # Claude vision can read this directly without extraction

        return image_path

    async def query_across_tiers(self, query: str, include_cold: bool = True) -> list[MemorySnapshot]:
        """
        Query all memory tiers for relevant context.

        Steps:
        1. Search HOT (JSON - fast text search)
        2. Search WARM (JSON - fast text search)
        3. If include_cold: Load COLD images, let Claude vision search them

        Claude vision reads the images directly.
        NO text extraction needed.
        """
        results = []

        # Search HOT + WARM (text-based)
        for snapshot in self.hot + self.warm:
            if self._matches(query, snapshot.content):
                results.append(snapshot)

        # Search COLD (vision-based)
        if include_cold:
            cold_images = list(self.cold_dir.glob("*.png"))
            for image_path in cold_images:
                # Load image, let Claude vision search it
                # This is the 93% token savings: images stay as images
                results.append(MemorySnapshot(
                    session_id=image_path.stem,
                    timestamp=datetime.fromtimestamp(image_path.stat().st_mtime),
                    tier=MemoryTier.COLD,
                    content=image_path,
                    metadata={},
                ))

        return results

    def _matches(self, query: str, content: str) -> bool:
        """Simple text matching for HOT/WARM."""
        return query.lower() in content.lower()
```

#### 6.3.3 Integration with Agent Framework

Agents can query visual memory:

```python
# In agent execution:
from knowledge.memory.visual import TieredVisualMemory

memory = TieredVisualMemory(storage_dir=Path("./memory"))

# Query across all tiers
snapshots = await memory.query_across_tiers(
    query="RLM implementation decisions",
    include_cold=True  # Include historical image memories
)

# Agent receives:
# - HOT/WARM: JSON content (direct text)
# - COLD: Image paths (Claude vision reads them)

# The images contain rich context but use 93% fewer tokens
```

#### 6.3.4 Why This Works

1. **Claude Vision**: Reads images natively, no extraction needed
2. **Rich Context in Images**: Code, diagrams, state transitions
3. **10:1 Compression**: 500 sessions = ~15k tokens vs ~150k tokens
4. **No Information Loss**: Visual representation preserves structure
5. **Fast Lookup**: Recent sessions in JSON (fast), historical in images (compact)

### 6.4 Skills Store

```python
"""
Module: knowledge/skills/service.py
Purpose: Procedural memory (skills)
"""

class SkillsService:
    """
    Skill discovery, loading, versioning.

    Skills are SKILL.md files with frontmatter.
    """

    async def find(self, task: str) -> list[Skill]:
        """Find skills relevant to task."""

    async def load(self, skill_id: str) -> str:
        """Load skill content."""

    async def create(self, name: str, content: str) -> Skill:
        """Create new skill from learned pattern."""

    async def archive(self, skill_id: str, reason: str) -> ArchiveResult:
        """Archive skill with governance checks."""

    async def restore(self, skill_id: str) -> Skill:
        """Restore skill from archive."""
```

#### 6.4.1 Skill Governance

**The 2026-01-12 Incident:** Skills were consolidated from 35 → 3, archiving 8,955 lines of operational knowledge without extracting key principles. This was organizational amnesia - the system forgot its own institutional knowledge.

CommandCenter's value proposition is "procedural memory that compounds." The governance system ensures this memory cannot be accidentally deleted.

##### Cardinal Rule

> **Never archive a skill without preserving its key principles in an active skill.**

##### Governance Service

```python
"""
Module: knowledge/skills/governance.py
Purpose: Prevent knowledge loss during skill lifecycle changes
"""

class SkillGovernanceService:
    """
    Enforces rules that prevent institutional knowledge loss.

    Critical categories that require replacement before archival:
    - meta/governance: Skills that ensure other skills are used
    - safety: Skills that prevent destructive actions
    - operational: Skills for core workflows (context, autonomy)
    - quality: Skills for code/doc standards
    """

    PROTECTED_CATEGORIES = ['meta', 'safety', 'operational', 'quality']
    CONSOLIDATION_THRESHOLD = 5  # Human approval required above this

    async def validate_archive(
        self,
        skill_id: str,
        extracted_principles: str | None = None,
        target_skill_id: str | None = None
    ) -> ArchiveValidation:
        """
        Validate that archiving this skill won't cause knowledge loss.

        Returns:
            ArchiveValidation with:
            - approved: bool
            - requires_human_approval: bool
            - missing_extraction: bool
            - blocked_reason: str | None
        """
        skill = await self.skills_service.load(skill_id)

        # Check if protected category
        if skill.category in self.PROTECTED_CATEGORIES:
            if not extracted_principles or not target_skill_id:
                return ArchiveValidation(
                    approved=False,
                    blocked_reason=f"Skill category '{skill.category}' requires "
                                   f"principle extraction before archival"
                )

        # Check if principles were extracted
        if not extracted_principles:
            return ArchiveValidation(
                approved=False,
                missing_extraction=True,
                blocked_reason="Key principles must be extracted before archival"
            )

        return ArchiveValidation(approved=True)

    async def validate_consolidation(
        self,
        skill_ids: list[str],
        target_skill_id: str,
        extracted_principles: dict[str, str]
    ) -> ConsolidationValidation:
        """
        Validate bulk consolidation of skills.

        Consolidations affecting >5 skills require human approval.
        """
        if len(skill_ids) > self.CONSOLIDATION_THRESHOLD:
            return ConsolidationValidation(
                approved=False,
                requires_human_approval=True,
                message=f"Consolidating {len(skill_ids)} skills requires "
                        f"human approval (threshold: {self.CONSOLIDATION_THRESHOLD})"
            )

        # Validate each skill
        for skill_id in skill_ids:
            result = await self.validate_archive(
                skill_id,
                extracted_principles.get(skill_id),
                target_skill_id
            )
            if not result.approved:
                return ConsolidationValidation(
                    approved=False,
                    blocked_skill=skill_id,
                    blocked_reason=result.blocked_reason
                )

        return ConsolidationValidation(approved=True)

    async def extract_principles(self, skill_id: str) -> ExtractedPrinciples:
        """
        Use LLM to extract key principles from a skill.

        Returns 50-100 word essence capturing:
        - What behavior would be lost if this skill disappeared?
        - What are the non-negotiable rules?
        - What mistakes does this prevent?
        """
        skill = await self.skills_service.load(skill_id)

        prompt = f"""Extract the key principles from this skill in 50-100 words.

Focus on:
1. What behavior would be lost if this skill disappeared?
2. What are the non-negotiable rules?
3. What mistakes does this prevent?

Skill content:
{skill.content}
"""

        principles = await self.llm.complete(prompt)
        return ExtractedPrinciples(
            skill_id=skill_id,
            essence=principles,
            extracted_at=datetime.now()
        )
```

##### Archive Workflow

```
┌─────────────────┐
│ Archive Request │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Is skill in protected       │
│ category?                   │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
   YES        NO
    │         │
    ▼         │
┌───────────────────────┐     │
│ Were principles       │     │
│ extracted?            │     │
└────────┬──────────────┘     │
         │                    │
    ┌────┴────┐               │
    │         │               │
    ▼         ▼               │
   YES        NO              │
    │         │               │
    │         ▼               │
    │    ┌─────────────┐      │
    │    │ ❌ BLOCKED  │      │
    │    │ Extract     │      │
    │    │ principles  │      │
    │    │ first       │      │
    │    └─────────────┘      │
    │                         │
    └────────────┬────────────┘
                 │
                 ▼
┌─────────────────────────────┐
│ Was target skill specified  │
│ for principle merger?       │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
   YES        NO
    │         │
    ▼         ▼
┌─────────┐  ┌─────────────┐
│ ✅      │  │ ❌ BLOCKED  │
│ APPROVE │  │ Specify     │
│ ARCHIVE │  │ target      │
└─────────┘  └─────────────┘
```

##### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/skills/{id}/archive` | POST | Archive with governance validation |
| `/api/v1/skills/{id}/restore` | POST | Restore from archive |
| `/api/v1/skills/consolidate` | POST | Bulk consolidation with approval |
| `/api/v1/skills/{id}/extract-principles` | POST | Extract key principles via LLM |
| `/api/v1/skills/governance/validate` | POST | Validate archive/consolidation |

##### Audit Trail

Every archive/consolidation is logged:

```python
@dataclass
class SkillArchiveEvent:
    skill_id: str
    action: str  # 'archive', 'restore', 'consolidate'
    reason: str
    extracted_principles: str | None
    target_skill_id: str | None
    approved_by: str | None  # For human approvals
    timestamp: datetime

    # For recovery
    skill_snapshot: str  # Full content at archive time
```

##### Recovery Protocol

If skills were archived without proper extraction:

1. **Audit** - List all archived skills, check for missing principles
2. **Restore** - Move critical skills back to active
3. **Extract** - Use LLM to extract principles from remaining archives
4. **Merge** - Add extracted principles to appropriate active skills
5. **Document** - Record the incident in lessons skill

### 6.5 User Model (Meta Memory)

The User Model lives in Layer 5 (Meta) of the memory hierarchy. It's the system's understanding of **you**, not your projects.

#### 6.5.1 What the Model Contains

```python
@dataclass
class UserModel:
    """Platform-level model of the user."""
    
    user_id: str
    
    # Working patterns
    working_rhythms: list[Pattern]        # When you're most productive
    decision_tendencies: list[Pattern]    # How you make decisions
    communication_style: dict             # How you like to communicate
    
    # Recurring themes
    concerns: list[Concern]               # Things that keep coming up
    avoidances: list[Avoidance]           # Things you circle but don't do
    interests: list[Interest]             # Topics you engage with deeply
    
    # Preferences (learned + stated)
    preferences: dict                     # UI, notification, workflow prefs
    stated_goals: list[Goal]              # What you say you want
    actual_priorities: list[Priority]     # What your behavior shows
    
    # Inner Council config
    default_viewpoint: str                # Which voice by default
    viewpoint_rules: list[ViewpointRule]  # Context-aware voice selection
    attention_level: str                  # minimal, occasional, moderate, frequent
    
    # Meta
    model_confidence: float               # How sure the system is overall
    observation_count: int                # How many interactions inform this
    last_updated: datetime
    created_at: datetime
```

#### 6.5.2 Privacy & Control

| Right | Implementation |
|-------|----------------|
| **View** | `/api/v1/me/model` returns full model as JSON |
| **Correct** | `/api/v1/me/model` PATCH updates specific fields |
| **Delete** | `/api/v1/me/model` DELETE removes all user data |
| **Export** | `/api/v1/me/model/export` downloads portable format |
| **Mute** | Disable specific pattern types from being tracked |

#### 6.5.3 Model Decay

Patterns that aren't reinforced decay over time:

```python
async def decay_stale_patterns(self, user_id: str):
    """Reduce confidence of patterns not recently observed."""
    for pattern in patterns:
        days_since = (now - pattern.last_observed).days
        if days_since > 30:
            # Decay 10% per week over 30 days
            decay = 0.1 * ((days_since - 30) / 7)
            pattern.confidence = max(0.1, pattern.confidence - decay)
            if pattern.confidence < 0.2:
                pattern.status = 'archived'
```

#### 6.5.4 Cross-Project Patterns

The User Model detects patterns **across** projects:

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│    Veria    │   │  Performia  │   │  Personal   │
│             │   │             │   │             │
│ "worried    │   │ "pricing    │   │ "budget     │
│  about      │   │  strategy   │   │  concerns"  │
│  pricing"   │   │  unclear"   │   │             │
└─────┬───────┘   └─────┬───────┘   └─────┬───────┘
      │                 │                 │
      └─────────────────┼─────────────────┘
                        ▼
              ┌───────────────────────┐
              │    USER MODEL         │
              │                       │
              │  Pattern detected:    │
              │  "Pricing/money       │
              │   concerns across     │
              │   3 projects"         │
              │                       │
              │  Confidence: 0.85     │
              └───────────────────────┘
```

This enables insights like: "I notice you've mentioned pricing/budget concerns across Veria, Performia, and your personal projects. Is there a deeper financial concern we should address?"

---

## 7. Frontend Shell

CC3's frontend is built on one principle: **Users see IDEAS and RESULTS, not machinery.**

### 7.1 The Three Surfaces

| Surface | Purpose | Primary User |
|---------|---------|--------------|
| **Ideas Tab** | Simple entry point | Everyone |
| **VISLZR** | Exploration and connection | Thinkers, Strategists |
| **Execution** | Task management and agent monitoring | Builders |

Users flow naturally: Ideas → VISLZR (explore) → Execution (build)

### 7.2 Ideas Tab - The Simple Entry Point

The most important UX in CC3. One input, three paths.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💡 Ideas                                              [Project: CC3]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  What do you want to do?                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Implement the controls framework with OSCAL export               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [🔍 Validate First]  [📋 Create Plan]  [⚡ Just Do It]                 │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  Recent Ideas                                                            │
│  • "Add hash-chained audit logging" ─────────────── ✅ Done (1h ago)    │
│  • "Research FIPS 186-5 requirements" ───────────── 🔄 Validating       │
│  • "Implement signature service" ────────────────── 📋 Planning         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### The Three Paths

| Button | What Happens | User Sees |
|--------|--------------|-----------|
| **Validate First** | Hypothesis Engine decomposes → AI Arena validates (invisible) | "Confidence: 87%. Here's the analysis..." |
| **Create Plan** | Plan extraction → Task breakdown | Execution tab with task cards |
| **Just Do It** | Immediate agent execution | Execution tab with live stream |

#### Voice Input

Tap 🎤 or say wake word:
1. Speech-to-text transcription
2. Intent detection (question? idea? command?)
3. Auto-routing to appropriate path

### 7.3 VISLZR - The Exploration Canvas

VISLZR is THE human interface for thinking. Not documentation, not dashboards—**thinking**.

> **See also**: Section 7.9 (Living Canvas Vision) for the full UI evolution where VISLZR becomes the entire app surface.

#### 7.3.1 Core Concept: Intent Crystallizes Over Time

Ideas start fuzzy and become concrete through exploration:

```
Fuzzy Idea (💭) → Exploration → Resonance (🔮) → Crystal (💎) → Task (☐) → Done (✅)
```

VISLZR visualizes and supports this journey.

#### 7.3.2 Node Types

| Type | Icon | Description | Example |
|------|------|-------------|---------|
| **Idea** | 💡 | Fuzzy thought, not yet validated | "Maybe add GraphQL?" |
| **Concept** | 🔵 | Defined but not actionable | "FedRAMP compliance" |
| **Task** | ☐ | Actionable, can be executed | "Implement audit service" |
| **Document** | 📄 | Reference material | "NIST 800-53 controls" |
| **Code** | 🔷 | File or repository | "core/audit/service.py" |
| **Session** | 🤖 | Agent execution record | "Agent run: signatures" |
| **Crystal** | 💎 | Validated insight from Wander | "Pattern: all compliance needs audit" |
| **Resonance** | 🔮 | Detected connection (unvalidated) | Links between OFAC + audit |
| **Entity** | 👤 | Person, company, system | "Anthropic", "FedRAMP PMO" |
| **Metric** | 📊 | Tracked number | "API latency: 45ms" |

#### Visual Language: The Crystallization Flow

Ideas don't start sharp. They emerge as vague intuitions and crystallize through validation:

```
RESONANCE          →        IDEA           →      HYPOTHESIS      →       TASK
   ◐                         ◉                      ◈                      ◆
   
Soft, diffuse          Taking shape          Being tested          Sharp, actionable
Ambient glow           Pulsing edges         Validation ring       Solid edges
"Something about..."   "We should..."        "If X then Y..."      "Implement X"
```

| State | Visual Treatment |
|-------|------------------|
| **Resonance** | Soft gradients, no defined edges, gentle pulse |
| **Idea** | Crystallizing edges, inner glow, slight motion |
| **Hypothesis** | Ring around node (validation in progress), confidence % visible |
| **Task** | Sharp geometric shapes, clear borders, status indicators |

#### 7.3.3 Action Ring

When a node is selected, an outer ring appears with contextual actions:

```
                      ┌────────────┐
                     /   Explore    \
                    /    Further     \
         ┌─────────┐                  ┌─────────┐
        /  Run      \                /  Validate \
       /   Agent     \──────────────/    Claim   \
      │               │     💡     │              │
      │    [NODE]     │    Idea    │    [NODE]   │
       \             /              \            /
        \  Connect  /                \  Create  /
         \  To...  /                  \  Plan  /
          └───────┘                    └───────┘
```

#### Actions by Node Type

| Node Type | Ring Actions |
|-----------|--------------|
| **Idea** | Explore Further, Validate, Create Plan, Connect To..., Find Related |
| **Task** | ⚡ Run Agent, Edit, Split Into Subtasks, Show Dependencies, Mark Complete |
| **Document** | Extract Tasks, Summarize, Find Related, Update, Archive |
| **Code** | 🔒 Security Scan, Analyze, Refactor, Test, Dependencies |
| **Session** | View Output, Re-run, Fork, Extract Learnings |
| **Crystal** | Accept, Reject, Explore Source, Connect To... |
| **Resonance** | Investigate, Crystallize, Dismiss |
| **Entity** | Research, Find Connections, Add Notes |
| **Metric** | Track History, Set Alert, Decompose |

#### 7.3.4 Resonance Visualization

When Wander (or user exploration) detects unexpected connections:

- Connected nodes **pulse** with a soft glow
- Connection lines **animate**
- Notification: "🔮 Resonance detected between [X] and [Y]"
- Click to: Investigate → Crystallize or Dismiss

#### 7.3.5 Ambient Intelligence

The canvas is **alive**. No notifications, no popups—just gentle visual emphasis.

| State | Visual |
|-------|--------|
| Normal node | ○ |
| Needs attention | ◉ (brighter, subtle pulse) |
| Critical | ◉ (stronger pulse, warm color shift) |
| Agent working | ◉ (spinning ring around it) |
| Validation in progress | ◎ (concentric rings) |

**Living Behaviors**:
- Nodes **pulse** when being validated (AI Arena working invisibly)
- Connections **form** in real-time as relationships are discovered
- Background **breathes**—subtle animation showing The Loop is running
- **Attention gradients**—nodes that need focus glow brighter

The canvas itself becomes the notification system.

#### 7.3.6 Project Scoping

Slide-out panel on left side:

```
┌──────────────────────────────────────┐
│ [≡] Projects                    [+]  │
├──────────────────────────────────────┤
│ ☑ CommandCenter 3.0  (12 active)    │
│ ☐ Veria              (3 active)     │
│ ☐ Meridian           (5 active)     │
│ ─────────────────────────────────── │
│ [All] [Active] [With Tasks]         │
└──────────────────────────────────────┘
```

- Single select: Show only that project
- Multi-select: Combined view with project colors
- Persists across tabs

#### 7.3.7 Voice in VISLZR

- Tap 🎤 anywhere to start voice input
- Speech creates new node at cursor
- Say "connect to [node name]" to create edge
- Say "explore [topic]" to trigger Wander focus

#### 7.3.8 VISLZR as Universal Interface

VISLZR isn't just for ideas - it's the **universal agent interface** for any structured system. Every node is an Interactive Card with drill-down and actions.

**Supported data sources:**

| Source | Node Types | Example Actions |
|--------|------------|----------------|
| Code Repo | Repo → Directory → File → Function/Class | Run tests, View blame, Refactor, Add docs |
| Database | Schema → Table → Row | Query, Update, Add index, Backup |
| Container | Registry → Image → Container | Start, Stop, Logs, Shell, Vuln scan |
| Kubernetes | Cluster → Namespace → Pod | Scale, Restart, Port-forward, Describe |
| API | Service → Endpoint → Request | Test, Mock, Generate client |
| Cloud | Account → Region → Resource | Provision, Modify, Destroy, Cost analyze |

**Drill-down pattern:**

```
┌────────────────────────────────────────────────────────────────────────┐
│  CommandCenter2.0 (repo)                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  backend/   │  │  frontend/  │  │   docs/     │  │  skills/  │  │
│  │  43 files   │  │  28 files   │  │  12 files   │  │  20 files │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
│        │                                                            │
│        ▼  (click to drill down)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  backend/                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │   app/     │  │   libs/    │  │   tests/   │  │  core/    │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

**Action ring on any node:**

Right-click a file node:
```
        [🔍 View]          
    [⚙️ Refactor]  [🧪 Test]
[📝 Edit]    ●    [🔒 Vuln Scan]
    [📊 Analyze]  [🤖 Ask AI]
        [📄 Docs]         
```

Right-click a container:
```
        [📜 Logs]          
    [▶️ Start]   [⏹ Stop]
[🐚 Shell]    ●    [🔄 Restart]
    [🔍 Inspect]  [🚫 Remove]
        [🛡️ Scan]         
```

**Inline agent execution:**

Click "Vuln Scan" on a container → Mini-CLI appears inside the node:

```
┌─────────────────────────────────────────┐
│  api-server:latest            🟢 Running │
├─────────────────────────────────────────┤
│  $ trivy image api-server:latest        │
│  Scanning...                    [45%]   │
│  ⚠️  CVE-2024-1234 (HIGH) in openssl   │
│  ⚠️  CVE-2024-5678 (MED) in curl       │
│                                         │
│  [View Full Report] [Fix Now] [Ignore]  │
└─────────────────────────────────────────┘
```

**Database interaction:**

Drill into a table, see rows as nodes, click to edit:

```
┌─────────────────────────────────────────┐
│  users (table)              1,234 rows │
├─────────────────────────────────────────┤
│  id: 42                                 │
│  email: dan@example.com                 │
│  role: admin                            │
│  created: 2024-01-15                    │
│                                         │
│  [✏️ Edit] [🗑️ Delete] [🔗 Relations]     │
└─────────────────────────────────────────┘
```

**Data source adapters:**

```typescript
// Pluggable adapter pattern
interface VISLZRDataSource {
  id: string;
  name: string;
  icon: LucideIcon;
  
  // Get root nodes
  getRoots(): Promise<VISLZRNode[]>;
  
  // Get children of a node
  getChildren(nodeId: string): Promise<VISLZRNode[]>;
  
  // Get actions available for a node
  getActions(nodeId: string): Promise<ActionRingItem[]>;
  
  // Execute an action
  executeAction(nodeId: string, actionId: string): AsyncIterable<OutputLine>;
}

// Built-in adapters
const ADAPTERS = [
  GitRepoAdapter,      // Local/GitHub repos
  PostgresAdapter,     // PostgreSQL databases
  DockerAdapter,       // Docker containers
  KubernetesAdapter,   // K8s clusters
  S3Adapter,           // AWS S3 buckets
  FileSystemAdapter,   // Local filesystem
];
```

**Key principle:** VISLZR is the **visual shell** - anything you can do in a terminal, you can do by drilling into nodes and clicking actions. The Mini-CLI provides the escape hatch when you need raw command access.

### 7.4 Execution View - Task Management

Kanban + agent streaming for getting things done.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 Execution                                          [Project: CC3]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │   QUEUED     │  │   RUNNING    │  │   REVIEW     │  │   DONE     │  │
│  │              │  │              │  │              │  │            │  │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌────────┐ │  │
│  │ │ Task 3   │ │  │ │ Task 1   │ │  │ │ Task 2   │ │  │ │Task 0  │ │  │
│  │ │ 🤖 coder │ │  │ │ 🔄 47%   │ │  │ │ 👁 Review│ │  │ │ ✅     │ │  │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │  │ └────────┘ │  │
│  │              │  │              │  │              │  │            │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  Agent Stream: Task 1 - Implement audit service                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🤖 Creating hash-chain implementation...                         │   │
│  │ 📝 Writing core/audit/service.py                                 │   │
│  │ ✅ Tests passing (4/4)                                           │   │
│  │ ...                                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Task Card Detail

Click any card for full detail:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Task: Implement audit service                          [▶ Run Agent]   │
├─────────────────────────────────────────────────────────────────────────┤
│  Status: Running (4m 23s)                                                │
│  Agent: backend-coder (claude-sonnet-4)                                 │
│  Phase: IMPROVE                                                          │
│  Memory: 2,340 tokens loaded (project: cc3)                             │
│                                                                          │
│  Dependencies:                                                           │
│  ├── ✅ Database schema defined                                          │
│  └── ✅ Base models created                                              │
│                                                                          │
│  Files Changed:                                                          │
│  ├── core/audit/service.py (new)                                        │
│  └── core/audit/models.py (new)                                         │
│                                                                          │
│  [View Live Output] [View Changes] [Stop] [Pause]                       │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Human Review Toggle

Settings gear → Execution Settings:

- ○ Always require review before commit
- ● Review only for high-impact changes (>5 files)
- ○ Never require review (fully autonomous)

Per-task override available.

#### 7.4.1 Pipeline Ingest UI Improvements

The spec-to-execution flow needs these improvements:

**Current Issues:**

| Issue | Description | Priority |
|-------|-------------|----------|
| Execute button position | Button at bottom - must scroll past all tasks to execute | High |
| No task interaction | Can't click/expand tasks to see acceptance criteria, files | High |
| Clear button broken | Red X on file path input doesn't clear | Medium |
| No progressive loading | All tasks render at once, no lazy/batch loading | Medium |
| Tasks don't populate Kanban | Tasks stay in modal, should flow to execution board | High |
| Single branch shown | Only shows feature branch, not per-task branches | Low |
| No [DONE] detection | Doesn't recognize already-completed phases from spec | Critical |

**Target UX:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Load Spec: EXECUTION_PLAN_V2.md                              [Execute] │
├─────────────────────────────────────────────────────────────────────────┤
│  14 tasks · 8 batches · feature/cc3-ux-intelligence                     │
│  ⚠️ 4 tasks skipped (already complete)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Batch 1 (parallel)                                          [Expand ▼] │
│  ├── Task 18: Project Focus Model                                [···]  │
│  └── Task 21: Signal Extraction                                  [···]  │
│                                                                          │
│  Batch 2 (parallel)                                          [Expand ▼] │
│  ├── Task 19: Generative Panels                                  [···]  │
│  └── Task 22: Pattern Detection                                  [···]  │
│  ...                                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key improvements:**
- Execute button pinned to header (always visible)
- Collapsible batches (expand to see tasks)
- Click task → slide-out drawer with full details
- Clear button (X) actually clears the input
- Shows skipped/completed task count
- Progressive rendering for large specs
- After execute → tasks flow to Kanban board

#### 7.4.2 Agent Configuration & Model Selection

Before pipeline execution, users configure which models/subscriptions to use:

**Pre-execution configuration panel:**

```
┌───────────────────────────────────────────────────────────────────┐
│  Agent Configuration                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Available Subscriptions:                                         │
│  ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐ │
│  │ ✅ Claude Max    │ │ ⬜ Anthropic API │ │ ⬜ Gemini Pro   │ │
│  │    (unlimited)  │ │    ($0.42/run)  │ │   ($0.18/run)  │ │
│  └───────────────────┘ └───────────────────┘ └──────────────────┘ │
│                                                                   │
│  Model Assignment by Role:                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Task Extraction    [Haiku 3.5 ▼]     Fast, cheap           │ │
│  │  Code Generation    [Sonnet 4 ▼]      Best for code         │ │
│  │  Code Review        [Sonnet 4 ▼]      Catches bugs          │ │
│  │  Visualization      [Gemini 2 ▼]      Good at UI gen        │ │
│  │  Documentation      [Haiku 3.5 ▼]     Fast enough           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Estimated Cost: ~$2.40 for 10 tasks (using API)                  │
│  Estimated Time: ~15 min parallel, ~45 min sequential             │
│                                                                   │
│  [Save as Default]                        [Execute Pipeline →]    │
└───────────────────────────────────────────────────────────────────┘
```

**Multi-subscription strategy:**

```typescript
interface AgentConfig {
  role: 'extraction' | 'coding' | 'review' | 'visualization' | 'docs';
  model: string;           // claude-sonnet-4, gemini-2.0-flash, etc.
  subscription: string;    // claude-max, anthropic-api, gemini-pro
  fallback?: AgentConfig;  // If primary fails/rate-limited
}

// Smart routing based on task type
const DEFAULT_ROUTING: Record<string, AgentConfig> = {
  extraction: { role: 'extraction', model: 'claude-haiku-3.5', subscription: 'claude-max' },
  coding: { role: 'coding', model: 'claude-sonnet-4', subscription: 'claude-max' },
  review: { role: 'review', model: 'claude-sonnet-4', subscription: 'anthropic-api' },
  visualization: { role: 'visualization', model: 'gemini-2.0-flash', subscription: 'gemini-pro' },
  docs: { role: 'docs', model: 'claude-haiku-3.5', subscription: 'claude-max' },
};
```

**Key improvements:**
- Show actual subscription name (not hardcoded "FREE")
- Pre-execution model selection per agent role
- Cost estimation before running
- Save preferred config as default
- Fallback routing when rate-limited
- Use multiple subscriptions in parallel for speed

### 7.5 Revenue Dashboard

Strategic view for 100M ARR path:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💰 Revenue Paths                                       [100M ARR Goal] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    60-90 Day Revenue Paths                         │ │
│  │  ═══════════════════════════════════════════════════════════════  │ │
│  │                                                                    │ │
│  │  Veria Protocol API ─────────────────────── $2.4M ARR potential   │ │
│  │  ├── Current: 0 customers                                         │ │
│  │  ├── Path: 200 fintech integrations × $1K/mo                     │ │
│  │  └── Confidence: 72%                                              │ │
│  │                                                                    │ │
│  │  Meridian FedRAMP ───────────────────────── $5.2M ARR potential   │ │
│  │  ├── Current: 2 pilots                                            │ │
│  │  ├── Path: 15 agencies × $29K/mo                                 │ │
│  │  └── Confidence: 65%                                              │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  [Run Scenario] [Update Assumptions] [Export]                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.6 Component Architecture

```
/frontend/src/
├── /shell/                    # App chrome
│   ├── AppShell.tsx          # Layout, nav, routing
│   ├── Navigation.tsx        # Tab bar
│   └── ProjectSelector.tsx   # Project scoping
│
├── /views/
│   ├── /ideas/               # Simple entry point
│   │   ├── IdeasView.tsx     # Main container
│   │   ├── IdeaInput.tsx     # Text/voice input
│   │   ├── PathButtons.tsx   # Validate/Plan/Execute
│   │   └── RecentIdeas.tsx   # History list
│   │
│   ├── /vislzr/              # Mind map canvas
│   │   ├── Canvas.tsx        # Main canvas (react-flow)
│   │   ├── nodes/            # Node type components
│   │   │   ├── IdeaNode.tsx
│   │   │   ├── TaskNode.tsx
│   │   │   ├── CrystalNode.tsx
│   │   │   └── ...
│   │   ├── ActionRing.tsx    # Contextual action menu
│   │   ├── VoiceInput.tsx    # Voice capture
│   │   └── store.ts          # Canvas state (zustand)
│   │
│   ├── /execution/           # Task management
│   │   ├── ExecutionView.tsx # Main container
│   │   ├── Kanban/
│   │   │   ├── Board.tsx
│   │   │   ├── Column.tsx
│   │   │   └── Card.tsx
│   │   ├── AgentStream/
│   │   │   ├── StreamView.tsx
│   │   │   └── MessageBubble.tsx
│   │   ├── TaskDetail.tsx    # Expanded card view
│   │   └── store.ts
│   │
│   └── /revenue/             # Revenue dashboard
│       ├── RevenueDashboard.tsx
│       ├── PathCard.tsx
│       └── ScenarioModal.tsx
│
├── /components/              # Shared components
│   ├── ui/                   # Primitives (<100 lines each)
│   └── /shared/              # Composite components
│
└── /hooks/                   # Shared hooks
    ├── useVoice.ts           # Voice input
    ├── useAgent.ts           # Agent streaming
    └── useProject.ts         # Project context
```

#### 7.6.1 Interactive Card Primitive

The core composable component used across all views. Build once, use everywhere.

```typescript
// components/ui/InteractiveCard.tsx
interface InteractiveCardProps {
  // Identity
  id: string;
  title: string;
  subtitle?: string;
  
  // State
  status: 'pending' | 'running' | 'blocked' | 'complete' | 'failed';
  progress?: number;  // 0-100
  duration?: number;  // seconds elapsed
  
  // Live output stream (for running tasks)
  outputStream?: AsyncIterable<string>;
  
  // Escalation (when action needed)
  escalation?: {
    reason: string;
    actions: Array<{ label: string; variant: 'primary' | 'secondary' | 'danger'; onClick: () => void }>;
  };
  
  // Detail levels
  detailLevel: 'dot' | 'collapsed' | 'summary' | 'expanded' | 'fullscreen';
  onDetailLevelChange?: (level: DetailLevel) => void;
  
  // Children for custom content
  children?: React.ReactNode;
}
```

**Usage across views:**

| View | Usage | Detail Levels |
|------|-------|---------------|
| Pipeline Execution | Batches and tasks | dot → collapsed → expanded |
| VISLZR Canvas | Nodes (ideas, hypotheses) | dot → summary → expanded |
| Flow Board | Cards in columns | collapsed → expanded |
| Agent Activity | Running agents | summary → expanded → fullscreen |

**Compact batch view:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐  ┌──────────┐ ┌──────────┐        │
│  │ Batch 1 [RUNNING]              0/2  │  │ Batch 2  │ │ Batch 3  │        │
│  │ ┌─────────────────────────────────┐ │  │ ●●● 0/3  │ │ ●● 0/2   │        │
│  │ │ Task 18: Project Focus  ⏳ 2m34s │ │  │ waiting  │ │ waiting  │        │
│  │ │ > Creating focusStore.ts...     │ │  └──────────┘ └──────────┘        │
│  │ │ > ⚠️ BLOCKED: Missing types      │ │                                   │
│  │ │ > [Retry] [Skip] [Help]         │ │                                   │
│  │ └─────────────────────────────────┘ │                                   │
│  └─────────────────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key behaviors:**
- Dot level: Just a colored dot (●) showing status
- Collapsed: Title + status badge + progress
- Summary: Above + key metrics + mini output preview  
- Expanded: Full output stream + actions + details
- Fullscreen: Takes over viewport (for deep debugging)

**Live output mini-CLI:**
- Last 3 lines visible in summary mode
- Full scrollable output in expanded mode
- Action buttons inline when escalation needed
- Click anywhere to expand/collapse

#### 7.6.2 Embedded Mini-CLI Pattern

When a task/agent needs interaction, embed a mini terminal directly in the card:

```typescript
// components/ui/MiniCLI.tsx
interface MiniCLIProps {
  // Stream of output lines
  outputStream: AsyncIterable<OutputLine>;
  
  // Current state
  state: 'streaming' | 'waiting_input' | 'complete' | 'error';
  
  // When input is needed
  inputPrompt?: {
    message: string;  // "Agent needs clarification:"
    placeholder?: string;  // "Enter additional context..."
    suggestions?: string[];  // Quick action buttons
  };
  
  // Callbacks
  onInput?: (input: string) => void;
  onAction?: (action: string) => void;  // For suggestion buttons
  onCancel?: () => void;
  onRetry?: () => void;
}

interface OutputLine {
  type: 'stdout' | 'stderr' | 'system' | 'prompt';
  content: string;
  timestamp: Date;
}
```

**Visual states:**

```
┌───────────────────────────────────────────────────┐
│ Task 18: Project Focus Model       ⏳ 2m34s │
├───────────────────────────────────────────────────┤
│ $ Creating focusStore.ts...                 │
│ $ Writing ProjectFocusBar component...      │
│ $ ⚠️  Import error: Cannot find 'Project'    │
│                                             │
│ ┌───────────────────────────────────────────┐ │
│ │ Agent needs help:                       │ │
│ │ "Where is the Project type defined?"    │ │
│ │                                         │ │
│ │ [stores/projectsStore] [types/project]  │ │
│ │ [Skip this file] [Let me type...]       │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

**Escalation flow:**
1. Agent hits a blocker → emits `prompt` type output
2. Card state changes to `waiting_input`
3. Suggestion buttons appear (agent-provided guesses)
4. User clicks button OR types custom input
5. Input sent back to agent → execution continues
6. Card state returns to `streaming`

**Same primitive in VISLZR:**
- Node shows mini-CLI when agent is working on it
- Escalation appears inline without leaving canvas
- User can respond without context switch

**WebSocket protocol:**
```typescript
// Agent → Frontend
{ type: 'output', line: '$ Creating file...', stream: 'stdout' }
{ type: 'output', line: 'Error: Cannot find X', stream: 'stderr' }
{ type: 'escalation', message: 'Where is X?', suggestions: ['path/a', 'path/b'] }

// Frontend → Agent  
{ type: 'input', value: 'path/a' }  // User clicked suggestion
{ type: 'input', value: 'custom input here' }  // User typed
{ type: 'cancel' }  // User cancelled
```

#### 7.6.3 Task Progress Ring Node (VISLZR)

A composable VISLZR node that visualizes task execution progress with subtask tracking and parallelism preview.

**Data Model:**

```typescript
type TaskProgressNodeData = {
  title: string;
  subtitle?: string;
  status: 'pending' | 'running' | 'blocked' | 'complete' | 'failed';

  // Overall progress (0..100)
  progress: number;

  // Sequential subtasks (can be grouped for parallel preview)
  steps: Array<{
    id: string;
    label: string;
    status: 'pending' | 'running' | 'complete' | 'failed' | 'blocked';
    progress?: number;  // optional per-step (0..1)
    weight?: number;    // relative weight for progress calculation
    group?: string;     // if set, steps with same group can run in parallel
  }>;

  // Optional: pointer to execution backend session
  execution?: {
    executionId: string;
    batchId?: string;
    taskId?: string;
    websocketUrl?: string;
  };
}
```

**Visual Design:**

```
┌─────────────────────────────────────────┐
│  Task Progress          running         │
├─────────────────────────────────────────┤
│                                         │
│         ┌──────[Open]──────┐            │
│        /                    \           │
│   [Logs]    ╭────────────╮   [Pause]    │
│             │   ████░░   │              │
│             │    45%     │              │
│             │  Subtask 2 │              │
│   [Fork]    ╰────────────╯              │
│        \                    /           │
│         └─────────────────┘             │
│                                         │
│  Parallel plan:                         │
│  [Stage 1] [Group 2: 2x] [Stage 3]      │
└─────────────────────────────────────────┘
```

**Component Breakdown:**

| Component | Responsibility |
|-----------|----------------|
| `ProgressRing` | Pure SVG ring with progress arc, subtask wedges, direction arrow |
| `TaskProgressNode` | VISLZR node wrapper, binds to zustand store, renders action options |
| `taskProgressStore` | Zustand store for task progress state across nodes |

**ProgressRing Features:**
- **Progress arc**: Fills clockwise (0-100%) with smooth animation
- **Subtask wedges**: Pie slices showing each step's status (color-coded)
- **Direction arrow**: Small marker at current progress angle
- **Outer options**: Quick action buttons arranged around the ring

**Action Ring Mapping (status-dependent):**

| Status | Actions |
|--------|---------|
| `pending` | ▶ Run, 📝 Edit plan, 🤖 Ask AI, 📄 Docs |
| `running` | ⏸ Pause, 📜 Logs, 🛑 Abort, 🤖 Ask AI |
| `blocked` | ✅ Resolve…, 🤖 Ask AI, 📄 Docs |
| `complete` | 📄 Summary, 🔁 Re-run, ⤴ Export |

**Parallelism Preview:**
The node renders a "pipeline strip" showing which subtasks can run in parallel:
- Groups adjacent steps with matching `group` field
- Displays parallel iconography (e.g., "Group 2: 2x")
- Heuristic-only in Phase 4; backend owns real decisions later

**File Locations:**

```
/frontend/src/components/Canvas/
├── components/
│   └── ProgressRing.tsx     # Pure SVG progress ring component
├── nodes/
│   └── TaskProgressNode.tsx # VISLZR node type wrapper
├── mock/
│   └── mockTaskProgress.ts  # Demo mock runner (Phase 4)
└── index.tsx                # Registers task_progress node type

/frontend/src/stores/
└── taskProgressStore.ts     # Zustand store for task state
```

**Integration with Execution API:**
- Phase 4: Mock runner advances progress for UI development
- Phase 5+: Replace mock with WebSocket stream from `/api/v1/autonomous/ws/{execution_id}`
- Store subscribes to execution events and updates node state in real-time

#### 7.6.4 NodeShell Component & Design Token Cohesion

**Implementation Date:** 2026-01-13

All VISLZR Canvas nodes (Idea, Hypothesis, Insight, Task, TaskProgress) now share a unified `NodeShell` component, eliminating code duplication and ensuring visual consistency across node types.

**Architecture:**

```typescript
// NodeShell: Universal wrapper for all Canvas node types
type NodeShellProps = {
  icon?: ReactNode              // Node type icon (Lightbulb, Sparkles, etc.)
  title: string                 // Node type label (uppercase)
  badge?: ReactNode             // Status or metadata badge
  corner?: ReactNode            // Corner decorations (insight count, etc.)
  accentTextClass?: string      // Type-specific text color
  accentBorderClass?: string    // Type-specific border color
  className?: string            // Additional styling
  selected?: boolean            // Selection state
  children: ReactNode           // Node content
}
```

**Design Token Migration:**

All nodes now use **cc-* design tokens** instead of raw Tailwind utility classes, ensuring theme consistency and eliminating dynamic class string construction.

| Token | Usage | Example |
|-------|-------|---------|
| `text-cc-accent` | Primary accent text | Node type titles, icons |
| `text-cc-text` | Body text | Node content, descriptions |
| `text-cc-muted` | Secondary/meta text | Timestamps, metadata |
| `bg-cc-surface` | Card backgrounds | Node shells, modals |
| `bg-cc-bg` | App background | Canvas, panel backgrounds |
| `border-cc-border` | Default borders | Node outlines |
| `border-cc-accent` | Accent borders | Active states |
| `ring-cc-accent/35` | Selection rings | Selected node indicator |

**Node Type Examples:**

```typescript
// IdeaNode: Uses NodeShell with status-specific theming
<NodeShell
  title="Idea"
  icon={<Lightbulb className="w-4 h-4" />}
  accentTextClass="text-yellow-300"      // Status-dependent
  accentBorderClass="border-yellow-500/35"
  badge={<StatusBadge status={status} />}
  corner={insightCount > 0 ? <InsightCounter /> : null}
  selected={selected}
>
  <p className="text-cc-text text-sm">{data.label}</p>
</NodeShell>

// HypothesisNode: Same shell, different accent
<NodeShell
  title="Hypothesis"
  icon={<Beaker className="w-4 h-4" />}
  accentTextClass="text-purple-300"
  accentBorderClass="border-purple-500/35"
  badge={<ConfidenceBadge confidence={data.confidence} />}
  selected={selected}
>
  <p className="text-cc-text text-sm">{data.label}</p>
</NodeShell>
```

**InlineHint Updates:**

The `InlineHint` component (contextual hints on Canvas nodes) now uses CC design tokens throughout:

- **Before:** `text-gray-500`, `bg-blue-400`, `border-gray-300`
- **After:** `text-cc-muted`, `bg-cc-accent`, `border-cc-border`

This eliminates raw color values and ensures hints adapt to theme changes.

**Benefits:**

1. **Visual Consistency**: All nodes share identical layout, spacing, and interaction patterns
2. **Reduced Code Duplication**: ~60% less code across node components
3. **Maintainability**: Single source of truth for node styling
4. **Theme-Ready**: CC tokens enable future dark/light mode switching
5. **Performance**: No dynamic class string construction at runtime
6. **Accessibility**: Consistent selection indicators and focus states

**File Structure:**

```
/frontend/src/components/Canvas/
├── nodes/
│   ├── NodeShell.tsx          # ✨ NEW: Universal node wrapper
│   ├── IdeaNode.tsx           # Uses NodeShell
│   ├── HypothesisNode.tsx     # Uses NodeShell
│   ├── InsightNode.tsx        # Uses NodeShell
│   ├── TaskNode.tsx           # Uses NodeShell
│   └── TaskProgressNode.tsx   # Uses NodeShell
├── InlineHint.tsx             # Updated with cc-* tokens
└── index.tsx                  # Node type registration
```

**Migration Notes:**

- All node types maintain their unique accent colors (yellow for ideas, purple for hypotheses, etc.)
- Status-dependent theming still works via `accentTextClass` and `accentBorderClass` props
- Selection state (`ring-2 ring-cc-accent/35`) is consistent across all node types
- Corner decorations (insight counts, status indicators) are composable via `corner` prop

### 7.7 Composability Rules

| Rule | Enforcement |
|------|-------------|
| No component > 200 lines | ESLint rule |
| No view > 500 lines | ESLint rule |
| Container/Presentational split | Directory structure |
| Props-driven (minimal store access) | Code review |
| All interactions have loading states | Component checklist |

### 7.8 Key User Flows

#### Flow 1: Quick Idea → Done
```
Ideas Tab → Type idea → [Just Do It] → Watch in Execution → Done
```

#### Flow 2: Explore → Validate → Build
```
VISLZR → Create idea node → Action ring: Validate → See confidence →
Action ring: Create Plan → Execution → Run agents → Done
```

#### Flow 3: Document → Tasks
```
VISLZR → Drag in planning doc → Auto-extract tasks → Review in Execution → Execute
```

#### Flow 4: Wander Discovery
```
Background: Wander detects resonance → VISLZR shows pulsing nodes →
User investigates → Crystallizes → Crystal becomes task → Execute
```

### 7.9 The Living Canvas (CC3 UI Vision)

**Core Insight**: VISLZR is THE human interface, not a consumer of documentation. The vision: **VISLZR IS the entire app.** Everything else is a lens, a zoom level, or a contextual overlay on the same infinite canvas.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE LIVING CANVAS                                  │
│                                                                              │
│  "It's not a tool you use. It's a space you inhabit."                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  One Surface, Many Altitudes                                         │   │
│  │                                                                       │   │
│  │  STRATEGIC (zoomed out) → TACTICAL (medium) → EXECUTION (zoomed in) │   │
│  │                                                                       │   │
│  │  Revenue constellation    Ideas crystallizing   Agent work streaming │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  The canvas never changes. Context comes to you.                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Design Principles (from UI_Concepts.md)

| Pattern | Implementation | Benefit |
|---------|----------------|---------|
| **Infinite Canvas** | VISLZR as spatial workspace | Reduces mental "folder" overhead |
| **Command Bar First** | `Cmd+K` CommandPalette | Muscle memory & speed |
| **Hover Portals** | Peek windows on node hover | Prevents context switching |
| **Contextual GenUI** | Wander/Focus/Review modes | Minimizes visual noise |
| **Live Synthesis** | Voice extracts structure in real-time | Intent crystallizes as you speak |

### 7.10 Altitude-Based Zoom

The canvas has three semantic zoom levels. Zooming isn't just visual—it changes what you see:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALTITUDE: STRATEGIC                                │
│                              (Zoomed Out)                                    │
│                                                                              │
│     ┌─────────┐         ┌─────────┐         ┌─────────┐                     │
│     │  VERIA  │─────────│ PROACTIVA│─────────│ ROLLIZER │                    │
│     │  $2.4M  │         │  $800K  │         │  $1.2M  │                     │
│     └─────────┘         └─────────┘         └─────────┘                     │
│                               │                                              │
│                        ┌──────┴──────┐                                       │
│                        │   100M ARR  │  ← Revenue constellation              │
│                        └─────────────┘                                       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ALTITUDE: TACTICAL                                 │
│                            (Medium Zoom)                                     │
│                                                                              │
│         ◐ resonance          ◉ idea            ◈ hypothesis                 │
│        (soft, glowing)    (crystallizing)    (being validated)              │
│              │                  │                   │                        │
│              └──────────────────┴───────────────────┘                        │
│                                 │                                            │
│                          ◆ validated idea                                    │
│                         (sharp, confident)                                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ALTITUDE: EXECUTION                                │
│                             (Zoomed In)                                      │
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  TASK: Implement audit service                                   │      │
│    │  🤖 Agent: backend-coder                    [■■■■■■░░░░] 60%    │      │
│    │  📁 core/audit/service.py  ████████░░ (writing)                 │      │
│    │  💬 "Creating hash-chained audit entries..."                    │      │
│    └─────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Altitude | Shows | Hides | Trigger |
|----------|-------|-------|---------|
| **Strategic** | Projects, revenue paths, high-level dependencies | Individual tasks, code files | Zoom gesture out, `Cmd+1` |
| **Tactical** | Ideas, hypotheses, validation status, crystals | Agent streams, file diffs | Default, `Cmd+2` |
| **Execution** | Tasks, agent work, file changes, live streams | Strategic metrics, unrelated projects | Zoom into task, `Cmd+3` |

### 7.11 Command Palette

Universal entry point. Appears with `Cmd+K` from anywhere on the canvas.

```
┌─────────────────────────────────────────────────────────────────┐
│  🎤  "Show me what's blocking the Veria launch"                 │
│      ───────────────────────────────────────────────────────    │
│      [Validate] [Plan] [Just Do It]                             │
└─────────────────────────────────────────────────────────────────┘
```

#### Natural Language Navigation

Not just search—**commands**:

| Example Command | Action |
|-----------------|--------|
| "Zoom into authentication work" | Filter canvas to auth-related nodes |
| "What did agents discover overnight?" | Show Tech Radar findings since yesterday |
| "Show me ideas above 80% confidence" | Filter by validation status |
| "Play back yesterday's coding session" | Activate timeline, scrub to session |
| "What's connected to this?" | Highlight edges from selected node |

#### Component: `CommandPalette.tsx`

```typescript
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: ParsedCommand) => void;
}

type ParsedCommand = 
  | { type: 'navigate'; target: string }
  | { type: 'filter'; criteria: FilterCriteria }
  | { type: 'execute'; action: 'validate' | 'plan' | 'just_do_it'; input: string }
  | { type: 'temporal'; action: 'playback' | 'scrub'; target: Date }
```

### 7.12 Edge Panels

Context slides in from edges. The canvas never changes—**context comes to you**.

| Edge | Panel | Trigger | Content |
|------|-------|---------|---------|
| **Left** | Project Navigator | Hover left edge, `Cmd+[` | Project tree, filters |
| **Right** | Living Context (Memory) | Click LivingOrb, `Cmd+]` | Relevant memory, recent context |
| **Bottom** | Timeline / History | `Cmd+T` | Temporal scrubber, session history |
| **Top** | Command Bar | `Cmd+K` | Voice + text input overlay |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           [Command Bar - Top]                                │
├──────────┬──────────────────────────────────────────────────────┬───────────┤
│          │                                                       │           │
│ Project  │                                                       │  Living   │
│ Nav      │                    THE CANVAS                         │  Context  │
│ (Left)   │                                                       │  (Right)  │
│          │                                                       │           │
├──────────┴──────────────────────────────────────────────────────┴───────────┤
│                           [Timeline - Bottom]                                │
│  ◀ ───────────────●─────────────────────────────────────────────────────▶   │
│    Jan 1         Jan 4                                               Now    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.13 Hover Portals

When hovering over a connected node, show a **peek window** without navigating away.

```
┌─────────────────────────────────────────────────────────────────┐
│  ◉ Veria Authentication                                         │
│                ↓ hover on connected node                        │
│         ┌─────────────────────────────┐                         │
│         │ 👁️ OAuth2 Implementation    │ ← Hover Portal          │
│         │ Status: 70% validated       │                         │
│         │ Agent: backend-coder        │                         │
│         │ Last: "Added token refresh" │                         │
│         │                             │                         │
│         │ [Open Full] [Run Agent]     │ ← Actions in portal     │
│         └─────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits**: Prevents context-switching while exploring the graph. Users can even trigger actions from the portal.

#### Component: `HoverPortal.tsx`

```typescript
interface HoverPortalProps {
  targetNode: Node;
  position: { x: number; y: number };
  onAction: (action: 'open' | 'run_agent' | 'validate') => void;
  onDismiss: () => void;
}
```

### 7.14 Live Synthesis Voice Input

Voice input extracts structure **in real-time as you speak**, not after.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎤  "We need to fix the audit service before launch,                        │
│       and then Sarah should review the ICO docs..."                         │
│      ─────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📋 Detected (live):                                                         │
│     • TASK: Fix audit service          BLOCKING: launch                     │
│     • TASK: Review ICO docs            ASSIGNEE: Sarah                      │
│                                                                              │
│      [Accept Tasks] [Edit First] [Just Thinking...]                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

The voice bar becomes an **intent crystallizer**—structure forms as you speak.

#### Detected Entities

| Entity Type | Visual | Example |
|-------------|--------|---------|
| TASK | ☐ with action verb | "Fix audit service" |
| BLOCKER | 🚧 with dependency arrow | "before launch" |
| ASSIGNEE | 👤 with name | "Sarah" |
| TIMELINE | 📅 with date | "by Friday" |
| QUESTION | ❓ needs clarification | "Should we also..." |

### 7.15 Modes of Engagement

The canvas adapts to **how** you're working, not just **what** you're doing.

| Mode | Visual Style | Behavior | Trigger |
|------|--------------|----------|---------|
| **Wander** | Soft colors, organic shapes, gentle pulse | Easy to create, connect, explore. No pressure for structure. | Slow mouse movement, voice: "let me think..." |
| **Focus** | Crisp lines, clear hierarchy, distractions fade | Task-oriented, progress visible | "Just Do It", selecting a task cluster |
| **Review** | Timeline prominent, playback controls visible | Memory highlights surface, retrospective | Voice: "show me what happened", timeline scrub |

#### Mode Transitions

```
                    ┌─────────┐
         "explore"  │         │  "execute"
        ──────────► │  WANDER │ ◄──────────
                    │         │
                    └────┬────┘
                         │
              "focus on X" │ "what happened?"
                         │
                    ┌────▼────┐
         "review"   │         │  "back to work"
        ◄────────── │  FOCUS  │ ──────────►
                    │         │
                    └────┬────┘
                         │
                  "show history"
                         │
                    ┌────▼────┐
                    │         │
                    │  REVIEW │
                    │         │
                    └─────────┘
```

### 7.16 Timeline & Temporal Navigation

A subtle timeline at the bottom enables **time travel** through project history.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              THE CANVAS                                      │
│                                                                              │
│                              [content]                                       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ◀ ───────────────●─────────────────────────────────────────────────────▶   │
│    Jan 1         Jan 4                                               Now    │
│                    ▲                                                         │
│              "ICO hypothesis validated"                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Capabilities

| Action | Result |
|--------|--------|
| Scrub backward | See how ideas evolved, nodes fade in/out |
| Click timestamp | Jump to that point, see canvas state |
| Playback agent session | Watch agent work like video |
| "Show me state last Tuesday" | Natural language time navigation |

#### Component: `TimelineScrubber.tsx`

```typescript
interface TimelineScrubberProps {
  currentTime: Date;
  range: { start: Date; end: Date };
  events: TimelineEvent[];  // Significant moments
  onScrub: (time: Date) => void;
  onPlayback: (sessionId: string) => void;
}
```

### 7.17 Agent Visualization (Code Theater)

When agents are working, the canvas transforms into a **theater of work**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│    ┌──────────┐        ┌──────────┐        ┌──────────┐                     │
│    │  TASK 1  │        │  TASK 2  │        │  TASK 3  │                     │
│    │  ●━━━━○  │        │  ●━━○    │        │  ○       │                     │
│    └────┬─────┘        └────┬─────┘        └──────────┘                     │
│         │                   │                                                │
│         ▼                   ▼                                                │
│    ┌─────────────────────────────────────────┐                              │
│    │            CODE THEATER                  │                              │
│    │  ─────────────────────────────────────  │                              │
│    │                                          │                              │
│    │  🔧 backend-coder    🎨 frontend-dev    │  ← Agent avatars             │
│    │      │                     │            │                              │
│    │      ▼                     ▼            │                              │
│    │  ┌────────────┐     ┌────────────┐      │                              │
│    │  │service.py  │     │Component.tsx│     │  ← Files being touched       │
│    │  │████████░░  │     │████░░░░░░  │      │    animate in real-time      │
│    │  └────────────┘     └────────────┘      │                              │
│    │                                          │                              │
│    │  Recent: "Added hash chaining logic"     │  ← Agent thoughts stream    │
│    │                                          │                              │
│    └─────────────────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Agent Avatars

Each agent persona has a visual representation that **moves around the canvas** showing what they're working on:

| Persona | Avatar | Color | Focus |
|---------|--------|-------|-------|
| backend-coder | 🔧 | Blue | Services, APIs, databases |
| frontend-dev | 🎨 | Purple | Components, views, styling |
| architect | 🏛️ | Gold | System design, integration |
| reviewer | 👁️ | Green | Code review, testing |
| documenter | 📝 | Teal | Docs, comments, specs |

### 7.18 Cognitive Support Features

**Designing for neurodiversity** (from UI_Concepts.md). The canvas should support users with ADHD, dyslexia, or anyone needing reduced cognitive load.

| Feature | Description | Toggle |
|---------|-------------|--------|
| **Bionic Reading** | Bold first few letters of words in spec documents | Settings → Accessibility |
| **Line Highlighting** | Highlight current line when reading agent output | Auto in Review mode |
| **Calm Canvas** | Reduce animation, soften colors, slower transitions | `Cmd+Shift+C` |
| **Focus Spotlight** | Dim everything except selected node cluster | Wander mode auto-activates |
| **Reduced Motion** | Disable pulse, breathing, animated edges | Settings → Accessibility |

#### Calm Canvas Mode

```
Normal:           Calm:
◉ pulsing         ○ static
~~~~ animated     ──── static
breathing bg      solid bg
```

### 7.19 Living Canvas Implementation Path

Migration from current three-surface model to Living Canvas:

| Phase | Milestone | Deliverable |
|-------|-----------|-------------|
| **Phase 1** | Unify the Canvas | VISLZR as home route, add zoom levels (strategic/tactical/execution), keep other views as deep-links |
| **Phase 2** | Add Node Types | Resonance, crystal, agent avatar nodes. Animated edges. Breathing background. |
| **Phase 3** | Voice & Command | CommandPalette (`Cmd+K`), Live Synthesis voice input, natural language navigation |
| **Phase 4** | Temporal | TimelineScrubber, playback mode, session recording |
| **Phase 5** | Polish | Wander/Focus/Review modes, Edge panels, Hover portals, Cognitive support |

#### New Components Required

| Component | Purpose | Priority |
|-----------|---------|----------|
| `ResonanceNode.tsx` | Soft, diffuse starting point | P1 |
| `CrystalNode.tsx` | Validated insight (sharp edges) | P1 |
| `AgentAvatar.tsx` | Moving agent representation | P2 |
| `CodeTheater.tsx` | Execution visualization | P2 |
| `TimelineScrubber.tsx` | Temporal navigation | P3 |
| `CommandPalette.tsx` | Voice + text command overlay | P1 |
| `EdgePanel.tsx` | Contextual slide-in panels | P3 |
| `HoverPortal.tsx` | Peek window on hover | P2 |
| `LiveSynthesis.tsx` | Real-time voice structure extraction | P2 |

#### State Management Evolution

```typescript
// Current: Multiple stores
const ideasStore = useIdeasStore();
const executionStore = useExecutionStore();
const vislzrStore = useVislzrStore();

// Future: Single canvas state, views derived
interface CanvasState {
  nodes: Node[];                    // All nodes at all altitudes
  altitude: 'strategic' | 'tactical' | 'execution';
  temporalPosition: Date;           // Current point in time
  mode: 'wander' | 'focus' | 'review';
  activeAgents: AgentSession[];
  focusedNode?: NodeId;
  edgePanels: {
    left: boolean;
    right: boolean;
    bottom: boolean;
  };
}

// Views become selectors
const strategicView = useCanvasAtAltitude('strategic');
const tasksInProgress = useActiveAgentTasks();
const revenueConstellation = useRevenueNodes();
```

### 7.20 Insight Surfaces

Insights from the User Learning System surface in multiple places:

#### 7.20.1 Inline Hints

Subtle indicators in the UI margin when an insight is available:

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Finalize pricing strategy                                  │ │
│  │  Veria • Due: Tomorrow                                     │●│
│  └──────────────────────────────────────────────────────────┘ │
│                                                     hint dot ↑ │
└─────────────────────────────────────────────────────────────────┘
```

Hovering the dot reveals: "You've been circling this for 3 days"

#### 7.20.2 Quick Capture Integration

Insights appear in the Quick Capture panel when relevant:

```
┌─────────────────────────────────────────────────────────────────┐
│  QUICK CAPTURE                                       [✕]      │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  [Type anything...]                                           │
│                                                               │
│  ───────────────────────────────────────────────────────────  │
│                                                               │
│  🏋️ Coach                                                     │
│  "You've mentioned competitive pressure 3 times this week.   │
│   Want to create a hypothesis to investigate?"                │
│                                                               │
│  [Create hypothesis]  [Not now]  [Stop noticing this]        │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.20.3 Conversational Integration

Insights weave into chat naturally:

```
You: Help me think through the Veria roadmap

🦉 Mentor: Before we dive in—I've noticed you've mentioned
competitive pressure several times recently. That pattern
might be worth exploring. What's driving that concern?

─────────────────────────────────────────────────────────────
[Switch voice: 🎖️ 🏋️ 🦉 ☕ 📊 🔥]  Current: 🦉 Mentor
```

### 7.21 Inner Council Configuration UI

A dedicated settings panel for configuring guidance personality:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SETTINGS > Inner Council                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Your guidance personality. How should I talk to you?              │
│                                                                     │
│  DEFAULT VIEWPOINT                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 🎖️       │ │ 🏋️       │ │ 🦉       │ │ ☕       │ │ 📊       │   │
│  │ Sergeant │ │  Coach   │ │  Mentor  │ │  Friend  │ │ Analyst  │   │
│  │          │ │    ◉     │ │          │ │          │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                                     │
│  Or fine-tune:                                                      │
│  Assertiveness   ○───────────────●─────○  Direct                   │
│  Challenge       ○─────────●───────────○  Pushing                  │
│  Warmth          ○───────────────●─────○  Warm                     │
│                                                                     │
│  [Preview Voice]  [Save as Custom Viewpoint]                        │
│                                                                     │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                     │
│  CONTEXT RULES                                       [+ Add Rule]  │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  When: Procrastinating (task avoided 2+ days)              [✕] │ │
│  │  Use:  🏋️ Coach                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  When: High stress detected                               [✕] │ │
│  │  Use:  ☕ Friend                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                     │
│  INTERVENTION FREQUENCY                                             │
│  How often should I speak up?                                       │
│                                                                     │
│  ○───────────●───────────○                                          │
│  Quiet    Balanced      Proactive                                   │
│                                                                     │
│  ☐ Never interrupt when I'm in flow                                │
│  ☐ Always ask before surfacing insights                            │
│  ☑ Learn my preferences over time                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 7.21.1 Voice Preview

When adjusting sliders, show real-time preview:

```
┌─────────────────────────────────────────────────────────────────┐
│  PREVIEW                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Scenario: You've been avoiding a task for 3 days               │
│                                                                 │
│  With current settings, I would say:                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  "I see the pricing task hasn't moved in a few days. That's  │ │
│  │  often a sign something's blocking you that isn't obvious    │ │
│  │  yet. Want to take 5 minutes to figure out what it is?"     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Try another scenario ▾]  [Sounds right]  [Adjust more]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.22 Browser Capture Integration

The Chrome extension feeds into CommandCenter's core capture pipeline.

#### 7.22.1 Capture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BROWSER EXTENSION                              │
│                                                                   │
│  Triggers:                                                        │
│  • ⌘+Shift+C (keyboard shortcut)                                 │
│  • Click extension icon                                          │
│  • Right-click → "Send to CommandCenter"                         │
│                                                                   │
│  Auto-captures: URL, title, selected text, timestamp              │
│                                                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CAPTURE PIPELINE                              │
│                                                                   │
│  1. Classify (LLM): TASK | IDEA | HYPOTHESIS | CONCERN | NOTE    │
│  2. Extract entities: people, projects, dates, topics            │
│  3. Route to appropriate system                                  │
│  4. Feed to Observation Layer (User Learning)                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

#### 7.22.2 Classification Examples

| Input | URL Context | Classification |
|-------|-------------|----------------|
| "Need to fix the login bug" | GitHub issues | TASK |
| "What if we used GraphQL instead?" | Technical blog | IDEA |
| "I think our pricing is too low" | Competitor site | HYPOTHESIS |
| "Worried about the Q2 deadline" | Project management | CONCERN |
| "Good article on RAG patterns" | Medium | REFERENCE |

#### 7.22.3 Side Panel UI

```
┌─────────────────────────────────────────────────────────────────┐
│  CommandCenter                                    [⚙️] [✕]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  What's on your mind?                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ I think we should pivot to enterprise pricing...        │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  📎 Include: ☐ Page screenshot  ☑ Selected text                │
│  📁 Project: [Auto-detect ▾]                                   │
│                                                                 │
│  [Capture] (⌘+Enter)                                           │
│                                                                 │
│  ───────────────────────────────────────────────────────────  │
│                                                                 │
│  Recent Captures                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💡 IDEA: GraphQL migration concept                       │   │
│  │ 2 min ago • Veria • From: tech blog                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.23 Open Questions

| Question | Options | Current Thinking |
|----------|---------|------------------|
| Large canvas handling? | Virtualization, clustering, fog-of-war | Virtualization + clustering for >1000 nodes |
| Agent positions? | Persistent locations vs. float to work | Float to work, return to "home" when idle |
| Altitude transitions? | Smooth zoom vs. discrete levels | Discrete with smooth animation between |
| Voice activation? | Always listening vs. push-to-talk | Push-to-talk (`Cmd+Shift+V`), with wake word option |
| Multi-user collaboration? | Real-time cursors vs. async | Phase 2: async first, real-time later |

### 7.24 Routines (Personal Recurring Automation)

Routines are user-defined automated workflows that run on schedules or triggers, with human-in-the-loop pause points for review and approval.

#### 7.24.1 Philosophy

Traditional automation tools (Zapier, Make, n8n) are **trigger → action chains** with no intelligence. Claude in Chrome has scheduled tasks but no persistent memory or domain context. CommandCenter Routines combine:

- **AI-native execution**: Agents handle ambiguity and edge cases
- **Memory integration**: Routines know your context, preferences, history
- **Human-in-the-loop**: Pause points for review before sensitive actions
- **Graph visibility**: Routines appear as nodes in VISLZR, connected to related work

**Core Principle**: Routines should feel like delegating to a capable assistant, not programming a machine.

#### 7.24.2 Reference Use Case: Monthly Invoice

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ROUTINE: Monthly Client Invoice                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRIGGER                                                                    │
│  ○ Schedule: Last day of month, 9:00 AM                                    │
│  ○ Manual: Can also run on-demand                                          │
│                                                                             │
│  CONTEXT (from Memory)                                                      │
│  • Client: Acme Corp                                                        │
│  • Work days: Thursday, Friday                                              │
│  • Hourly rate: $150                                                        │
│  • Contact: billing@acme.com                                                │
│  • Invoice template: ~/Templates/invoice-template.xlsx                      │
│                                                                             │
│  STEPS                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. READ CALENDAR                                           [Auto]   │   │
│  │    Access shared Google Calendar "Acme Work"                        │   │
│  │    Extract all events from current month                            │   │
│  │    Filter for Thurs/Fri work sessions                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2. CALCULATE HOURS                                         [Auto]   │   │
│  │    Sum total hours worked                                           │   │
│  │    Apply hourly rate                                                │   │
│  │    Calculate subtotal, tax (if applicable), total                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 3. GENERATE INVOICE                                        [Auto]   │   │
│  │    Load Excel template                                              │   │
│  │    Fill in: dates, hours, line items, totals                        │   │
│  │    Generate invoice number (sequential)                             │   │
│  │    Export as PDF                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 4. DRAFT EMAIL                                             [Auto]   │   │
│  │    Create email to billing@acme.com                                 │   │
│  │    Subject: "Invoice #[N] - [Month] [Year]"                         │   │
│  │    Body: Standard invoice email template                            │   │
│  │    Attach: Generated PDF                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 5. ⏸️ PAUSE FOR REVIEW                                    [Human]   │   │
│  │    Show: Invoice PDF preview                                        │   │
│  │    Show: Draft email                                                │   │
│  │    Show: Calculated hours breakdown                                 │   │
│  │    Actions: [Approve & Send] [Edit] [Cancel]                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓ (on approval)                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 6. SEND & ARCHIVE                                          [Auto]   │   │
│  │    Send email via Gmail                                             │   │
│  │    Save PDF to ~/Invoices/Acme/2026/                                │   │
│  │    Log to audit trail                                               │   │
│  │    Update Memory: last_invoice_date, invoice_count                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 7. NOTIFY                                                  [Auto]   │   │
│  │    Desktop notification: "Invoice #N sent to Acme Corp"             │   │
│  │    Optional: Slack/Discord notification                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  HISTORY                                                                    │
│  • Dec 31, 2025: ✅ Sent (Invoice #12, $2,400, 16 hours)                   │
│  • Nov 30, 2025: ✅ Sent (Invoice #11, $1,800, 12 hours)                   │
│  • Oct 31, 2025: ✅ Sent (Invoice #10, $2,100, 14 hours)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 7.24.3 Data Model

```python
# backend/app/models/routine.py

class RoutineStatus(enum.Enum):
    DRAFT = "draft"           # Being created/edited
    ACTIVE = "active"         # Scheduled and running
    PAUSED = "paused"         # Temporarily disabled
    ARCHIVED = "archived"     # No longer active

class StepType(enum.Enum):
    AUTO = "auto"             # Executes automatically
    HUMAN = "human"           # Requires human action
    CONDITIONAL = "conditional"  # Branch based on condition

class TriggerType(enum.Enum):
    SCHEDULE = "schedule"     # Cron-based schedule
    MANUAL = "manual"         # User-triggered only
    EVENT = "event"           # Triggered by external event
    WEBHOOK = "webhook"       # HTTP webhook trigger

class Routine(Base):
    """
    A user-defined automated workflow.

    FedRAMP Control: AU-3 (Content of Audit Records)
    """
    __tablename__ = "routines"

    id = Column(String, primary_key=True)  # UUID
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(RoutineStatus), default=RoutineStatus.DRAFT)

    # Trigger configuration
    trigger_type = Column(Enum(TriggerType), default=TriggerType.MANUAL)
    trigger_config = Column(JSON, default={})  # cron, webhook URL, etc.

    # Steps (ordered list)
    steps = Column(JSON, default=[])  # List of RoutineStep

    # Context from Memory
    memory_context = Column(JSON, default={})  # Keys to pull from Memory

    # Execution settings
    timeout_minutes = Column(Integer, default=30)
    retry_on_failure = Column(Boolean, default=False)
    max_retries = Column(Integer, default=3)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    next_run_at = Column(DateTime(timezone=True), nullable=True)
    run_count = Column(Integer, default=0)


class RoutineStep(TypedDict):
    """Single step in a routine."""
    id: str                    # Step UUID
    name: str                  # Human-readable name
    type: str                  # auto, human, conditional
    action: str                # Action identifier
    config: dict               # Action-specific configuration
    timeout_seconds: int       # Step timeout
    on_failure: str            # continue, stop, retry
    condition: Optional[str]   # For conditional steps


class RoutineRun(Base):
    """
    Record of a routine execution.

    FedRAMP Control: AU-3 (Content of Audit Records)
    """
    __tablename__ = "routine_runs"

    id = Column(String, primary_key=True)
    routine_id = Column(String, ForeignKey("routines.id"), nullable=False)

    status = Column(String, default="running")  # running, paused, completed, failed
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Current state
    current_step_index = Column(Integer, default=0)
    paused_at_step = Column(Integer, nullable=True)  # For human steps

    # Results
    step_results = Column(JSON, default=[])  # Results from each step
    output = Column(JSON, default={})  # Final output
    error = Column(Text, nullable=True)

    # Audit
    audit_entries = Column(JSON, default=[])  # Hash-chained audit trail
```

#### 7.24.4 Routine Actions Library

Routines compose from a library of actions. Each action is a primitive that can be configured:

| Category | Action | Description |
|----------|--------|-------------|
| **Calendar** | `calendar.read` | Read events from Google/Outlook calendar |
| | `calendar.create` | Create calendar event |
| | `calendar.filter` | Filter events by criteria |
| **Email** | `email.draft` | Create email draft |
| | `email.send` | Send email (requires approval) |
| | `email.read` | Read emails matching criteria |
| **Files** | `file.read` | Read file contents |
| | `file.write` | Write/create file |
| | `file.template` | Fill template with data |
| | `file.convert` | Convert between formats (xlsx→pdf) |
| **Browser** | `browser.navigate` | Open URL in browser |
| | `browser.fill_form` | Fill form fields |
| | `browser.extract` | Extract data from page |
| | `browser.screenshot` | Capture screenshot |
| **Data** | `data.calculate` | Perform calculations |
| | `data.transform` | Transform data structure |
| | `data.validate` | Validate data against schema |
| **Notify** | `notify.desktop` | Desktop notification |
| | `notify.slack` | Slack message |
| | `notify.email` | Email notification |
| **Control** | `control.pause` | Pause for human review |
| | `control.branch` | Conditional branching |
| | `control.loop` | Iterate over collection |
| **Memory** | `memory.read` | Read from CC Memory |
| | `memory.write` | Write to CC Memory |
| **Agent** | `agent.execute` | Run CC agent on task |
| | `agent.validate` | Validate idea/hypothesis |

#### 7.24.5 Backend Service

```python
# backend/app/services/routine_service.py

class RoutineService:
    """
    Service for managing and executing routines.

    Integrates with:
    - SchedulerService (Section 2.6) for cron triggers
    - AuditService (Section 2.2) for audit logging
    - MemoryService (Section 6.2) for context
    - AgentService (Section 4.3) for AI execution
    """

    def __init__(self):
        self.db = SessionLocal()
        self.scheduler = SchedulerService()
        self.audit = AuditService()
        self.memory = MemoryService()
        self.agent = AgentService()

    async def create(
        self,
        user_id: str,
        name: str,
        steps: list[RoutineStep],
        trigger_type: TriggerType = TriggerType.MANUAL,
        trigger_config: dict = None
    ) -> Routine:
        """Create a new routine."""
        routine = Routine(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=name,
            steps=steps,
            trigger_type=trigger_type,
            trigger_config=trigger_config or {},
            status=RoutineStatus.DRAFT
        )

        self.db.add(routine)
        self.db.commit()

        # Audit log
        await self.audit.log(
            action="routine_created",
            user_id=user_id,
            resource_type="routine",
            resource_id=routine.id,
            metadata={"name": name, "step_count": len(steps)}
        )

        return routine

    async def activate(self, routine_id: str) -> Routine:
        """Activate a routine and schedule if needed."""
        routine = self.db.query(Routine).filter(Routine.id == routine_id).first()

        if not routine:
            raise ValueError(f"Routine {routine_id} not found")

        routine.status = RoutineStatus.ACTIVE

        # Register with scheduler if schedule-based
        if routine.trigger_type == TriggerType.SCHEDULE:
            cron = routine.trigger_config.get("cron")
            if cron:
                self.scheduler.register(
                    name=f"routine:{routine_id}",
                    cron=cron,
                    callback=lambda: self.run(routine_id)
                )
                routine.next_run_at = self.scheduler.next_run(cron)

        self.db.commit()
        return routine

    async def run(
        self,
        routine_id: str,
        trigger_source: str = "manual"
    ) -> RoutineRun:
        """Execute a routine."""
        routine = self.db.query(Routine).filter(Routine.id == routine_id).first()

        if not routine:
            raise ValueError(f"Routine {routine_id} not found")

        # Create run record
        run = RoutineRun(
            id=str(uuid.uuid4()),
            routine_id=routine_id,
            status="running"
        )
        self.db.add(run)
        self.db.commit()

        # Audit log
        await self.audit.log(
            action="routine_run_started",
            user_id=routine.user_id,
            resource_type="routine_run",
            resource_id=run.id,
            metadata={"routine_name": routine.name, "trigger": trigger_source}
        )

        # Load memory context
        context = {}
        for key in routine.memory_context.get("keys", []):
            context[key] = await self.memory.get(routine.user_id, key)

        # Execute steps
        try:
            for i, step in enumerate(routine.steps):
                run.current_step_index = i
                self.db.commit()

                result = await self._execute_step(step, context, run)
                run.step_results.append(result)

                # Handle human pause
                if step["type"] == "human":
                    run.status = "paused"
                    run.paused_at_step = i
                    self.db.commit()

                    # Notify user
                    await self._notify_pause(routine, run, step, context)
                    return run  # Will resume when user approves

                # Update context with step output
                if result.get("output"):
                    context.update(result["output"])

            # All steps complete
            run.status = "completed"
            run.completed_at = datetime.utcnow()
            run.output = context

            routine.last_run_at = datetime.utcnow()
            routine.run_count += 1

            # Update next run time
            if routine.trigger_type == TriggerType.SCHEDULE:
                cron = routine.trigger_config.get("cron")
                routine.next_run_at = self.scheduler.next_run(cron)

            self.db.commit()

            # Audit log
            await self.audit.log(
                action="routine_run_completed",
                user_id=routine.user_id,
                resource_type="routine_run",
                resource_id=run.id,
                metadata={"routine_name": routine.name, "steps_executed": len(routine.steps)}
            )

        except Exception as e:
            run.status = "failed"
            run.error = str(e)
            run.completed_at = datetime.utcnow()
            self.db.commit()

            # Audit log
            await self.audit.log(
                action="routine_run_failed",
                user_id=routine.user_id,
                resource_type="routine_run",
                resource_id=run.id,
                metadata={"routine_name": routine.name, "error": str(e)}
            )

            raise

        return run

    async def resume(
        self,
        run_id: str,
        approval: str,  # "approve", "edit", "cancel"
        edits: dict = None
    ) -> RoutineRun:
        """Resume a paused routine run after human review."""
        run = self.db.query(RoutineRun).filter(RoutineRun.id == run_id).first()

        if not run or run.status != "paused":
            raise ValueError(f"Run {run_id} not found or not paused")

        routine = self.db.query(Routine).filter(Routine.id == run.routine_id).first()

        if approval == "cancel":
            run.status = "cancelled"
            run.completed_at = datetime.utcnow()
            self.db.commit()
            return run

        if approval == "edit" and edits:
            # Apply edits to context
            # Re-execute current step with edits
            pass

        # Continue from next step
        run.status = "running"
        run.paused_at_step = None
        self.db.commit()

        # Continue execution (would be async in production)
        # ... continue from run.current_step_index + 1

        return run

    async def _execute_step(
        self,
        step: RoutineStep,
        context: dict,
        run: RoutineRun
    ) -> dict:
        """Execute a single routine step."""
        action = step["action"]
        config = step.get("config", {})

        # Inject context into config
        resolved_config = self._resolve_config(config, context)

        # Route to appropriate action handler
        if action.startswith("calendar."):
            return await self._execute_calendar_action(action, resolved_config)
        elif action.startswith("email."):
            return await self._execute_email_action(action, resolved_config)
        elif action.startswith("file."):
            return await self._execute_file_action(action, resolved_config)
        elif action.startswith("browser."):
            return await self._execute_browser_action(action, resolved_config)
        elif action.startswith("agent."):
            return await self._execute_agent_action(action, resolved_config)
        # ... other action categories

        raise ValueError(f"Unknown action: {action}")

    def _resolve_config(self, config: dict, context: dict) -> dict:
        """Resolve template variables in config using context."""
        import re

        def resolve_value(value):
            if isinstance(value, str):
                # Replace {{variable}} with context value
                pattern = r'\{\{(\w+)\}\}'
                return re.sub(
                    pattern,
                    lambda m: str(context.get(m.group(1), m.group(0))),
                    value
                )
            elif isinstance(value, dict):
                return {k: resolve_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [resolve_value(v) for v in value]
            return value

        return resolve_value(config)
```

#### 7.24.6 API Endpoints

```python
# backend/app/routers/routines.py

router = APIRouter(prefix="/api/v1/routines", tags=["routines"])

@router.post("/", response_model=RoutineResponse)
async def create_routine(request: CreateRoutineRequest):
    """Create a new routine."""

@router.get("/", response_model=List[RoutineResponse])
async def list_routines():
    """List all routines for current user."""

@router.get("/{routine_id}", response_model=RoutineResponse)
async def get_routine(routine_id: str):
    """Get routine details."""

@router.put("/{routine_id}", response_model=RoutineResponse)
async def update_routine(routine_id: str, request: UpdateRoutineRequest):
    """Update routine configuration."""

@router.post("/{routine_id}/activate")
async def activate_routine(routine_id: str):
    """Activate a routine (enables scheduling)."""

@router.post("/{routine_id}/pause")
async def pause_routine(routine_id: str):
    """Pause a routine (disables scheduling)."""

@router.post("/{routine_id}/run", response_model=RoutineRunResponse)
async def run_routine(routine_id: str):
    """Manually trigger a routine."""

@router.get("/{routine_id}/runs", response_model=List[RoutineRunResponse])
async def list_runs(routine_id: str):
    """List execution history for a routine."""

@router.get("/runs/{run_id}", response_model=RoutineRunResponse)
async def get_run(run_id: str):
    """Get details of a specific run."""

@router.post("/runs/{run_id}/resume")
async def resume_run(run_id: str, request: ResumeRunRequest):
    """Resume a paused run after human review."""

# WebSocket for real-time progress
@router.websocket("/ws/{run_id}")
async def routine_progress(websocket: WebSocket, run_id: str):
    """Stream routine execution progress."""
```

#### 7.24.7 Chrome Extension Integration

The Chrome extension becomes a primary interface for creating and monitoring Routines:

```
┌─────────────────────────────────────────────────────────────────┐
│  CommandCenter                                    [⚙️] [✕]      │
├────────────────────────────────────────────────────────────────┤
│  [Tasks] [UX Review] [Routines] [Capture]                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  MY ROUTINES                                      [+ New]      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 📅 Monthly Invoice - Acme                    [▶] [⋮]     │ │
│  │ Last: Dec 31 ✅ • Next: Jan 31 @ 9:00 AM                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 📊 Weekly Report                             [▶] [⋮]     │ │
│  │ Last: Jan 6 ✅ • Next: Jan 13 @ 8:00 AM                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🔔 Daily Standup Prep                        [▶] [⋮]     │ │
│  │ Last: Today ✅ • Next: Tomorrow @ 8:30 AM                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ─────────────────────────────────────────────────────────── │
│                                                                │
│  ⏸️ AWAITING REVIEW                                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Monthly Invoice - Acme                                    │ │
│  │ Step 5/7: Review invoice before sending                   │ │
│  │                                                           │ │
│  │ 📄 Invoice #13 - January 2026                            │ │
│  │ Hours: 18 • Total: $2,700                                │ │
│  │                                                           │ │
│  │ [Preview PDF] [View Email Draft]                         │ │
│  │                                                           │ │
│  │ [✓ Approve & Send]  [✏️ Edit]  [✕ Cancel]                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

##### Workflow Recording (Like Claude in Chrome)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 RECORDING NEW ROUTINE                          [Stop]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Recording: "Monthly Invoice Process"                           │
│                                                                 │
│  Steps captured:                                                │
│  1. ✓ Opened calendar.google.com                               │
│  2. ✓ Navigated to "Acme Work" calendar                        │
│  3. ✓ Selected date range (Dec 1 - Dec 31)                     │
│  4. ✓ Exported events as CSV                                   │
│  5. ● Currently: Opened invoice-template.xlsx                  │
│                                                                 │
│  [Add Pause Point Here]                                        │
│                                                                 │
│  CommandCenter is learning your workflow.                       │
│  Continue performing your normal steps...                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### Quick Routine Builder

```
┌─────────────────────────────────────────────────────────────────┐
│  CREATE ROUTINE                                    [✕]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Name: [Monthly Client Invoice________________]                 │
│                                                                 │
│  Describe what you want automated:                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ At the end of each month, review my shared calendar with │  │
│  │ Acme Corp, calculate hours worked on Thurs/Fri, generate │  │
│  │ an invoice using my Excel template, and draft an email   │  │
│  │ to billing@acme.com. Let me review before sending.       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Schedule:                                                      │
│  ○ Manual only                                                 │
│  ● On schedule: [Last day of month ▾] at [9:00 AM ▾]          │
│  ○ When triggered by: [___________]                            │
│                                                                 │
│  [Create Routine]                                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  💡 Tip: After creating, you can refine steps in VISLZR        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.24.8 VISLZR Integration

Routines appear as a new node type in VISLZR with full graph connectivity:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VISLZR CANVAS                                   │
│                                                                             │
│                    ┌─────────────────────┐                                  │
│                    │   💼 Acme Corp      │                                  │
│                    │     (Client)        │                                  │
│                    └──────────┬──────────┘                                  │
│                               │                                             │
│              ┌────────────────┼────────────────┐                            │
│              │                │                │                            │
│              ▼                ▼                ▼                            │
│  ┌───────────────────┐  ┌─────────────────┐  ┌─────────────────────┐       │
│  │ 📅 Monthly Invoice│  │ 📋 Work Log     │  │ 💰 Revenue Target   │       │
│  │    (Routine)      │  │   (Reference)   │  │     (Goal)          │       │
│  │                   │  │                 │  │                     │       │
│  │ ⏰ Next: Jan 31   │  │ 16 hrs this mo  │  │ $30K/mo target      │       │
│  │ ✅ 12 runs        │  │                 │  │ 73% achieved        │       │
│  └───────────────────┘  └─────────────────┘  └─────────────────────┘       │
│           │                                                                 │
│           │ generates                                                       │
│           ▼                                                                 │
│  ┌───────────────────┐                                                      │
│  │ 📄 Invoice #12    │                                                      │
│  │   (Artifact)      │                                                      │
│  │                   │                                                      │
│  │ Dec 2025, $2,400  │                                                      │
│  └───────────────────┘                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

##### Routine Node Action Ring

When clicking a Routine node, the action ring shows:

```
                    [Run Now]
                        │
        [Edit Steps]────●────[View History]
                        │
                  [Pause/Resume]
```

##### Routine Editor Panel

Opening a routine in VISLZR shows a visual step editor:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ROUTINE EDITOR: Monthly Invoice - Acme                           [Save]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRIGGER: 📅 Last day of month @ 9:00 AM           [Change Schedule]       │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐           │
│  │ 📅 Read │ ───▶ │ 🔢 Calc │ ───▶ │ 📄 Gen  │ ───▶ │ ✉️ Draft │           │
│  │ Calendar│      │ Hours   │      │ Invoice │      │ Email   │           │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘           │
│                                                           │                │
│                                                           ▼                │
│                                         ┌─────────┐      ┌─────────┐      │
│                                         │ 📤 Send │ ◀─── │ ⏸️ Review│      │
│                                         │ & Save  │      │ (Human) │      │
│                                         └─────────┘      └─────────┘      │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP DETAILS (click step to edit)                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 3: Generate Invoice                                            │   │
│  │ Action: file.template                                               │   │
│  │ Template: ~/Templates/invoice-template.xlsx                         │   │
│  │ Output: ~/Invoices/Acme/{{year}}/Invoice-{{invoice_number}}.pdf    │   │
│  │ Variables: hours, rate, client_name, dates                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [+ Add Step]  [Test Run]  [View Last Output]                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 7.24.9 Inner Council Integration

The Inner Council personality (Section 5.14) affects how Routines notify and interact:

| Voice | Notification Style |
|-------|-------------------|
| 🎖️ Sergeant | "Invoice ready. Review and approve. Move." |
| 🏋️ Coach | "Great work this month! 18 hours logged. Ready to send that invoice?" |
| 🦉 Mentor | "Your January invoice is prepared. I noticed hours are up 12% from last month. Worth reviewing the breakdown?" |
| ☕ Friend | "Hey! Invoice is ready whenever you have a sec. No rush." |

#### 7.24.10 Security Considerations

**FedRAMP Controls:**
- **AU-3**: All routine executions are audit logged with hash chaining
- **AC-3**: Routines can only access resources user has permission for
- **SC-28**: Sensitive config (API keys, passwords) encrypted at rest

**Permission Model:**
```python
class RoutinePermission(enum.Enum):
    CALENDAR_READ = "calendar:read"
    CALENDAR_WRITE = "calendar:write"
    EMAIL_READ = "email:read"
    EMAIL_SEND = "email:send"      # Requires explicit grant
    FILE_READ = "file:read"
    FILE_WRITE = "file:write"
    BROWSER_NAVIGATE = "browser:navigate"
    BROWSER_FILL = "browser:fill"  # Requires explicit grant
```

Routines must declare required permissions. Users approve permissions when activating a routine.

#### 7.24.11 Comparison: CC Routines vs Claude in Chrome Scheduled Tasks

| Feature | Claude in Chrome | CC Routines |
|---------|-----------------|-------------|
| Schedule tasks | ✅ Daily/weekly/monthly | ✅ Cron + calendar-aware |
| Record workflows | ✅ Learn by demonstration | ✅ Learn by demonstration |
| Human pause points | ❌ Runs autonomously | ✅ Configurable approval gates |
| Memory integration | ❌ No persistent memory | ✅ Full Memory system access |
| Graph visibility | ❌ Standalone | ✅ VISLZR nodes + connections |
| Audit trail | ❌ Basic logging | ✅ Hash-chained FedRAMP audit |
| Domain context | ❌ General purpose | ✅ Knows your clients, rates, templates |
| Inner Council | ❌ N/A | ✅ Personality-aware notifications |
| Multi-step review | ❌ All or nothing | ✅ Pause at any step |

#### 7.24.12 Implementation Priority

**Phase 1 (MVP):**
- [ ] Routine data model and database schema
- [ ] Basic CRUD API endpoints
- [ ] Manual trigger execution
- [ ] Simple step types (file, notify)
- [ ] Chrome extension "Routines" tab (list + manual run)

**Phase 2:**
- [ ] Schedule-based triggers (cron)
- [ ] Calendar and email actions
- [ ] Human pause points with approval UI
- [ ] Workflow recording in Chrome extension
- [ ] VISLZR Routine node type

**Phase 3:**
- [ ] Browser actions (navigate, fill, extract)
- [ ] Agent actions (execute, validate)
- [ ] Visual step editor in VISLZR
- [ ] Inner Council notification integration
- [ ] Advanced scheduling (calendar-aware)

---

*Routines transform CommandCenter from a tool you use into an assistant that works for you—handling recurring tasks while keeping you in control of what matters.*

---

## 8. Documentation Patterns

FedRAMP-compliant documentation baked in.

### 8.1 Module Template

```python
"""
Module: {path}
Purpose: {brief description}

Security Classification: CUI | Internal | Public
FedRAMP Controls: {controls if security-relevant}
"""
```

### 8.2 Class Template

```python
class ServiceName:
    """
    Brief description.

    Attributes:
        attr: Description

    Security:
        - Relevant security considerations
        - FedRAMP control references
    """
```

### 8.3 Function Template

```python
def function_name(param: Type) -> ReturnType:
    """
    Brief description.

    Args:
        param: Description

    Returns:
        Description

    Raises:
        ExceptionType: When raised

    Security:
        - Only if security-relevant
    """
```

### 8.4 Security Section Triggers

Include `Security:` when code handles:
- Authentication/Authorization
- User input
- Sensitive data (PII, credentials)
- Cryptography
- Network operations
- Storage operations

### 8.5 FedRAMP Control Reference

| Control | Description | When to Reference |
|---------|-------------|-------------------|
| SC-28 | Protection at Rest | Encryption at rest |
| SC-13 | Cryptographic Protection | Crypto operations |
| AU-3 | Content of Audit Records | Logging |
| IA-2 | Identification and Authentication | Auth flows |
| AC-3 | Access Enforcement | Authorization |
| SI-10 | Input Validation | Input validation |

---

## 9. Domain Integration

How domain apps (Veria, Meridian) use CC3.

### 9.1 Integration Pattern

```python
# Domain app imports CC3 services
from cc3.core.audit import AuditService
from cc3.core.workflows import WorkflowService
from cc3.commercial.api_keys import ApiKeyService
from cc3.knowledge.memory import MemoryService

# Domain app uses CC3 infrastructure
class VeriaScreeningService:
    def __init__(self):
        self.audit = AuditService()
        self.api_keys = ApiKeyService()

    async def screen(self, address: str, api_key: str):
        # Validate key (CC3)
        validation = await self.api_keys.validate(api_key)

        # Domain logic (Veria)
        result = await self._check_ofac(address)

        # Audit (CC3)
        await self.audit.log(
            validation.key_id, "screen", "address", address,
            {"result": result.status}
        )

        return result
```

### 9.2 Domain Project Structure

```
/Veria/                           # Separate project
├── /protocol/                    # OFAC screening
│   ├── screening_service.py      # Uses cc3.audit, cc3.api_keys
│   ├── ofac_sync.py              # Domain-specific
│   └── models.py                 # SanctionEntry, etc.
├── /tax/                         # WA ESD
├── /ledger/                      # Multi-currency
├── /venezuela/                   # GL compliance
└── pyproject.toml                # Depends on cc3

/Meridian/                        # Separate project
├── /fedramp/
│   ├── baseline_service.py       # Uses cc3.controls
│   ├── ssp_generator.py          # Uses cc3.evidence
│   └── models.py                 # Domain-specific
└── pyproject.toml                # Depends on cc3
```

### 9.3 What Lives Where

| Component | Location | Rationale |
|-----------|----------|-----------|
| Audit logging | CC3 | Reusable, compliance |
| API key validation | CC3 | Reusable |
| OFAC SDN sync | Veria | Domain-specific |
| Screening logic | Veria | Domain-specific |
| CoinGecko integration | Veria | Domain-specific |
| FedRAMP baselines | Meridian | Domain-specific |
| SSP generation | Meridian | Domain-specific |
| OSCAL helpers | CC3 | Reusable |
| Control tracking | CC3 | Reusable |

---

## 10. Implementation Plan

**Note**: CC2 has already validated RLM (Phase 3e), Tiered Visual Memory (Phase 3d), Skills System (Phase 3a), and basic Memory System (Phase 3b). These are marked with ✅ below.

### Phase 0: Bootstrap (Hour 0-1, parallel)

| Task | Deliverable | Notes |
|------|-------------|-------|
| Create CC3 repo structure | Directory structure per 1.3 | - |
| Setup PostgreSQL + pgvector | Database ready | - |
| Setup Redis | Caching ready | - |
| Basic FastAPI app | Health endpoint | - |

### Phase 1: Core Infrastructure (Hours 1-2, parallel)

**NEW**: Compliance primitives not in CC2

| Task | Deliverable |
|------|-------------|
| Audit service | Hash-chained logging |
| Signatures service | FIPS 186-5 signing |
| Workflows service | Approval state machine |
| Evidence service | Hashed storage |
| Controls service | OSCAL generation |
| Scheduler service | Job management |

### Phase 2: Commercial Infrastructure (Hours 1-2, parallel with Phase 1)

**NEW**: Monetization layer not in CC2

| Task | Deliverable |
|------|-------------|
| API key service | Generation, validation |
| Usage service | Metering |
| Rate limiting service | Redis sliding window |
| Billing service | Stripe integration |

### Phase 3: Agent Framework (Hours 2-4)

| Task | Deliverable | Status |
|------|-------------|--------|
| **✅ RLM Executor** | Neuro-symbolic execution engine | Port from `experiments/rlm_prototype.py` |
| **✅ Complexity Analyzer** | Auto-detect when RLM needed | Port from CC2 Phase 4b |
| Agent primitives | File, memory, web tools | Enhance CC2 version |
| Orchestrator agent | Prompt-based orchestration | Enhance with RLM integration |
| Triage agent | Failure analysis | New |
| Sandbox service | Dagger/E2B abstraction | Port from CC2 |

### Phase 3.5: Strategic Intelligence (Hours 3-5, overlapping)

| Task | Deliverable |
|------|-------------|
| Wander agent | Dwelling exploration |
| Source curator | External ingestion |
| Hypothesis engine | Decomposition + validation |
| AI Arena | Multi-model validation (invisible) |
| Strategy planner | Validated ideas → tasks |

### Phase 4: Knowledge Layer (Hours 4-6)

| Task | Deliverable | Status |
|------|-------------|--------|
| KnowledgeBeast | Vector + graph store | New (enhances CC2) |
| **✅ 6-layer Memory** | Hierarchical memory | Port from CC2 Phase 3b |
| **✅ Tiered Visual Memory** | HOT/WARM/COLD/ARCHIVE | Port from CC2 Phase 3d |
| **✅ Skills Store** | Skill management | Port from CC2 Phase 3a |

### Phase 5: Frontend Shell (Hours 4-7, parallel with Phase 4)

| Task | Deliverable | Priority |
|------|-------------|----------|
| Component library | UI primitives | P0 |
| Ideas Tab | Simple entry point with 3 paths | P0 |
| VISLZR canvas | Mind map with 10 node types + altitude zoom | P0 |
| Action ring | Contextual actions per type | P0 |
| **CommandPalette** | `Cmd+K` voice + text overlay | P1 |
| **ResonanceNode** | Soft, diffuse node type | P1 |
| **CrystalNode** | Sharp, validated node type | P1 |
| Execution view | Kanban + streaming | P0 |
| Revenue dashboard | Strategic ARR view | P1 |
| App shell | Routing, layout, project selector | P0 |

### Phase 5.5: Living Canvas Polish (Hours 7-9, after Phase 5)

| Task | Deliverable | Priority |
|------|-------------|----------|
| **HoverPortal** | Peek window on node hover | P2 |
| **LiveSynthesis** | Real-time voice structure extraction | P2 |
| **AgentAvatar** | Moving agent representation | P2 |
| **CodeTheater** | Execution visualization | P2 |
| **TimelineScrubber** | Temporal navigation | P3 |
| **EdgePanel** | Contextual slide-in panels | P3 |
| Mode transitions | Wander/Focus/Review | P3 |
| Cognitive support | Calm canvas, bionic reading | P3 |

### Phase 6: Documentation & Polish (Hour 9-10)

| Task | Deliverable |
|------|-------------|
| Documentation patterns | Templates in /patterns |
| API documentation | OpenAPI spec |
| Integration examples | Usage documentation |

**Total: ~10-14 hours** (with 5 parallel agents)

---

## Appendix A: Platform Models

CC3 contains only platform-level models:

```python
# Platform models (in CC3)
User
Organization
ApiKey
AuditEntry
Workflow
WorkflowStep
Evidence
Control
ControlImplementation
Job
JobRun
Memory
Skill

# Domain models (in Veria/Meridian, NOT in CC3)
SanctionEntry        # Veria
ScreeningResult      # Veria
TaxFirm              # Veria
EsdFiling            # Veria
FedRampBaseline      # Meridian
SystemSecurityPlan   # Meridian
```

---

## Appendix B: Skills for Building CC3

Read before implementation:

- [ ] `skills/cc3-build-patterns/SKILL.md` - Build patterns
- [ ] `skills/software-documentation/SKILL.md` - Code docs
- [ ] `skills/agent-native-architecture/SKILL.md` - Agent patterns
- [ ] `skills/frontend-composability/SKILL.md` - UI patterns

---

## Appendix C: Key Success Criteria

MVP must demonstrate:

- ✅ Ideas Tab with 3-path buttons working
- ✅ VISLZR with at least 5 node types
- ✅ Action ring with contextual actions per node type
- ✅ "Validate" returns confidence percentage (not internals)
- ✅ "Just Do It" triggers agent execution
- ✅ Agent output streams to Execution view
- ✅ **Machinery is invisible—users see ideas and results only**

### Living Canvas (Phase 2)

- ✅ Altitude-based zoom (Strategic → Tactical → Execution)
- ✅ CommandPalette (`Cmd+K`) with natural language navigation
- ✅ Crystallization flow visible (Resonance → Idea → Hypothesis → Task)
- ✅ Ambient intelligence (nodes pulse, breathe, show attention)

### Living Canvas (Phase 3)

- ✅ Hover Portals for context without navigation
- ✅ Live Synthesis extracts structure from voice in real-time
- ✅ Agent Avatars move around canvas showing work
- ✅ Timeline scrubber enables temporal navigation

---

*CC3: An AI Operating System. The Loop is its kernel. Users see ideas and results, never the machinery.*

*"It's not a tool you use. It's a space you inhabit."*
