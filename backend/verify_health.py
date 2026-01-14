#!/usr/bin/env python3
"""
Simple verification script for the health endpoint.

This script verifies that:
1. Health router can be imported
2. All required dependencies are available
3. The module structure is correct
"""

import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    # Verify imports
    print("Verifying imports...")

    from app.routers.health import router, health_check, simple_health_check
    print("✓ Health router imported successfully")

    from app.database import async_session
    print("✓ Database module imported successfully")

    from app.services.parallel_execution_runner import get_worktree_pool
    print("✓ Parallel execution runner imported successfully")

    from app.models.autonomous import AutonomousSession, SessionStatus
    print("✓ Autonomous models imported successfully")

    # Verify router configuration
    print("\nVerifying router configuration...")
    print(f"Router prefix: {router.prefix}")
    print(f"Router tags: {router.tags}")
    print(f"Number of routes: {len(router.routes)}")

    for route in router.routes:
        print(f"  - {route.methods} {route.path}")

    print("\n✅ All verifications passed!")
    print("\nExpected endpoints:")
    print("  - GET /api/v1/health - Enhanced health check")
    print("  - GET /api/v1/health/simple - Simple health check")

except ImportError as e:
    print(f"\n❌ Import error: {e}")
    print("\nMake sure to install dependencies:")
    print("  cd backend && pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
