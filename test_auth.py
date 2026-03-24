"""
Quick authentication test script.
Run this to test login and token validation.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_auth():
    print("=" * 60)
    print("AgroSight Authentication Test")
    print("=" * 60)
    
    # Test 1: Register (or skip if already exists)
    print("\n1. Testing Registration...")
    register_data = {
        "email": "test@agrosight.com",
        "password": "password123",
        "name": "Test User"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 201:
        print("✓ Registration successful!")
        print(f"  User: {response.json()}")
    elif response.status_code == 400:
        print("✓ User already exists (skipping)")
    else:
        print(f"✗ Registration failed: {response.status_code}")
        print(f"  Response: {response.text}")
    
    # Test 2: Login
    print("\n2. Testing Login...")
    login_data = {
        "email": "test@agrosight.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        print("✓ Login successful!")
        token_data = response.json()
        token = token_data["access_token"]
        print(f"  Token: {token[:50]}...")
        print(f"  Expires in: {token_data['expires_in']} seconds")
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(f"  Response: {response.text}")
        return
    
    # Test 3: Access protected endpoint (Dashboard)
    print("\n3. Testing Protected Endpoint (Dashboard)...")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    if response.status_code == 200:
        print("✓ Dashboard access successful!")
        stats = response.json()
        print(f"  Total scans: {stats['total_scans']}")
        print(f"  Most common disease: {stats['most_common_disease']}")
    else:
        print(f"✗ Dashboard access failed: {response.status_code}")
        print(f"  Response: {response.text}")
        print(f"  Headers sent: {headers}")
    
    # Test 4: Get current user
    print("\n4. Testing /auth/me endpoint...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        print("✓ User info retrieved!")
        user = response.json()
        print(f"  Email: {user['email']}")
        print(f"  Name: {user['name']}")
        print(f"  Active: {user['is_active']}")
    else:
        print(f"✗ User info failed: {response.status_code}")
        print(f"  Response: {response.text}")
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_auth()
    except requests.exceptions.ConnectionError:
        print("✗ Error: Cannot connect to backend server")
        print("  Make sure backend is running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
