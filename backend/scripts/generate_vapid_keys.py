#!/usr/bin/env python3
"""
Generate a VAPID key pair for web push and print the lines for the backend .env.

    python backend/scripts/generate_vapid_keys.py

Equivalent to `npx web-push generate-vapid-keys`; the output works with both.
Generate ONCE and keep the private key secret: if it changes, every existing
browser subscription stops working and people must switch the nudge on again.
"""
import base64

from cryptography.hazmat.primitives import serialization
from py_vapid import Vapid


def b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def main() -> None:
    v = Vapid()
    v.generate_keys()
    public = v.public_key.public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    private = v.private_key.private_numbers().private_value.to_bytes(32, "big")
    print("# Add these to the backend .env on the VPS, then restart the backend:")
    print(f"VAPID_PUBLIC_KEY={b64url(public)}")
    print(f"VAPID_PRIVATE_KEY={b64url(private)}")
    print("VAPID_SUBJECT=mailto:you@example.com   # a contact the push services can reach")


if __name__ == "__main__":
    main()
