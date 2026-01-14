"""Application configuration."""

import os
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database (SQLite for local dev, PostgreSQL for production)
    database_url: str = "sqlite+aiosqlite:///./cc4.db"

    # Security
    secret_key: str = "change-me-in-production"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"]

    # API Keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    github_token: str = os.getenv("GITHUB_TOKEN", "")

    # GitHub Repository settings (for pipeline)
    github_repo_owner: str = os.getenv("GITHUB_REPO_OWNER", "PROACTIVA-US")
    github_repo_name: str = os.getenv("GITHUB_REPO_NAME", "CC4")
    default_branch: str = "main"

    # Repository path (for pipeline execution)
    repo_path: str = str(Path(__file__).parent.parent.parent)  # Project root

    # Server
    host: str = "0.0.0.0"
    port: int = 8001

    # Feature Flags
    enable_wander_agent: bool = False
    enable_ai_arena: bool = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
