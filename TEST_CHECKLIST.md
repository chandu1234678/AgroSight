# AgroSight Testing Checklist

Quick visual checklist for testing all features. Check off items as you test.

## Pre-Testing Setup

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Browser DevTools open (F12) for debugging
- [ ] Network tab visible to monitor API calls

## 1. Authentication Tests

### Registration
- [ ] Navigate to http://localhost:5173/signup
- [ ] Enter email: `test@agrosight.com`
- [ ] Enter password: `password123`
- [ ] Enter name: `Test User`
- [ ] Click "Sign Up"
- [ ] Redirects to login page
- [ ] No errors in console

### Login
- [ ] Navigate to http://localhost:5173/login
- [ ] Enter registered email
- [ ] Enter password
- [ ] Click "Login"
- [ ] Redirects to dashboard
- [ ] Token saved in localStorage
- [ ] No 401 errors

### Token Verification
- [ ] Open DevTools → Application → Local Storage
- [ ] Verify `token` exists
- [ ] Token is a long string (JWT format)

## 2. Dashboard Tests

### Initial Load (New User)
- [ ] Dashboard loads without errors
- [ ] Shows "Total Scans: 0"
- [ ] Shows "Most Common Disease: N/A"
- [ ] Shows "Recent Scans: 0"
- [ ] Empty state message visible
- [ ] "Start First Scan" button visible

### UI Elements
- [ ] Navbar displays at top
- [ ] Sidebar displays on left
- [ ] User name/email visible
- [ ] All navigation links work
- [ ] Quick Scan button works

### Actions
- [ ] Click "New Scan" → navigates to /scan
- [ ] Click "View History" → navigates to /history
- [ ] Click "AI Assistant" → navigates to /chat
- [ ] Back button returns to dashboard

## 3. Scan Tests

### Image Upload
- [ ] Upload area displays
- [ ] Click to select file
- [ ] Select any image file
- [ ] Preview displays correctly
- [ ] Image not distorted
- [ ] "Change Image" button works

### Analysis
- [ ] "Analyze Plant" button enabled
- [ ] Click "Analyze Plant"
- [ ] Loading indicator shows
- [ ] No errors during analysis
- [ ] Results display after ~1 second

### Results Display
- [ ] Disease name shows (e.g., "Tomato Late Blight")
- [ ] Confidence shows (e.g., "92.5%")
- [ ] Severity level shows
- [ ] Organic treatment displays
- [ ] Chemical treatment displays
- [ ] Prevention tips list displays
- [ ] All text readable and formatted

### Continue Chat
- [ ] "Continue Chat with AI Assistant" button visible
- [ ] Click button
- [ ] Redirects to /chat
- [ ] Chat shows disease context

### Multiple Scans
- [ ] Click "New Scan"
- [ ] Upload different image
- [ ] Analyze again
- [ ] Different disease detected (random)
- [ ] Results display correctly

## 4. History Tests

### Navigation
- [ ] Click "History" in sidebar
- [ ] Page loads without errors
- [ ] Shows all previous scans

### Scan Cards
- [ ] Each scan shows disease name
- [ ] Confidence badge displays
- [ ] Badge color matches confidence:
  - [ ] Green for >80%
  - [ ] Orange for 60-80%
  - [ ] Red for <60%
- [ ] Date displays correctly
- [ ] Cards in grid layout

### Search
- [ ] Type disease name in search
- [ ] Results filter immediately
- [ ] Clear search shows all again
- [ ] Search is case-insensitive

### Filters
- [ ] Click "All" → shows all scans
- [ ] Click "High Confidence" → shows >80%
- [ ] Click "Medium" → shows 60-80%
- [ ] Click "Low" → shows <60%
- [ ] Active filter highlighted

### Empty State
- [ ] Clear all filters
- [ ] Search for non-existent disease
- [ ] Empty state message shows
- [ ] "Start Scanning" button visible

## 5. Chat Tests

### Initial State
- [ ] Navigate to /chat
- [ ] Welcome message displays
- [ ] Input field enabled
- [ ] Send button enabled

### Send Message
- [ ] Type: "What is late blight?"
- [ ] Press Enter OR click Send
- [ ] User message appears (right side)
- [ ] User icon (👤) shows
- [ ] Loading indicator shows
- [ ] AI response appears (left side)
- [ ] Bot icon (🤖) shows
- [ ] Response is helpful

### Multiple Messages
- [ ] Type: "How do I treat it?"
- [ ] Send message
- [ ] Response appears
- [ ] Type: "Prevention tips?"
- [ ] Send message
- [ ] Response appears
- [ ] All messages visible
- [ ] Scroll works

### Context from Scan
- [ ] Go to /scan
- [ ] Upload and analyze image
- [ ] Click "Continue Chat"
- [ ] Chat shows disease context
- [ ] Can ask follow-up questions

## 6. Navigation Tests

### Sidebar
- [ ] Dashboard link works
- [ ] Scan link works
- [ ] History link works
- [ ] Chat link works
- [ ] Active page highlighted
- [ ] Icons display correctly

### Navbar
- [ ] App name/logo visible
- [ ] User menu accessible
- [ ] Logout option visible

### Logout
- [ ] Click logout
- [ ] Redirects to login
- [ ] Token removed from localStorage
- [ ] Can't access protected routes
- [ ] Login again works

## 7. Error Handling Tests

### Network Errors
- [ ] Stop backend server
- [ ] Try to load dashboard
- [ ] Error message displays
- [ ] Retry button works (if available)
- [ ] Start backend
- [ ] Retry works

### Invalid Login
- [ ] Try login with wrong password
- [ ] Error message displays
- [ ] Form doesn't crash
- [ ] Can try again

### Invalid File Upload
- [ ] Try uploading non-image file
- [ ] Error message displays
- [ ] Can select different file

## 8. Responsive Design Tests

### Desktop (1920x1080)
- [ ] Layout looks good
- [ ] All elements visible
- [ ] No horizontal scroll
- [ ] Images not distorted

### Laptop (1366x768)
- [ ] Layout adjusts
- [ ] Sidebar visible
- [ ] Content readable
- [ ] No overlap

### Tablet (768x1024)
- [ ] Layout responsive
- [ ] Touch targets adequate
- [ ] Text readable
- [ ] Images scale

### Mobile (375x667)
- [ ] Layout stacks vertically
- [ ] Sidebar collapses (if implemented)
- [ ] All features accessible
- [ ] Text readable

## 9. Performance Tests

### Load Times
- [ ] Dashboard loads <2 seconds
- [ ] Scan page loads <1 second
- [ ] History loads <2 seconds
- [ ] Chat loads <1 second

### API Response
- [ ] Login response <500ms
- [ ] Dashboard stats <500ms
- [ ] Scan upload <2 seconds
- [ ] Chat response <1 second

### UI Responsiveness
- [ ] Buttons respond immediately
- [ ] No lag when typing
- [ ] Smooth scrolling
- [ ] No freezing

## 10. Data Persistence Tests

### After Refresh
- [ ] Refresh dashboard
- [ ] Still logged in
- [ ] Stats still show
- [ ] Refresh history
- [ ] Scans still visible
- [ ] Refresh chat
- [ ] Messages still visible (if implemented)

### After Logout/Login
- [ ] Logout
- [ ] Login again
- [ ] Previous scans visible
- [ ] Stats updated
- [ ] History intact

## 11. API Endpoint Tests

### Using Browser Network Tab
- [ ] Open Network tab
- [ ] Perform login
- [ ] Check POST /api/auth/login
- [ ] Status: 200 OK
- [ ] Response has access_token
- [ ] Load dashboard
- [ ] Check GET /api/dashboard/stats
- [ ] Status: 200 OK
- [ ] Authorization header present
- [ ] Upload scan
- [ ] Check POST /api/scan/upload
- [ ] Status: 200 OK
- [ ] Response has disease data

## 12. Console Tests

### No Errors
- [ ] Open Console tab
- [ ] Navigate all pages
- [ ] No red errors
- [ ] No 404s
- [ ] No CORS errors
- [ ] Only expected warnings (if any)

## Summary

### Total Tests: ~150
### Passed: _____ / 150
### Failed: _____ / 150
### Skipped: _____ / 150

## Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
4. _______________________________________________
5. _______________________________________________

## Notes

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

## Sign-Off

Tested by: _____________________
Date: _____________________
Time: _____________________
Status: ☐ Pass  ☐ Fail  ☐ Partial

## Next Steps

- [ ] Fix any issues found
- [ ] Retest failed items
- [ ] Document any bugs
- [ ] Update code as needed
- [ ] Prepare for ML model integration
