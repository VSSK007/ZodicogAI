"""
Outgoing email for sign-in links.

Provider is chosen from the environment, first match wins:
  RESEND_API_KEY   Resend HTTP API (recommended; no SMTP setup)
  SMTP_HOST        any SMTP server (SMTP_PORT=587, SMTP_USER, SMTP_PASSWORD)
  (neither)        the link is logged instead, so local development works with
                   no email account. Never used silently in production: the
                   caller is told the message was not actually sent.

MAIL_FROM sets the sender, e.g.  MAIL_FROM="ZodicogAI <login@zodicogai.com>"
"""
import logging
import os
import smtplib
from email.message import EmailMessage

import httpx

_log = logging.getLogger(__name__)

SUBJECT = "Your ZodicogAI sign-in link"


def _text(link: str) -> str:
    return (
        "Use this link to sign in to ZodicogAI. It works once and expires in 15 minutes.\n\n"
        f"{link}\n\n"
        "If you didn't ask for this, you can ignore this email - nobody can sign in without the link."
    )


def _html(link: str) -> str:
    return (
        '<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#14121f">'
        '<h2 style="margin:0 0 12px">Sign in to ZodicogAI</h2>'
        "<p>Use the button below to sign in. It works once and expires in 15 minutes.</p>"
        f'<p><a href="{link}" style="display:inline-block;background:#8b7cf6;color:#0b0a14;'
        'padding:12px 24px;border-radius:9px;text-decoration:none;font-weight:600">Sign in</a></p>'
        f'<p style="color:#6a6580;font-size:13px">Or paste this into your browser:<br>{link}</p>'
        '<p style="color:#6a6580;font-size:13px">If you didn\'t ask for this, ignore this email.</p>'
        "</div>"
    )


def send_login_email(to: str, link: str) -> bool:
    """Send the sign-in link. Returns True if a real provider accepted it."""
    sender = os.getenv("MAIL_FROM", "ZodicogAI <login@zodicogai.com>")

    if os.getenv("RESEND_API_KEY"):
        r = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {os.environ['RESEND_API_KEY']}"},
            json={"from": sender, "to": [to], "subject": SUBJECT, "text": _text(link), "html": _html(link)},
            timeout=15,
        )
        r.raise_for_status()
        return True

    if os.getenv("SMTP_HOST"):
        msg = EmailMessage()
        msg["From"], msg["To"], msg["Subject"] = sender, to, SUBJECT
        msg.set_content(_text(link))
        msg.add_alternative(_html(link), subtype="html")
        with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.getenv("SMTP_PORT", "587")), timeout=15) as smtp:
            smtp.starttls()
            if os.getenv("SMTP_USER"):
                smtp.login(os.environ["SMTP_USER"], os.getenv("SMTP_PASSWORD", ""))
            smtp.send_message(msg)
        return True

    _log.warning("No email provider configured (RESEND_API_KEY / SMTP_HOST). Sign-in link for %s: %s", to, link)
    return False
