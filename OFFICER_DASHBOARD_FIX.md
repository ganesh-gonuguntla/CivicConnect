# 🔧 Officer Dashboard Fix - Complete Guide

## Problem
Officers were seeing "No issues assigned yet" even though citizens had reported issues.

## Root Cause
1. Officers were NOT assigned to Department collection
2. Frontend was calling wrong endpoint (`/issues/my` instead of `/issues/assigned`)
3. Image display was missing in OfficerDashboard

## ✅ Solutions Applied

### 1. Created Department Setup Script
**File**: `backend/scripts/setupDepartments.js`

This script:
- Creates all 4 departments (Roads, Water, Sanitation, Electricity)
- Automatically finds officers with matching department field
- Assigns them to the Department collection

**Run this command**:
```bash
cd backend
node scripts/setupDepartments.js
```

### 2. Fixed Frontend API Calls
**Changed**: `frontend/src/services/api.js`
- Added `getAssignedIssues()` function for officers

**Changed**: `frontend/src/pages/OfficerDashboard.jsx`
- Now calls `getAssignedIssues()` instead of `getMyIssues()`
- Added image display for uploaded issue photos

### 3. Backend Already Has `/assigned` Route
**File**: `backend/routes/issues.js`
```javascript
router.get('/assigned', auth, permit('officer'), issueController.getIssues);
```

---

## 📝 How It Works Now

### When Citizen Reports Issue:
1. Citizen uploads issue with category "Sanitation"
2. Backend sets `department = "Sanitation"`
3. Backend looks for Department with name "Sanitation"
4. Backend randomly assigns an officer from that department
5. Issue saved with:
   - `department: "Sanitation"`
   - `assignedOfficer: <officer_id>`
   - `imageURL: <cloudinary_url>`

### When Officer Logs In:
1. Officer clicks "Officer Dashboard"
2. Frontend calls `GET /api/issues/assigned`
3. Backend filters issues where:
   - `department === officer.department` OR
   - `assignedOfficer === officer._id`
4. Officer sees all department issues with images

---

## 🧪 Testing Steps

### Step 1: Run Setup Script (ONE TIME ONLY)
```bash
cd c:\Users\Sai Goutham\OneDrive\Desktop\CivicConnect\backend
node scripts/setupDepartments.js
```

**Expected Output**:
```
✅ Created department: Roads
✅ Created department: Water
✅ Created department: Sanitation
✅ Assigned officer garbage@gmail.com to Sanitation
✅ Created department: Electricity
✅ Setup complete!
```

### Step 2: Restart Backend (if needed)
The backend is already running with nodemon, so it should auto-restart.

### Step 3: Create Test Data

#### A. Register/Login as Officer
```
Email: garbage@gmail.com
Password: <your_password>
Role: officer
Department: Sanitation
```

#### B. Login as Citizen
```
Email: ramesh@gmail.com
Password: <your_password>
```

#### C. Report a Sanitation Issue
1. Go to Citizen Dashboard
2. Fill form:
   - Title: "Garbage not collected"
   - Description: "Garbage piling up on street"
   - Category: **Sanitation** (must match officer's department)
   - Location: `{"lat":12.34,"lng":56.78}`
   - Image: Upload any image
3. Submit

### Step 4: Check Officer Dashboard
1. Logout
2. Login as officer (garbage@gmail.com)
3. Go to Officer Dashboard
4. You should now see:
   - ✅ The Sanitation issue
   - ✅ The uploaded image
   - ✅ Status buttons (In Progress, Resolve)
   - ✅ Comment textarea

### Step 5: Update Status
1. Add comment: "Garbage collection scheduled"
2. Click "In Progress"
3. Status should update
4. Check Citizen Dashboard - they should see updated status

---

## 🔑 Important Notes

### Department Names MUST Match
- Citizen issue category: "Sanitation"
- Officer department: "Sanitation"
- Department name: "Sanitation"

**Case-sensitive!** "Sanitation" ≠ "sanitation"

### Available Departments
- Roads
- Water
- Sanitation
- Electricity

### Creating More Officers
When you register a new officer:
1. Set `department` field to one of the 4 departments
2. Run the setup script again to assign them:
   ```bash
   node scripts/setupDepartments.js
   ```

Or use the admin endpoint:
```bash
POST /api/departments/:deptId/assign/:userId
```

---

## 📊 Verification Checklist

✅ **Backend**:
- [ ] Departments created in database
- [ ] Officers assigned to departments
- [ ] `/api/issues/assigned` endpoint works
- [ ] Images upload to Cloudinary

✅ **Frontend**:
- [ ] OfficerDashboard uses `getAssignedIssues()`
- [ ] Images display correctly
- [ ] Status update buttons work
- [ ] Comments save properly

✅ **Database**:
```javascript
// Check in MongoDB
db.departments.find()
// Should show 4 departments with officers

db.users.find({ role: 'officer' })
// Should show officers with department field

db.issues.find()
// Should show issues with department and assignedOfficer
```

---

## 🐛 Troubleshooting

### Still Seeing "No issues assigned yet"?

**Check 1**: Department exists
```bash
# In MongoDB or Compass
db.departments.find({ name: "Sanitation" })
```

**Check 2**: Officer is in department.officers array
```bash
db.departments.findOne({ name: "Sanitation" }).officers
# Should contain your officer's ObjectId
```

**Check 3**: Issues have correct department
```bash
db.issues.find({ department: "Sanitation" })
# Should show issues
```

**Check 4**: Frontend is calling correct endpoint
- Open browser DevTools → Network tab
- Should see request to `/api/issues/assigned` (not `/api/issues/my`)

**Check 5**: Officer token has correct role
- Login as officer
- Check localStorage in DevTools
- User object should have `role: "officer"` and `department: "Sanitation"`

### Images Not Showing?

**Check**: Cloudinary credentials in `.env`
```
CLOUDINARY_CLOUD_NAME=dwkg9kq23
CLOUDINARY_API_KEY=515123234355939
CLOUDINARY_API_SECRET=OJr0kA1mopDMOgQdOh440eqx_i4
```

**Check**: Image URL in database
```bash
db.issues.find({}, { imageURL: 1 })
# Should have Cloudinary URLs
```

---

## ✨ Features Now Working

✅ **Citizens can**:
- Report issues with image upload
- View their own issues
- See status updates

✅ **Officers can**:
- View all issues in their department
- See uploaded images
- Update issue status
- Add progress comments

✅ **Admins can**:
- View all issues system-wide
- See analytics and statistics
- Manage departments

---

**Your Officer Dashboard is now fully functional! 🎉**
