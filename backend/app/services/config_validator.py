"""
Configuration Validation Service.

Validates all startup configuration before the application starts:
- Required environment variables
- Database connectivity
- Worktree pool configuration
- Required directories

Returns structured validation results with clear error messages for fail-fast startup.
"""

import asyncio
import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Dict, Any

from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.config import settings
from app.database import engine, sync_engine

logger = logging.getLogger(__name__)


class ConfigValidationError(Exception):
    """Base exception for configuration validation errors."""
    pass


class DatabaseConnectionError(ConfigValidationError):
    """Error connecting to database."""
    pass


class MissingConfigError(ConfigValidationError):
    """Required configuration is missing."""
    pass


class DirectoryError(ConfigValidationError):
    """Required directory does not exist or is not accessible."""
    pass


@dataclass
class ValidationIssue:
    """A single validation issue."""
    category: str  # e.g., "environment", "database", "directory"
    severity: str  # "error", "warning"
    message: str
    field: Optional[str] = None


@dataclass
class ValidationResult:
    """Result of configuration validation."""
    valid: bool
    issues: List[ValidationIssue] = field(default_factory=list)
    warnings: List[ValidationIssue] = field(default_factory=list)

    @property
    def errors(self) -> List[ValidationIssue]:
        """Get only error issues."""
        return [issue for issue in self.issues if issue.severity == "error"]

    def add_error(self, category: str, message: str, field: Optional[str] = None) -> None:
        """Add an error issue."""
        self.issues.append(ValidationIssue(
            category=category,
            severity="error",
            message=message,
            field=field
        ))
        self.valid = False

    def add_warning(self, category: str, message: str, field: Optional[str] = None) -> None:
        """Add a warning issue."""
        warning = ValidationIssue(
            category=category,
            severity="warning",
            message=message,
            field=field
        )
        self.issues.append(warning)
        self.warnings.append(warning)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses."""
        return {
            "valid": self.valid,
            "errors": [
                {
                    "category": issue.category,
                    "message": issue.message,
                    "field": issue.field
                }
                for issue in self.errors
            ],
            "warnings": [
                {
                    "category": issue.category,
                    "message": issue.message,
                    "field": issue.field
                }
                for issue in self.warnings
            ]
        }


class ConfigValidator:
    """
    Validates application configuration at startup.

    Usage:
        validator = ConfigValidator()
        result = await validator.validate_all()
        if not result.valid:
            for error in result.errors:
                logger.error(f"Config error: {error.message}")
            raise ConfigValidationError("Invalid configuration")
    """

    def __init__(
        self,
        custom_settings: Optional[Any] = None,
        skip_database: bool = False
    ):
        """
        Initialize validator.

        Args:
            custom_settings: Optional custom settings for testing
            skip_database: Skip database validation (for testing)
        """
        self.settings = custom_settings or settings
        self.skip_database = skip_database

    async def validate_all(self) -> ValidationResult:
        """
        Validate all configuration.

        Returns:
            ValidationResult with all issues found
        """
        logger.info("[ConfigValidator] Starting configuration validation...")
        result = ValidationResult(valid=True)

        # Validate in order of dependencies
        self._validate_required_env_vars(result)
        self._validate_database_url(result)

        if not self.skip_database and not result.errors:
            await self._validate_database_connectivity(result)

        self._validate_worktree_config(result)
        self._validate_required_directories(result)
        self._validate_api_keys(result)
        self._validate_security_settings(result)

        if result.valid:
            logger.info("[ConfigValidator] ✓ All configuration valid")
        else:
            logger.error(
                f"[ConfigValidator] ✗ Validation failed with {len(result.errors)} errors"
            )
            for error in result.errors:
                logger.error(f"  - [{error.category}] {error.message}")

        return result

    def _validate_required_env_vars(self, result: ValidationResult) -> None:
        """Validate that required environment variables are set."""
        logger.debug("[ConfigValidator] Validating environment variables...")

        # Core required variables
        required_vars = {
            "DATABASE_URL": self.settings.database_url,
        }

        for var_name, var_value in required_vars.items():
            if not var_value or var_value == "":
                result.add_error(
                    "environment",
                    f"Required environment variable {var_name} is not set",
                    field=var_name
                )

    def _validate_database_url(self, result: ValidationResult) -> None:
        """Validate database URL format."""
        logger.debug("[ConfigValidator] Validating database URL format...")

        db_url = self.settings.database_url

        if not db_url:
            result.add_error(
                "database",
                "DATABASE_URL is empty",
                field="database_url"
            )
            return

        # Check for supported database types
        supported_prefixes = [
            "sqlite+aiosqlite://",
            "postgresql+asyncpg://",
            "sqlite://",
            "postgresql://"
        ]

        if not any(db_url.startswith(prefix) for prefix in supported_prefixes):
            result.add_error(
                "database",
                f"DATABASE_URL must start with one of: {', '.join(supported_prefixes)}",
                field="database_url"
            )
            return

        # Warn about default SQLite database
        if db_url == "sqlite+aiosqlite:///./cc4.db":
            result.add_warning(
                "database",
                "Using default SQLite database. Consider using PostgreSQL for production.",
                field="database_url"
            )

    async def _validate_database_connectivity(self, result: ValidationResult) -> None:
        """Validate that we can connect to the database."""
        logger.debug("[ConfigValidator] Testing database connectivity...")

        try:
            # Test async engine
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            logger.debug("[ConfigValidator] ✓ Async database connection successful")

        except OperationalError as e:
            result.add_error(
                "database",
                f"Cannot connect to database: {str(e)}",
                field="database_url"
            )
            return
        except Exception as e:
            result.add_error(
                "database",
                f"Database connection error: {str(e)}",
                field="database_url"
            )
            return

        # Test sync engine (used by background tasks)
        try:
            with sync_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.debug("[ConfigValidator] ✓ Sync database connection successful")

        except OperationalError as e:
            result.add_error(
                "database",
                f"Cannot connect to sync database: {str(e)}",
                field="database_url"
            )
        except Exception as e:
            result.add_error(
                "database",
                f"Sync database connection error: {str(e)}",
                field="database_url"
            )

    def _validate_worktree_config(self, result: ValidationResult) -> None:
        """Validate worktree pool configuration."""
        logger.debug("[ConfigValidator] Validating worktree configuration...")

        repo_path = Path(self.settings.repo_path)

        # Check repo_path exists
        if not repo_path.exists():
            result.add_error(
                "worktree",
                f"Repository path does not exist: {repo_path}",
                field="repo_path"
            )
            return

        if not repo_path.is_dir():
            result.add_error(
                "worktree",
                f"Repository path is not a directory: {repo_path}",
                field="repo_path"
            )
            return

        # Check if it's a git repository
        git_dir = repo_path / ".git"
        if not git_dir.exists():
            result.add_error(
                "worktree",
                f"Repository path is not a git repository: {repo_path}",
                field="repo_path"
            )
            return

        logger.debug(f"[ConfigValidator] ✓ Repository path valid: {repo_path}")

    def _validate_required_directories(self, result: ValidationResult) -> None:
        """Validate that required directories exist."""
        logger.debug("[ConfigValidator] Validating required directories...")

        repo_path = Path(self.settings.repo_path)

        # Required directories for CC4
        required_dirs = [
            repo_path / "backend",
            repo_path / "frontend",
            repo_path / "docs",
        ]

        for dir_path in required_dirs:
            if not dir_path.exists():
                result.add_warning(
                    "directory",
                    f"Expected directory does not exist: {dir_path.relative_to(repo_path)}",
                    field=str(dir_path)
                )
            elif not dir_path.is_dir():
                result.add_error(
                    "directory",
                    f"Path exists but is not a directory: {dir_path.relative_to(repo_path)}",
                    field=str(dir_path)
                )

    def _validate_api_keys(self, result: ValidationResult) -> None:
        """Validate API keys configuration."""
        logger.debug("[ConfigValidator] Validating API keys...")

        # GitHub token is required for pipeline execution
        if not self.settings.github_token:
            result.add_warning(
                "api_keys",
                "GITHUB_TOKEN not set. Required for PR creation and merging.",
                field="github_token"
            )

        # AI API keys are optional but warn if missing
        if not self.settings.anthropic_api_key and not self.settings.openai_api_key:
            result.add_warning(
                "api_keys",
                "No AI API keys configured (ANTHROPIC_API_KEY or OPENAI_API_KEY)",
                field="anthropic_api_key"
            )

    def _validate_security_settings(self, result: ValidationResult) -> None:
        """Validate security-related settings."""
        logger.debug("[ConfigValidator] Validating security settings...")

        # Warn about default secret key
        if self.settings.secret_key == "change-me-in-production":
            result.add_warning(
                "security",
                "Using default SECRET_KEY. Change this in production!",
                field="secret_key"
            )

        # Validate CORS origins
        if not self.settings.cors_origins:
            result.add_warning(
                "security",
                "No CORS origins configured. Frontend may not be able to connect.",
                field="cors_origins"
            )


async def validate_startup_config() -> ValidationResult:
    """
    Convenience function for validating config at startup.

    Usage in main.py:
        result = await validate_startup_config()
        if not result.valid:
            raise RuntimeError("Invalid configuration")

    Returns:
        ValidationResult with all issues
    """
    validator = ConfigValidator()
    return await validator.validate_all()
