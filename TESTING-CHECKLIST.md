# System Testing Checklist

**Date Started:** 2026-02-02
**Version:** 1.1.0

## 🚀 Pre-Testing Setup

### Step 1: Restart API Server (CRITICAL)
```bash
# Stop current API server (Ctrl+C)
cd apps\api
npm run start:dev

# Wait for: "Nest application successfully started"
```

### Step 2: Verify Services Running
- [ ] API: http://localhost:3000 ✅
- [ ] Frontend: http://192.168.71.21:5174 ✅
- [ ] PostgreSQL: Port 5432 ✅
- [ ] Redis: Port 6379 ✅

### Step 3: Open Testing Tools
- [ ] Browser: http://192.168.71.21:5174
- [ ] Browser Console: Press F12
- [ ] Keep terminal windows visible

---

## Phase 1: Authentication ⭐ START HERE

### Test 1.1 - Admin Login
**Steps:**
1. Open http://192.168.71.21:5174
2. Click "Login"
3. Enter: `admin@luna.top` / `DevTest2026!@#$`
4. Click "Sign In"

**Expected Result:**
- ✅ Redirects to dashboard
- ✅ User name shows in header
- ✅ Menu items visible

**Check Browser Console:**
- ❌ NO CORS errors
- ❌ NO 401 Unauthorized errors

**Result:** [ ] PASS / [ ] FAIL

**If FAIL, note error:**
```
Error message:
```

---

### Test 1.2 - Service Requests Page
**Steps:**
1. While logged in as admin
2. Click "Service Requests" in left menu
3. Wait for page to load

**Expected Result:**
- ✅ Page displays content
- ✅ Service request list visible
- ✅ Filter buttons work
- ✅ Search box present

**Result:** [ ] PASS / [ ] FAIL

**If page is blank, check console for errors**

---

## Quick Test Results

| Test | Status | Notes |
|------|--------|-------|
| Admin Login | [ ] ✅ [ ] ❌ | |
| Service Requests Page | [ ] ✅ [ ] ❌ | |
| RUSHING Experts | [ ] ✅ [ ] ❌ | |
| Expert Matching | [ ] ✅ [ ] ❌ | |
| WebSocket | [ ] ✅ [ ] ❌ | |

---

## Bug Report

### Bug #1:
**What:** 
**Where:** 
**Error:** 
**Screenshots/Logs:**

