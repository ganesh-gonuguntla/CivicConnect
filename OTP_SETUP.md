# OTP Email Verification Setup Guide

## Overview
The registration process now requires email verification via OTP (One-Time Password). Users must verify their email with a 6-digit OTP sent to their registered email address before they can log in.

## Installation

### 1. Install Nodemailer Package
Run this in the backend directory:
```bash
npm install nodemailer
```

### 2. Update Environment Variables
Add these to `backend/.env`:
```env
# Email Configuration for OTP
EMAIL_USER=civicconnect@gmail.com
EMAIL_PASS=your_app_password_here
OTP_EXPIRY=10
```

### 3. Gmail App Password Setup
Since you're using Gmail:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already done)
3. Go to **App passwords** (appears after 2FA is enabled)
4. Select "Mail" and "Windows Computer" (or appropriate options)
5. Google will generate a 16-character app password
6. Copy this password and paste it as `EMAIL_PASS` in your `.env` file

**Note:** Regular Gmail passwords won't work. You MUST use the app password.

## Backend Changes

### Files Modified/Created:
- ✅ `config/email.js` - New file for email sending logic
- ✅ `models/User.js` - Added `emailVerified`, `otp`, `otpExpiry` fields
- ✅ `controllers/authController.js` - Updated register function + added verifyOTP and resendOTP functions
- ✅ `routes/auth.js` - Added POST `/api/auth/verify-otp` and POST `/api/auth/resend-otp` endpoints

### New API Endpoints:

#### 1. Register (Modified)
**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen",
  "department": null
}
```
**Response:**
```json
{
  "msg": "Registration successful! Please check your email for OTP.",
  "email": "john@example.com",
  "userId": "user_id",
  "requiresOTPVerification": true
}
```

#### 2. Verify OTP (New)
**POST** `/api/auth/verify-otp`
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
**Response (Success):**
```json
{
  "msg": "Email verified successfully!",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### 3. Resend OTP (New)
**POST** `/api/auth/resend-otp`
```json
{
  "email": "john@example.com"
}
```
**Response:**
```json
{
  "msg": "OTP resent successfully. Check your email."
}
```

## Frontend Changes

### Files Modified:
- ✅ `pages/Register.jsx` - Two-step registration (form + OTP verification)
- ✅ `context/AuthContext.jsx` - Updated register function to return success flag

### Registration Flow:
1. User fills out registration form
2. API sends OTP to their email
3. User enters OTP on verification page
4. Upon successful verification, user gets JWT token
5. User is automatically logged in and redirected to dashboard

## Testing the Feature

### 1. Start Backend
```bash
cd backend
npm install nodemailer  # If not done already
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Registration
1. Go to `/register`
2. Fill in the form and click "Create Account"
3. Check your email for the OTP
4. Enter the 6-digit OTP on the verification page
5. Click "Verify OTP"
6. You should be logged in automatically

### 4. Test Resend OTP
- Click "Resend OTP" if you didn't receive it

### 5. Test Login
- Try logging in with an unverified email (should get error)
- Try logging in after OTP verification (should work)

## OTP Configuration

- **OTP Length:** 6 digits
- **OTP Expiry:** 10 minutes (configurable via `OTP_EXPIRY` in .env)
- **Email:** Sent from `civicconnect@gmail.com`

## Troubleshooting

### Email Not Sending
1. Check that Gmail app password is correct (not your regular password)
2. Enable "Less secure app access" if 2FA is not configured:
   - Go to [Google Account](https://myaccount.google.com/)
   - Search for "Less secure"
   - Enable it
3. Check backend logs for error messages

### OTP Expired
- User must click "Resend OTP" to get a new OTP
- New OTP resets the expiry timer

### User Cannot Login
- Check if `emailVerified` is `true` in database
- If false, user must verify email first

## Security Features

✅ 6-digit OTP (999,999 possible combinations)
✅ OTP expires after 10 minutes
✅ OTP is hashed... actually, for simplicity it's stored as plaintext (consider hashing in production)
✅ Users can resend OTP
✅ Email verification required before login

## Future Enhancements

- Hash OTP before storing in database
- Implement OTP rate limiting (max 3 resend attempts per hour)
- Add email template customization
- Support multiple email providers (SendGrid, AWS SES, etc.)
- Add SMS OTP as alternative verification method
