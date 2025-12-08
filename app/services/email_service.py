"""
Email service for sending transactional emails.
Supports async SMTP with TLS/SSL.
"""

import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Async email service using SMTP."""

    def __init__(self):
        self.host = settings.smtp_host
        self.port = settings.smtp_port
        self.username = settings.smtp_user
        self.password = settings.smtp_password
        self.from_email = settings.smtp_from_email
        self.from_name = settings.smtp_from_name
        self.use_tls = settings.smtp_use_tls
        self.enabled = settings.email_enabled

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """
        Send an email asynchronously.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML body of the email
            text_content: Plain text fallback (optional)

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not self.enabled:
            logger.warning(
                f"Email not sent (disabled): to={to_email}, subject={subject}"
            )
            return False

        if not all([self.host, self.username, self.password, self.from_email]):
            logger.error("Email configuration incomplete")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            # Add plain text part
            if text_content:
                part1 = MIMEText(text_content, "plain")
                message.attach(part1)

            # Add HTML part
            part2 = MIMEText(html_content, "html")
            message.attach(part2)

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                start_tls=self.use_tls,
            )

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except aiosmtplib.SMTPException as e:
            logger.error(f"SMTP error sending email to {to_email}: {e}")
            return False
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return False

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_link: str,
        expires_minutes: int = 30,
    ) -> bool:
        """
        Send a password reset email.

        Args:
            to_email: User's email address
            reset_link: The password reset URL
            expires_minutes: Token expiration time in minutes

        Returns:
            True if email was sent successfully
        """
        subject = "Reset Your ScopeGuard Password"

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td>
                <!-- Header -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                    <tr>
                        <td align="center">
                            <div style="display: inline-flex; align-items: center; gap: 8px;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: white; font-size: 20px;">&#128737;</span>
                                </div>
                                <span style="font-size: 24px; font-weight: bold; color: #1e293b;">ScopeGuard</span>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Main Content -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #1e293b;">
                                Reset Your Password
                            </h1>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #64748b;">
                                We received a request to reset the password for your ScopeGuard account. Click the button below to create a new password.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                                <tr>
                                    <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7);">
                                        <a href="{reset_link}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: white; text-decoration: none;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                                This link will expire in <strong>{expires_minutes} minutes</strong>.
                            </p>

                            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>

                            <!-- Link fallback -->
                            <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; margin-top: 24px;">
                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                                    If the button doesn't work, copy and paste this link:
                                </p>
                                <p style="margin: 0; font-size: 12px; word-break: break-all;">
                                    <a href="{reset_link}" style="color: #6366f1;">{reset_link}</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                    <tr>
                        <td align="center">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                This email was sent by ScopeGuard. If you have questions, contact our support team.
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
                                &copy; {2024} ScopeGuard. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

        text_content = f"""
Reset Your ScopeGuard Password

We received a request to reset the password for your ScopeGuard account.

Click the link below to create a new password:
{reset_link}

This link will expire in {expires_minutes} minutes.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
ScopeGuard
"""

        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )


# Singleton instance
email_service = EmailService()
