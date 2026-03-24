"""
Email service using Brevo (formerly Sendinblue) HTTP API.
Handles OTP sending for password reset and email verification.
"""

import httpx
import random
import string
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings


class EmailService:
    """Email service using Brevo HTTP API."""
    
    # In-memory OTP storage (use Redis in production)
    _otp_storage = {}
    
    @staticmethod
    def generate_otp(length: int = 6) -> str:
        """Generate a random OTP code."""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    async def send_otp_email(email: str, otp: str, purpose: str = "password_reset") -> bool:
        """
        Send OTP via Brevo email API.
        
        Args:
            email: Recipient email address
            otp: OTP code to send
            purpose: 'password_reset' or 'email_verification'
        
        Returns:
            True if email sent successfully, False otherwise
        """
        # Dev mode - no API key configured
        if not settings.BREVO_API_KEY or settings.BREVO_API_KEY == "your_brevo_api_key_here":
            print(f"\n{'='*60}")
            print(f"[DEV MODE] Email Service")
            print(f"{'='*60}")
            print(f"To: {email}")
            print(f"Purpose: {purpose}")
            print(f"OTP Code: {otp}")
            print(f"{'='*60}\n")
            return True
        
        # Prepare email content based on purpose
        if purpose == "password_reset":
            subject = "AgroSight - Password Reset OTP"
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #2d5016;">🌾 AgroSight Password Reset</h2>
                        <p>You requested to reset your password. Use the OTP code below:</p>
                        <div style="background: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                            <h1 style="color: #2d5016; letter-spacing: 5px; margin: 0;">{otp}</h1>
                        </div>
                        <p><strong>This OTP is valid for 10 minutes.</strong></p>
                        <p>If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">AgroSight - AI-Powered Plant Disease Detection</p>
                    </div>
                </body>
            </html>
            """
        else:  # email_verification
            subject = "AgroSight - Verify Your Email"
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #2d5016;">🌾 Welcome to AgroSight!</h2>
                        <p>Please verify your email address using the OTP code below:</p>
                        <div style="background: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                            <h1 style="color: #2d5016; letter-spacing: 5px; margin: 0;">{otp}</h1>
                        </div>
                        <p><strong>This OTP is valid for 10 minutes.</strong></p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">AgroSight - AI-Powered Plant Disease Detection</p>
                    </div>
                </body>
            </html>
            """
        
        # Brevo API payload
        payload = {
            "sender": {
                "name": "AgroSight",
                "email": settings.BREVO_SENDER_EMAIL
            },
            "to": [
                {
                    "email": email,
                    "name": email.split("@")[0]
                }
            ],
            "subject": subject,
            "htmlContent": html_content
        }
        
        # Send via Brevo API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.brevo.com/v3/smtp/email",
                    json=payload,
                    headers={
                        "api-key": settings.BREVO_API_KEY,
                        "Content-Type": "application/json"
                    },
                    timeout=10.0
                )
                
                if response.status_code == 201:
                    print(f"✅ Email sent to {email}")
                    return True
                else:
                    print(f"❌ Failed to send email: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Email service error: {str(e)}")
            return False
    
    @staticmethod
    def store_otp(email: str, otp: str, expires_minutes: int = 10):
        """Store OTP with expiration time."""
        expiry = datetime.now() + timedelta(minutes=expires_minutes)
        EmailService._otp_storage[email] = {
            "otp": otp,
            "expires_at": expiry,
            "attempts": 0
        }
    
    @staticmethod
    def verify_otp(email: str, otp: str) -> tuple[bool, str]:
        """
        Verify OTP code.
        
        Returns:
            (success: bool, message: str)
        """
        if email not in EmailService._otp_storage:
            return False, "No OTP found for this email"
        
        stored = EmailService._otp_storage[email]
        
        # Check expiration
        if datetime.now() > stored["expires_at"]:
            del EmailService._otp_storage[email]
            return False, "OTP has expired"
        
        # Check attempts (max 5)
        if stored["attempts"] >= 5:
            del EmailService._otp_storage[email]
            return False, "Too many failed attempts"
        
        # Verify OTP
        if stored["otp"] == otp:
            del EmailService._otp_storage[email]
            return True, "OTP verified successfully"
        else:
            stored["attempts"] += 1
            return False, f"Invalid OTP. {5 - stored['attempts']} attempts remaining"
    
    @staticmethod
    def clear_otp(email: str):
        """Clear OTP for email."""
        if email in EmailService._otp_storage:
            del EmailService._otp_storage[email]
