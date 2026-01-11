from fastapi_mail import FastMail, ConnectionConfig, MessageSchema, MessageType
from config import Config

mail_config = ConnectionConfig(
    MAIL_USERNAME= Config.MAIL_USERNAME,
    MAIL_PASSWORD=Config.MAIL_PASSWORD,
    MAIL_FROM=Config.MAIL_FROM,
    MAIL_PORT=Config.MAIL_PORT,
    MAIL_SERVER=Config.MAIL_SERVER,
    MAIL_FROM_NAME=Config.MAIL_FROM_NAME,
    MAIL_STARTTLS=Config.MAIL_STARTTLS,
    MAIL_SSL_TLS=Config.MAIL_SSL_TLS,
    USE_CREDENTIALS=Config.USE_CREDENTIALS,
    VALIDATE_CERTS=Config.VALIDATE_CERTS
)
 
mail = FastMail(
    config=mail_config
)  # Initialize FastMail instance

def create_email_message(subject: str, recipients: list[str], body: str) -> MessageSchema:
    """
    Create an email message schema.

    :param subject: Subject of the email.
    :param recipients: List of recipient email addresses.
    :param body: Body content of the email.
    :return: MessageSchema object.
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=MessageType.html  # You can change this to "plain" if needed
    )
    return message