"""
Comprehensive tests for ConfigValidator.

Tests all validation rules:
- Required environment variables
- Database URL format and connectivity
- Worktree configuration
- Required directories
- API keys
- Security settings
"""

import asyncio
import os
import pytest
from pathlib import Path
from typing import Optional
from unittest.mock import Mock, patch, AsyncMock

from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.services.config_validator import (
    ConfigValidator,
    ValidationResult,
    ValidationIssue,
    ConfigValidationError,
    DatabaseConnectionError,
    MissingConfigError,
    DirectoryError,
    validate_startup_config,
)
from app.config import Settings


# Test fixtures

@pytest.fixture
def mock_settings():
    """Create a mock settings object with valid defaults."""
    return Settings(
        database_url="sqlite+aiosqlite:///./test.db",
        secret_key="test-secret-key",
        cors_origins=["http://localhost:3000"],
        anthropic_api_key="test-anthropic-key",
        openai_api_key="",
        github_token="test-github-token",
        github_repo_owner="test-owner",
        github_repo_name="test-repo",
        repo_path=str(Path(__file__).parent.parent.parent.parent),
        host="0.0.0.0",
        port=8001,
    )


@pytest.fixture
def validator(mock_settings):
    """Create a validator with mock settings and skip database checks."""
    return ConfigValidator(custom_settings=mock_settings, skip_database=True)


# Test ValidationResult

def test_validation_result_add_error():
    """Test adding errors to ValidationResult."""
    result = ValidationResult(valid=True)
    assert result.valid is True
    assert len(result.errors) == 0

    result.add_error("test", "Test error message", field="test_field")

    assert result.valid is False
    assert len(result.errors) == 1
    assert result.errors[0].category == "test"
    assert result.errors[0].severity == "error"
    assert result.errors[0].message == "Test error message"
    assert result.errors[0].field == "test_field"


def test_validation_result_add_warning():
    """Test adding warnings to ValidationResult."""
    result = ValidationResult(valid=True)
    result.add_warning("test", "Test warning", field="test_field")

    assert result.valid is True  # Warnings don't invalidate
    assert len(result.warnings) == 1
    assert len(result.errors) == 0
    assert result.warnings[0].severity == "warning"


def test_validation_result_to_dict():
    """Test converting ValidationResult to dictionary."""
    result = ValidationResult(valid=True)
    result.add_error("env", "Missing variable")
    result.add_warning("security", "Default key")

    data = result.to_dict()

    assert data["valid"] is False
    assert len(data["errors"]) == 1
    assert len(data["warnings"]) == 1
    assert data["errors"][0]["category"] == "env"
    assert data["warnings"][0]["category"] == "security"


# Test environment variable validation

@pytest.mark.asyncio
async def test_validate_required_env_vars_success(validator):
    """Test successful environment variable validation."""
    result = await validator.validate_all()

    # Should have no environment errors (mock has DATABASE_URL)
    env_errors = [e for e in result.errors if e.category == "environment"]
    assert len(env_errors) == 0


@pytest.mark.asyncio
async def test_validate_required_env_vars_missing_database_url(mock_settings):
    """Test validation fails when DATABASE_URL is missing."""
    mock_settings.database_url = ""
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)

    result = await validator.validate_all()

    assert result.valid is False
    env_errors = [e for e in result.errors if e.category == "environment"]
    assert len(env_errors) >= 1
    assert any("DATABASE_URL" in e.message for e in env_errors)


# Test database URL validation

@pytest.mark.asyncio
async def test_validate_database_url_format_valid(validator):
    """Test valid database URL formats."""
    valid_urls = [
        "sqlite+aiosqlite:///./test.db",
        "postgresql+asyncpg://user:pass@localhost/db",
        "sqlite:///./test.db",
        "postgresql://user:pass@localhost/db",
    ]

    for url in valid_urls:
        validator.settings.database_url = url
        result = ValidationResult(valid=True)
        validator._validate_database_url(result)

        db_errors = [e for e in result.errors if e.category == "database"]
        assert len(db_errors) == 0, f"Valid URL rejected: {url}"


@pytest.mark.asyncio
async def test_validate_database_url_format_invalid(validator):
    """Test invalid database URL formats."""
    invalid_urls = [
        "",
        "invalid-url",
        "mysql://localhost/db",  # MySQL not supported
        "redis://localhost",
    ]

    for url in invalid_urls:
        validator.settings.database_url = url
        result = ValidationResult(valid=True)
        validator._validate_database_url(result)

        db_errors = [e for e in result.errors if e.category == "database"]
        assert len(db_errors) > 0, f"Invalid URL accepted: {url}"


@pytest.mark.asyncio
async def test_validate_database_url_default_warning(validator):
    """Test warning for default SQLite database."""
    validator.settings.database_url = "sqlite+aiosqlite:///./cc4.db"
    result = ValidationResult(valid=True)
    validator._validate_database_url(result)

    warnings = [w for w in result.warnings if w.category == "database"]
    assert len(warnings) >= 1
    assert any("production" in w.message.lower() for w in warnings)


# Test database connectivity

@pytest.mark.asyncio
async def test_validate_database_connectivity_success():
    """Test successful database connection."""
    # Use a real validator without skip_database
    validator = ConfigValidator(skip_database=False)
    result = ValidationResult(valid=True)

    # This will test actual database connectivity
    await validator._validate_database_connectivity(result)

    # Should succeed with default SQLite
    db_errors = [e for e in result.errors if e.category == "database"]
    assert len(db_errors) == 0


@pytest.mark.asyncio
async def test_validate_database_connectivity_failure(mock_settings):
    """Test database connection failure handling."""
    # Set invalid database URL
    mock_settings.database_url = "postgresql+asyncpg://invalid:invalid@nonexistent:9999/db"
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=False)
    result = ValidationResult(valid=True)

    await validator._validate_database_connectivity(result)

    assert result.valid is False
    db_errors = [e for e in result.errors if e.category == "database"]
    assert len(db_errors) > 0
    assert any("connect" in e.message.lower() for e in db_errors)


# Test worktree configuration

@pytest.mark.asyncio
async def test_validate_worktree_config_valid(validator):
    """Test valid worktree configuration."""
    result = ValidationResult(valid=True)
    validator._validate_worktree_config(result)

    # Should succeed (repo_path points to actual project)
    worktree_errors = [e for e in result.errors if e.category == "worktree"]
    assert len(worktree_errors) == 0


@pytest.mark.asyncio
async def test_validate_worktree_config_nonexistent_path(mock_settings):
    """Test worktree validation with nonexistent path."""
    mock_settings.repo_path = "/nonexistent/path/to/repo"
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_worktree_config(result)

    assert result.valid is False
    worktree_errors = [e for e in result.errors if e.category == "worktree"]
    assert len(worktree_errors) > 0
    assert any("does not exist" in e.message for e in worktree_errors)


@pytest.mark.asyncio
async def test_validate_worktree_config_not_git_repo(mock_settings, tmp_path):
    """Test worktree validation with non-git directory."""
    # Create a temporary directory that's not a git repo
    test_dir = tmp_path / "not-a-repo"
    test_dir.mkdir()

    mock_settings.repo_path = str(test_dir)
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_worktree_config(result)

    assert result.valid is False
    worktree_errors = [e for e in result.errors if e.category == "worktree"]
    assert len(worktree_errors) > 0
    assert any("git repository" in e.message for e in worktree_errors)


# Test required directories

@pytest.mark.asyncio
async def test_validate_required_directories_exist(validator):
    """Test required directories validation."""
    result = ValidationResult(valid=True)
    validator._validate_required_directories(result)

    # Should have backend, frontend, docs in CC4 project
    # May have warnings if directories don't exist, but not errors
    dir_errors = [e for e in result.errors if e.category == "directory"]
    assert len(dir_errors) == 0


@pytest.mark.asyncio
async def test_validate_required_directories_missing(mock_settings, tmp_path):
    """Test validation with missing required directories."""
    # Create a temporary git repo without expected directories
    test_repo = tmp_path / "test-repo"
    test_repo.mkdir()
    (test_repo / ".git").mkdir()

    mock_settings.repo_path = str(test_repo)
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_required_directories(result)

    # Should have warnings for missing directories
    dir_warnings = [w for w in result.warnings if w.category == "directory"]
    assert len(dir_warnings) > 0


# Test API keys validation

@pytest.mark.asyncio
async def test_validate_api_keys_with_github_token(validator):
    """Test API keys validation with GitHub token."""
    result = ValidationResult(valid=True)
    validator._validate_api_keys(result)

    # Should have no errors (warnings OK)
    api_errors = [e for e in result.errors if e.category == "api_keys"]
    assert len(api_errors) == 0


@pytest.mark.asyncio
async def test_validate_api_keys_missing_github_token(mock_settings):
    """Test warning when GitHub token is missing."""
    mock_settings.github_token = ""
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_api_keys(result)

    # Should have warning about missing GitHub token
    api_warnings = [w for w in result.warnings if w.category == "api_keys"]
    assert any("GITHUB_TOKEN" in w.message for w in api_warnings)


@pytest.mark.asyncio
async def test_validate_api_keys_missing_ai_keys(mock_settings):
    """Test warning when AI API keys are missing."""
    mock_settings.anthropic_api_key = ""
    mock_settings.openai_api_key = ""
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_api_keys(result)

    # Should have warning about missing AI keys
    api_warnings = [w for w in result.warnings if w.category == "api_keys"]
    assert any("AI API keys" in w.message for w in api_warnings)


# Test security settings validation

@pytest.mark.asyncio
async def test_validate_security_default_secret_key(mock_settings):
    """Test warning for default secret key."""
    mock_settings.secret_key = "change-me-in-production"
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_security_settings(result)

    security_warnings = [w for w in result.warnings if w.category == "security"]
    assert any("SECRET_KEY" in w.message for w in security_warnings)


@pytest.mark.asyncio
async def test_validate_security_custom_secret_key(mock_settings):
    """Test no warning with custom secret key."""
    mock_settings.secret_key = "my-custom-secret-key-12345"
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_security_settings(result)

    security_warnings = [w for w in result.warnings if w.category == "security" and "SECRET_KEY" in w.message]
    assert len(security_warnings) == 0


@pytest.mark.asyncio
async def test_validate_security_no_cors_origins(mock_settings):
    """Test warning when no CORS origins configured."""
    mock_settings.cors_origins = []
    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = ValidationResult(valid=True)

    validator._validate_security_settings(result)

    security_warnings = [w for w in result.warnings if w.category == "security"]
    assert any("CORS" in w.message for w in security_warnings)


# Test full validation

@pytest.mark.asyncio
async def test_validate_all_success(validator):
    """Test full validation with valid configuration."""
    result = await validator.validate_all()

    # Should be valid (warnings OK, but no errors)
    assert result.valid is True
    assert len(result.errors) == 0


@pytest.mark.asyncio
async def test_validate_all_multiple_errors(mock_settings):
    """Test full validation with multiple errors."""
    # Create intentionally invalid configuration
    mock_settings.database_url = ""
    mock_settings.repo_path = "/nonexistent/path"

    validator = ConfigValidator(custom_settings=mock_settings, skip_database=True)
    result = await validator.validate_all()

    assert result.valid is False
    assert len(result.errors) >= 2  # At least DATABASE_URL and repo_path errors


# Test convenience function

@pytest.mark.asyncio
async def test_validate_startup_config():
    """Test the validate_startup_config convenience function."""
    result = await validate_startup_config()

    # Should return a ValidationResult
    assert isinstance(result, ValidationResult)
    # With default/test config, should be valid or have only warnings
    assert result.valid is True or len(result.errors) == 0


# Test exception classes

def test_exception_hierarchy():
    """Test that exception classes are properly defined."""
    # Test base exception
    error = ConfigValidationError("test")
    assert str(error) == "test"
    assert isinstance(error, Exception)

    # Test derived exceptions
    db_error = DatabaseConnectionError("db test")
    assert isinstance(db_error, ConfigValidationError)

    missing_error = MissingConfigError("missing test")
    assert isinstance(missing_error, ConfigValidationError)

    dir_error = DirectoryError("dir test")
    assert isinstance(dir_error, ConfigValidationError)


# Integration tests

@pytest.mark.asyncio
async def test_integration_full_validation_flow():
    """Integration test of full validation flow."""
    # Create validator with defaults
    validator = ConfigValidator(skip_database=True)

    # Run full validation
    result = await validator.validate_all()

    # Verify result structure
    assert isinstance(result, ValidationResult)
    assert isinstance(result.valid, bool)
    assert isinstance(result.issues, list)
    assert isinstance(result.warnings, list)

    # Verify to_dict works
    data = result.to_dict()
    assert "valid" in data
    assert "errors" in data
    assert "warnings" in data


@pytest.mark.asyncio
async def test_integration_with_real_database():
    """Integration test with real database connection."""
    # This tests actual database connectivity
    validator = ConfigValidator(skip_database=False)
    result = await validator.validate_all()

    # With SQLite default, should succeed
    assert result.valid is True or len([e for e in result.errors if e.category != "database"]) == 0
