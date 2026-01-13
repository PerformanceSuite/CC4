"""Application configuration."""

from functools import lru_cache
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
    database_url: str = "sqlite+aiosqlite:///./commandcenter2.db"

    # Security
    secret_key: str = "change-me-in-production"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"]

    # API Keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    github_token: str = ""

    # Repository settings
    default_repo_url: str = "https://github.com/PerformanceSuite/CommandCenter2.0"
    default_branch: str = "main"

    # Feature Flags
    enable_wander_agent: bool = False
    enable_ai_arena: bool = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
