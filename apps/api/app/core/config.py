from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    cors_origins: list[str] = ["http://localhost:3000"]
    database_url: str = "sqlite:///./data/neonforge.db"
    upload_dir: str = "./data/uploads"
    artifact_dir: str = "./data/artifacts"


settings = Settings()
