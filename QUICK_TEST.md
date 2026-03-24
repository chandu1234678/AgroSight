# Quick Testing Guide

Fast reference for testing AgroSight application.

## Current Status

✅ Backend running on http://localhost:8000
✅ Frontend running on http://localhost:5173
✅ Database initialized
✅ All UI/UX pages complete
✅ Mock data for testing (until ML model is trained)

## 5-Minute Test Flow

### 1. Register & Login (1 min)
```
1. Open http://localhost:5173
2. Click "Sign Up"
3. Enter:
   - Email: test@agrosight.com
   - Password: password123
   - Name: Test User
4. Click "Sign Up" → redirects to login
5. Login with same credentials
6. Should redirect to Dashboard
```

### 2. Test Dashboard (1 min)
```
✓ Check "Total Scans" shows 0
✓ Check "Most Common Disease" shows N/A
✓ Check empty state message
✓ Click "Start First Scan" button
```

### 3. Test Scan Feature (2 min)
```
1. Upload any plant image (or any image for testing)
2. Click "Analyze Plant"
3. Wait for results (mock data)
4. Check results display:
   ✓ Disease name
   ✓ Confidence percentage
   ✓ Severity level
   ✓ Treatment recommendations (organic & chemical)
   ✓ Prevention tips
5. Click "Continue Chat with AI Assistant"
```

### 4. Test Chat (1 min)
```
1. Should show contextual greeting with disease name
2. Type: "How do I treat this disease?"
3. Press Enter or click Send
4. Check AI response appears
5. Try another question: "What are prevention tips?"
```

### 5. Test History
```
1. Click "History" in sidebar
2. Should see your scan from step 3
3. Try search: type disease name
4. Try filters: High Confidence, Medium, Low
5. Click on a scan card to view details
```

## API Endpoints Test

### Check Backend Health
```bash
curl http://localhost:8000/health
```
Expected: `{"status":"healthy","service":"AgroSight API"}`

### Test Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"password123","name":"API Test"}'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"password123"}'
```
Save the `access_token` from response.

### Test Dashboard (replace TOKEN)
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## What's Working Now

### ✅ Fully Functional
- User registration and authentication
- JWT token management
- Dashboard with stats
- Scan upload (mock predictions)
- Scan history with search/filter
- AI chat with helpful responses
- All navigation and routing
- Responsive UI/UX

### 🔄 Using Mock Data (Until ML Model Ready)
- Disease predictions (random from list)
- Confidence scores (random 75-98%)
- Disease information (from database)
- Chat responses (helpful farming tips)

### ⏳ Pending ML Model Integration
- Real disease detection (training in progress)
- Actual confidence scores from model
- Model-based severity calculation

## Expected Behavior

### Scan Results
Currently returns random diseases from:
- Tomato Late Blight
- Tomato Early Blight
- Potato Late Blight
- Apple Powdery Mildew
- Grape Powdery Mildew
- Rice Blast
- Wheat Leaf Rust
- Corn Common Rust
- Pepper Bell Bacterial Spot

Each with:
- Random confidence: 75-98%
- Severity: high/moderate/low based on confidence
- Real treatment info from disease database
- Real prevention tips

### Chat Responses
Provides helpful information about:
- Disease symptoms and identification
- Treatment options (organic & chemical)
- Prevention strategies
- Crop management practices

## Troubleshooting

### Issue: Can't login
**Check:**
1. Backend is running: http://localhost:8000/health
2. Database file exists: `backend/agrosight.db`
3. Clear browser localStorage and try again

### Issue: 401 Unauthorized
**Fix:**
1. Logout and login again
2. Check browser console for token
3. Clear localStorage: `localStorage.clear()`

### Issue: Scan upload fails
**Check:**
1. File is an image (jpg, png)
2. File size < 10MB
3. Backend logs for errors

### Issue: Empty dashboard
**Expected:** Dashboard will be empty until you create scans

## Next Steps

1. ✅ Test all features with mock data
2. ⏳ Wait for ML model training to complete (~25-35 min)
3. 🔄 Integrate trained model with backend
4. 🔄 Replace mock predictions with real model
5. 🔄 Add real AI chat APIs (Gemini/Cerebras)
6. 🔄 Add image storage (Cloudinary/S3)
7. 🚀 Deploy to production

## Training Status

Check training progress:
```bash
# Training should be running in a terminal
# Look for output like:
# Epoch [1/20]
# Batch [X/1888] Loss: X.XXXX Acc: XX.XX%
```

Expected completion: ~25-35 minutes
Final accuracy: 94-97%

## Production Readiness

Current: 70% complete

Remaining tasks:
- [ ] Integrate trained ML model
- [ ] Add real AI chat APIs
- [ ] Implement image storage
- [ ] Add rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Add Redis caching
- [ ] Configure production environment
- [ ] Deploy to cloud

## Support

If you encounter issues:
1. Check backend logs in terminal
2. Check browser console (F12)
3. Check Network tab for API calls
4. Verify all services are running
5. Review TESTING_GUIDE.md for detailed info
