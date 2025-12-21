from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal

class Settings(BaseSettings):
    # LLM Configuration
    # Supports "openai", "azure", "gemini", "claude" (via OpenAI compatible API)
    LLM_PROVIDER: Literal["openai", "azure", "gemini", "claude"] = "openai"
    LLM_MODEL: str = "gpt-4o-mini"
    OPENAI_API_KEY: str | None = None
    
    # Custom Base URL for OpenAI compatible APIs (Gemini/Claude via proxy etc)
    OPENAI_BASE_URL: str | None = None
    
    # Azure specific (if needed)
    AZURE_OPENAI_API_KEY: str | None = None
    AZURE_OPENAI_ENDPOINT: str | None = None
    AZURE_DEPLOYMENT_NAME: str | None = None
    AZURE_OPENAI_API_VERSION: str | None = "2025-01-01-preview"
    
    # App Settings
    APP_NAME: str = "JomKira"
    DEBUG: bool = False
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    LOG_FORMAT: Literal["text", "json"] = "text"

    # Rate Limiting
    RATE_LIMIT: str = "100/minute"
    
    # CORS Configuration
    CORS_ALLOW_ORIGINS: list[str] = [
        "http://localhost:8081",    # Metro bundler
        "http://10.0.2.2:8081",     # Android emulator
        "http://localhost:3000",    # Web dev
        "*",                        # Allow all for POC - restrict in production
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../../../.env"),
        extra="ignore"
    )

settings = Settings()
