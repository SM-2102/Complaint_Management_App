from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL_CONNECT: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    FRONTEND_URL: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


Config = Settings()
