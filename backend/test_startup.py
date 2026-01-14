#!/usr/bin/env python3
"""Test script for startup validation."""

import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.startup import validate_config, validate_database


async def test_valid_config():
    """Test startup with valid configuration."""
    print("\n[TEST 1] Config validation with valid config...")
    valid, error = await validate_config()
    print(f"  Valid: {valid}")
    if not valid:
        print(f"  Error: {error}")
    else:
        print("  ✓ All config checks passed")
    return valid


async def test_invalid_config():
    """Test startup with invalid configuration."""
    print("\n[TEST 2] Config validation with invalid repo path...")

    # Save original value
    from app.config import settings

    original_repo_path = settings.repo_path

    # Set invalid repo path
    settings.repo_path = "/nonexistent/path/to/repo"

    valid, error = await validate_config()
    print(f"  Valid: {valid}")
    if not valid:
        print(f"  Error: {error}")
        print("  ✓ Correctly detected invalid config")
        result = True
    else:
        print("  ✗ Failed to detect invalid config")
        result = False

    # Restore original value
    settings.repo_path = original_repo_path

    return result


async def test_database():
    """Test database validation."""
    print("\n[TEST 3] Database validation...")
    valid, error = await validate_database()
    print(f"  Valid: {valid}")
    if not valid:
        print(f"  Error: {error}")
    else:
        print("  ✓ Database initialized and connected")
    return valid


async def main():
    """Run all tests."""
    print("=" * 60)
    print("Startup Validation Tests")
    print("=" * 60)

    results = []

    # Test 1: Valid config
    results.append(await test_valid_config())

    # Test 2: Invalid config
    results.append(await test_invalid_config())

    # Test 3: Database
    results.append(await test_database())

    print("\n" + "=" * 60)
    if all(results):
        print("All tests PASSED ✓")
        return 0
    else:
        print("Some tests FAILED ✗")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
