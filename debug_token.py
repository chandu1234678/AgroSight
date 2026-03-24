"""Debug token to see what's inside"""
from jose import jwt
import sys
import json

if len(sys.argv) < 2:
    print("Usage: py debug_token.py <token>")
    sys.exit(1)

token = sys.argv[1]

# Decode without verification to see payload
try:
    # Split token and decode middle part (payload)
    parts = token.split('.')
    if len(parts) != 3:
        print("Invalid token format")
        sys.exit(1)
    
    # Add padding if needed
    payload_part = parts[1]
    padding = 4 - len(payload_part) % 4
    if padding != 4:
        payload_part += '=' * padding
    
    import base64
    payload_bytes = base64.urlsafe_b64decode(payload_part)
    payload = json.loads(payload_bytes)
    
    print("Token payload:")
    print(json.dumps(payload, indent=2))
    print(f"\nUser ID (sub): {payload.get('sub')}")
    print(f"Type: {type(payload.get('sub'))}")
except Exception as e:
    print(f"Error decoding token: {e}")
    import traceback
    traceback.print_exc()
