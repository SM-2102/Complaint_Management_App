from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL_CONNECT: str
    BACKUP_FOLDER: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


Config_backup = Settings()
