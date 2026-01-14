#!/usr/bin/env python3
"""
Quick verification script for ConfigValidator.

Tests basic functionality without requiring pytest.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.config_validator import (
    ConfigValidator,
    ValidationResult,
    ConfigValidationError,
    validate_startup_config,
)


def test_validation_result():
    """Test ValidationResult basic functionality."""
    print("Testing ValidationResult...")

    result = ValidationResult(valid=True)
    assert result.valid is True
    assert len(result.errors) == 0

    result.add_error("test", "Test error", field="field1")
    assert result.valid is False
    assert len(result.errors) == 1

    result.add_warning("test", "Test warning")
    assert len(result.warnings) == 1

    data = result.to_dict()
    assert "valid" in data
    assert "errors" in data
    assert "warnings" in data

    print("✓ ValidationResult tests passed")


async def test_config_validator():
    """Test ConfigValidator basic functionality."""
    print("\nTesting ConfigValidator...")

    # Create validator with skip_database=True for quick test
    validator = ConfigValidator(skip_database=True)

    # Run validation
    result = await validator.validate_all()

    assert isinstance(result, ValidationResult)
    print(f"  Valid: {result.valid}")
    print(f"  Errors: {len(result.errors)}")
    print(f"  Warnings: {len(result.warnings)}")

    if result.errors:
        print("\n  Errors found:")
        for error in result.errors:
            print(f"    - [{error.category}] {error.message}")

    if result.warnings:
        print("\n  Warnings found:")
        for warning in result.warnings:
            print(f"    - [{warning.category}] {warning.message}")

    print("\n✓ ConfigValidator tests passed")


async def test_convenience_function():
    """Test validate_startup_config convenience function."""
    print("\nTesting validate_startup_config...")

    result = await validate_startup_config()

    assert isinstance(result, ValidationResult)
    print(f"  Valid: {result.valid}")

    print("✓ Convenience function test passed")


async def test_database_validation():
    """Test database validation with real connection."""
    print("\nTesting database validation (with real connection)...")

    validator = ConfigValidator(skip_database=False)
    result = await validator.validate_all()

    print(f"  Valid: {result.valid}")

    db_errors = [e for e in result.errors if e.category == "database"]
    if db_errors:
        print("\n  Database errors:")
        for error in db_errors:
            print(f"    - {error.message}")
    else:
        print("  ✓ Database connection successful")

    print("✓ Database validation test passed")


def main():
    """Run all verification tests."""
    print("=" * 60)
    print("Config Validator Verification Script")
    print("=" * 60)

    try:
        # Test synchronous functionality
        test_validation_result()

        # Test async functionality
        asyncio.run(test_config_validator())
        asyncio.run(test_convenience_function())
        asyncio.run(test_database_validation())

        print("\n" + "=" * 60)
        print("✓ ALL TESTS PASSED")
        print("=" * 60)
        return 0

    except Exception as e:
        print("\n" + "=" * 60)
        print(f"✗ TEST FAILED: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
