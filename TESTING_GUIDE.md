# AgroSight Testing Guide

Complete guide for testing all endpoints and features of the AgroSight application.

## Prerequisites

1. Backend running on `http://localhost:8000`
2. Frontend running on `http://localhost:5173`
3. Database initialized with migrations
4. Test user account created

## Quick Start

### 1. Start Backend
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Application
Open browser: `http://localhost:5173`

## Testing Checklist

### Authentication Flow

#### Register New User
1. Navigate to `/signup`
2. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
3. Click "Sign Up"
4. Should redirect to login page

#### Login
1. Navigate to `/login`
2. Enter credentials
3. Click "Login"
4. Should redirect to `/dashboard`
5. Token should be stored in localStorage

#### Logout
1. Click user menu in navbar
2. Click "Logout"
3. Should redirect to `/login`
4. Token should be removed from localStorage

### Dashboard Page

#### Initial Load
- [ ] Dashboard loads without errors
- [ ] Shows "Total Scans" stat (0 for new user)
- [ ] Shows "Most Common Disease" (N/A for new user)
- [ ] Shows "Recent Scans" (empty state for new user)
- [ ] Empty state shows "No scans yet" message
- [ ] "Start First Scan" button visible

#### With Data
- [ ] Total scans count displays correctly
- [ ] Most common disease shows actual disease name
- [ ] Recent scans list shows last 5 scans
- [ ] Each scan card shows disease name and confidence
- [ ] Scan cards show formatted date

#### Actions
- [ ] "Quick Scan" button navigates to `/scan`
- [ ] "New Scan" button navigates to `/scan`
- [ ] "View History" button navigates to `/history`
- [ ] "AI Assistant" button navigates to `/chat`

### Scan Page

#### Image Upload
- [ ] Upload area displays correctly
- [ ] Click to select file works
- [ ] Drag and drop works (if implemented)
- [ ] Only image files accepted
- [ ] Preview shows after selection
- [ ] "Change Image" button works

#### Analysis
- [ ] "Analyze Plant" button enabled after image selection
- [ ] Loading state shows during analysis
- [ ] Error message displays if analysis fails
- [ ] Results display after successful analysis

#### Results Display
- [ ] Disease name shows correctly
- [ ] Confidence percentage displays
- [ ] Severity level shows (if available)
- [ ] Treatment recommendations display
  - Organic treatment
  - Chemical treatment
- [ ] Prevention tips list displays
- [ ] "Continue Chat" button visible
- [ ] "New Scan" button works

#### Continue Chat Feature
- [ ] Click "Continue Chat with AI Assistant"
- [ ] Redirects to `/chat`
- [ ] Chat shows contextual greeting with disease name
- [ ] Can ask follow-up questions about the disease

### History Page

#### Initial Load
- [ ] History page loads without errors
- [ ] Shows all previous scans
- [ ] Empty state if no scans ("No scans found")
- [ ] "Start Scanning" button in empty state

#### Search & Filter
- [ ] Search input filters by disease name
- [ ] "All" filter shows all scans
- [ ] "High Confidence" filter shows scans >80%
- [ ] "Medium" filter shows scans 60-80%
- [ ] "Low" filter shows scans <60%
- [ ] Filters update results immediately

#### Scan Cards
- [ ] Each card shows scan image (if available)
- [ ] Disease name displays
- [ ] Confidence badge shows with color coding:
  - Green for high confidence (>80%)
  - Orange for medium (60-80%)
  - Red for low (<60%)
- [ ] Date displays correctly
- [ ] Severity shows (if available)
- [ ] "View Details" button works

#### Grid Layout
- [ ] Cards display in responsive grid
- [ ] Grid adjusts to screen size
- [ ] Cards have hover effects

### Chat Page

#### Initial State
- [ ] Chat page loads without errors
- [ ] Welcome message from AI assistant displays
- [ ] Input field is enabled
- [ ] Send button is enabled

#### With Disease Context
- [ ] When coming from scan results
- [ ] Shows contextual greeting with disease name
- [ ] Can ask questions about the disease

#### Messaging
- [ ] Type message in input field
- [ ] Press Enter or click "Send"
- [ ] User message appears on right side
- [ ] Loading indicator shows while waiting
- [ ] AI response appears on left side
- [ ] Messages scroll automatically
- [ ] Input clears after sending

#### Message Display
- [ ] User messages have user icon (👤)
- [ ] AI messages have bot icon (🤖)
- [ ] Messages are properly aligned
- [ ] Long messages wrap correctly
- [ ] Timestamps show (if implemented)

### Navigation

#### Sidebar
- [ ] Sidebar visible on all pages
- [ ] Dashboard link works
- [ ] Scan link works
- [ ] History link works
- [ ] Chat link works
- [ ] Active page highlighted

#### Navbar
- [ ] Navbar visible on all pages
- [ ] App name/logo displays
- [ ] User menu accessible
- [ ] Logout option works

### Error Handling

#### Network Errors
- [ ] Shows error message if backend is down
- [ ] Retry button works (where applicable)
- [ ] Doesn't crash the app

#### Authentication Errors
- [ ] 401 errors redirect to login
- [ ] Token expiration handled gracefully
- [ ] Invalid credentials show error message

#### Validation Errors
- [ ] Empty form fields show validation
- [ ] Invalid email format rejected
- [ ] Short passwords rejected
- [ ] File type validation works

### Performance

#### Loading States
- [ ] Spinners show during data fetching
- [ ] Skeleton screens (if implemented)
- [ ] No blank screens during loading

#### Responsiveness
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)

## API Endpoint Testing

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in the app
4. Check API calls:
   - Status codes (200, 201, 401, etc.)
   - Request payloads
   - Response data
   - Headers (Authorization token)

### Using cURL

#### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Dashboard Stats (requires token)
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Scan History
```bash
curl -X GET http://localhost:8000/api/scan/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Chat
```bash
curl -X POST http://localhost:8000/api/chat/ask \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"query":"What is early blight?","use_detailed":false}'
```

## Common Issues & Solutions

### Issue: 401 Unauthorized on Dashboard
**Solution**: Check if token is being sent in Authorization header. Clear localStorage and login again.

### Issue: CORS errors
**Solution**: Verify backend CORS settings allow frontend URL (http://localhost:5173)

### Issue: Image upload fails
**Solution**: Check file size (<10MB) and file type (image/*)

### Issue: Chat not responding
**Solution**: Verify chat service is configured with API keys (Gemini/Cerebras)

### Issue: Empty dashboard stats
**Solution**: Create some scans first, then refresh dashboard

## Test Data

### Sample Test Users
```
Email: test1@example.com
Password: password123

Email: test2@example.com
Password: password123
```

### Sample Test Images
Use plant disease images from:
- `backend/ml/data/structured/test/` (after dataset structuring)
- Download from PlantVillage dataset
- Use your own plant photos

## Success Criteria

All features working:
- ✅ User registration and login
- ✅ Dashboard displays stats correctly
- ✅ Image upload and analysis
- ✅ Scan history with search/filter
- ✅ AI chat assistant
- ✅ Navigation between pages
- ✅ Error handling
- ✅ Responsive design

## Next Steps After Testing

1. Integrate trained ML model (when training completes)
2. Add real AI chat service (Gemini/Cerebras APIs)
3. Implement image storage (Cloudinary/S3)
4. Add rate limiting
5. Set up error tracking (Sentry)
6. Deploy to production
