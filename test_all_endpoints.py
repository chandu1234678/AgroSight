"""
Comprehensive test suite for AgroSight API endpoints
Tests all functionality end-to-end
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:5173"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BLUE}{text.center(70)}{Colors.END}")
    print(f"{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.YELLOW}ℹ {text}{Colors.END}")

class AgroSightTester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.scan_id = None
        self.results = {
            'passed': 0,
            'failed': 0,
            'total': 0
        }
    
    def test(self, name, func):
        """Run a test and track results"""
        self.results['total'] += 1
        try:
            func()
            self.results['passed'] += 1
            print_success(f"{name}")
            return True
        except AssertionError as e:
            self.results['failed'] += 1
            print_error(f"{name}: {str(e)}")
            return False
        except Exception as e:
            self.results['failed'] += 1
            print_error(f"{name}: Unexpected error - {str(e)}")
            return False
    
    def test_health_check(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL.replace('/api', '')}/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data['status'] == 'healthy', "Service not healthy"
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = requests.get(BASE_URL.replace('/api', ''))
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'message' in data, "Missing message field"
        assert 'AgroSight' in data['message'], "Wrong app name"
    
    def test_register(self):
        """Test user registration"""
        email = f"test_{int(time.time())}@agrosight.com"
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": email,
                "password": "password123",
                "name": "Test User"
            }
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        data = response.json()
        assert 'id' in data, "Missing user ID"
        assert data['email'] == email, "Email mismatch"
        self.user_id = data['id']
    
    def test_login(self):
        """Test user login"""
        # Use existing test user
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "test@agrosight.com",
                "password": "password123"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'access_token' in data, "Missing access token"
        assert data['token_type'] == 'bearer', "Wrong token type"
        self.token = data['access_token']
    
    def test_get_current_user(self):
        """Test /auth/me endpoint"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'email' in data, "Missing email"
        assert 'id' in data, "Missing user ID"
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'total_scans' in data, "Missing total_scans"
        assert 'most_common_disease' in data, "Missing most_common_disease"
        assert 'recent_scans' in data, "Missing recent_scans"
        assert isinstance(data['recent_scans'], list), "recent_scans should be a list"
    
    def test_scan_upload(self):
        """Test scan upload endpoint"""
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create a dummy image file
        files = {
            'file': ('test.jpg', b'fake image data', 'image/jpeg')
        }
        
        response = requests.post(
            f"{BASE_URL}/scan/upload",
            headers=headers,
            files=files
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'disease' in data, "Missing disease"
        assert 'confidence' in data, "Missing confidence"
        assert 'id' in data, "Missing scan ID"
        self.scan_id = data['id']
        print_info(f"  Detected: {data['disease']} ({data['confidence']*100:.1f}% confidence)")
    
    def test_scan_history(self):
        """Test scan history endpoint"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BASE_URL}/scan/history", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "History should be a list"
        if len(data) > 0:
            scan = data[0]
            assert 'disease' in scan, "Missing disease in scan"
            assert 'confidence' in scan, "Missing confidence in scan"
            print_info(f"  Found {len(data)} scans in history")
    
    def test_get_scan_details(self):
        """Test get specific scan"""
        if not self.scan_id:
            print_info("  Skipping - no scan ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{BASE_URL}/scan/{self.scan_id}",
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data['id'] == self.scan_id, "Scan ID mismatch"
    
    def test_chat_ask(self):
        """Test chat endpoint"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{BASE_URL}/chat/ask",
            headers=headers,
            json={
                "query": "What is tomato late blight?",
                "use_detailed": False
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'response' in data, "Missing response"
        assert len(data['response']) > 0, "Empty response"
        print_info(f"  Response length: {len(data['response'])} chars")
    
    def test_chat_history(self):
        """Test chat history endpoint"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BASE_URL}/chat/history", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "History should be a list"
        print_info(f"  Found {len(data)} chat messages")
    
    def test_unauthorized_access(self):
        """Test that endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/dashboard/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_invalid_token(self):
        """Test with invalid token"""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_frontend_accessible(self):
        """Test that frontend is accessible"""
        try:
            response = requests.get(FRONTEND_URL, timeout=5)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        except requests.exceptions.ConnectionError:
            raise AssertionError("Frontend not accessible - is it running?")
    
    def run_all_tests(self):
        """Run all tests"""
        print_header("AGROSIGHT COMPREHENSIVE TEST SUITE")
        print(f"Backend: {BASE_URL}")
        print(f"Frontend: {FRONTEND_URL}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Health checks
        print_header("1. HEALTH CHECKS")
        self.test("Health endpoint", self.test_health_check)
        self.test("Root endpoint", self.test_root_endpoint)
        self.test("Frontend accessible", self.test_frontend_accessible)
        
        # Authentication
        print_header("2. AUTHENTICATION")
        self.test("User registration", self.test_register)
        self.test("User login", self.test_login)
        self.test("Get current user", self.test_get_current_user)
        self.test("Unauthorized access blocked", self.test_unauthorized_access)
        self.test("Invalid token rejected", self.test_invalid_token)
        
        # Dashboard
        print_header("3. DASHBOARD")
        self.test("Dashboard statistics", self.test_dashboard_stats)
        
        # Scan functionality
        print_header("4. SCAN FUNCTIONALITY")
        self.test("Upload and analyze scan", self.test_scan_upload)
        self.test("Get scan history", self.test_scan_history)
        self.test("Get scan details", self.test_get_scan_details)
        
        # Chat functionality
        print_header("5. CHAT FUNCTIONALITY")
        self.test("Ask AI question", self.test_chat_ask)
        self.test("Get chat history", self.test_chat_history)
        
        # Results
        self.print_results()
    
    def print_results(self):
        """Print test results summary"""
        print_header("TEST RESULTS SUMMARY")
        
        total = self.results['total']
        passed = self.results['passed']
        failed = self.results['failed']
        percentage = (passed / total * 100) if total > 0 else 0
        
        print(f"Total Tests:  {total}")
        print(f"{Colors.GREEN}Passed:       {passed}{Colors.END}")
        print(f"{Colors.RED}Failed:       {failed}{Colors.END}")
        print(f"Success Rate: {percentage:.1f}%")
        
        print()
        if failed == 0:
            print(f"{Colors.GREEN}{'='*70}")
            print(f"🎉 ALL TESTS PASSED! 🎉".center(70))
            print(f"{'='*70}{Colors.END}")
            print()
            print("✅ Backend API: Fully functional")
            print("✅ Authentication: Working")
            print("✅ Dashboard: Working")
            print("✅ Scan feature: Working")
            print("✅ Chat feature: Working")
            print("✅ Frontend: Accessible")
            print()
            print("Your AgroSight application is ready for use!")
        else:
            print(f"{Colors.RED}{'='*70}")
            print(f"⚠️  SOME TESTS FAILED  ⚠️".center(70))
            print(f"{'='*70}{Colors.END}")
            print()
            print("Please review the errors above and fix the issues.")
        
        print()

def main():
    """Main test runner"""
    try:
        tester = AgroSightTester()
        tester.run_all_tests()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Tests cancelled by user{Colors.END}")
    except Exception as e:
        print(f"\n\n{Colors.RED}Unexpected error: {e}{Colors.END}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
