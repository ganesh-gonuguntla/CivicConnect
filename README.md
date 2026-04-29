# CivicConnect - Civic Issue Reporting & Resolution Platform

A comprehensive full-stack web application that empowers citizens to report community issues, enables government officers to address them efficiently, and provides administrators with management tools. Built with role-based authentication, real-time messaging, and gamification features.

---

## 🎯 Project Overview

**CivicConnect** bridges the gap between citizens and government by providing a centralized platform for:
- **Citizens**: Report civic issues (potholes, water supply, sanitation) with photos/location
- **Officers**: Receive, review, and update issue resolution status
- **Admins**: Manage officers, departments, and system-wide operations
- **All Users**: Communicate in real-time via socket.io, track progress, and earn rewards

---

## 🚀 Features

### Core Features
✅ **Role-Based Access Control** (Citizen, Officer, Admin)
✅ **Multi-Factor Authentication** (OTP via Email + Google OAuth)
✅ **Issue Lifecycle Management** (Report → Assign → Resolve)
✅ **Real-Time Chat** (Socket.io powered messaging within issues)
✅ **Department Management** (Officers assigned to specific departments)
✅ **Admin Dashboard** (Officer verification, department management)
✅ **Gamification** (Coin rewards, leaderboard system)
✅ **Email Notifications** (OTP, issue updates, alerts)
✅ **Image Upload** (Cloudinary integration)
✅ **Geolocation** (Map-based issue reporting with Leaflet)

### Technical Features
✅ Secure JWT-based authentication
✅ Password hashing with bcryptjs
✅ Email verification workflow
✅ WebSocket real-time communication
✅ MongoDB database with Mongoose ODM
✅ RESTful API design
✅ CORS configuration for frontend-backend integration
✅ Environment-based configuration

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose v9.1.5
- **Authentication**: JWT, bcryptjs, Google OAuth
- **Real-Time**: Socket.io v4.8.3
- **File Upload**: Cloudinary + Multer
- **Email**: Nodemailer v8.0.6
- **Development**: Nodemon

### Frontend
- **Framework**: React v19.2.0
- **Build Tool**: Vite v7.2.4
- **Styling**: Tailwind CSS v4.1.18
- **HTTP Client**: Axios
- **Real-Time**: Socket.io-client
- **Routing**: React Router v7.13.0
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **OAuth**: @react-oauth/google
- **UI Components**: React-Dropzone, React-Webcam

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** v16+ and npm
- **MongoDB** (local or Atlas URI)
- **Git**
- **Cloudinary Account** (for image uploads)
- **Gmail Account** (for OTP emails - requires App Password)
- **Google OAuth Credentials** (from Google Cloud Console)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd CivicConnect
```

### Step 2: Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Create `.env` File
Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civicconnect?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here_generate_random_string

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_not_regular_password

# OTP Configuration
OTP_EXPIRY=10

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Setup Database Collections
```bash
# Setup departments collection
npm run setup:departments

# Run migrations if needed
npm run migrate:assign-departments
npm run migrate:assign-officers
```

#### Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

---

### Step 3: Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Create `.env.local` File
Create a `.env.local` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### Start Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

#### Build for Production
```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables Guide

### Backend `.env` Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | Any random 32+ char string |
| `EMAIL_USER` | Gmail address for sending OTP | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password (NOT regular password) | 16-char app password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Cloud Console |
| `OTP_EXPIRY` | OTP validity duration in minutes | `10` |

### Frontend `.env.local` Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Same as backend |

---

## 📚 Project Structure

```
CivicConnect/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── email.js           # Email configuration & OTP
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── controllers/
│   │   ├── authController.js  # Auth, registration, OTP, OAuth
│   │   ├── issueController.js # Issue CRUD operations
│   │   └── chatController.js  # Chat/message endpoints
│   ├── models/
│   │   ├── User.js            # User schema (citizen/officer/admin)
│   │   ├── Issue.js           # Issue schema
│   │   ├── Message.js         # Chat messages
│   │   └── Department.js      # Department schema
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── issues.js          # Issue endpoints
│   │   ├── chat.js            # Chat endpoints
│   │   ├── departments.js     # Department endpoints
│   │   └── userRoutes.js      # User endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── scripts/
│   │   ├── setupDepartments.js
│   │   └── migrate_*.js
│   ├── server.js              # Express app & Socket.io setup
│   ├── package.json
│   └── .env                   # Environment variables (KEEP SECRET!)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ReportIssueForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ... other components
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios instance & API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.local             # Frontend env variables
│
├── README.md                  # This file
└── .gitignore                # Git ignore configuration
```

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user (sends OTP) | ❌ |
| POST | `/verify-otp` | Verify OTP & complete registration | ❌ |
| POST | `/resend-otp` | Resend OTP to email | ❌ |
| POST | `/login` | Login with email/password | ❌ |
| POST | `/google` | Login/register with Google OAuth | ❌ |
| GET | `/me` | Get current user profile | ✅ |
| PUT | `/update` | Update user name/password | ✅ |
| GET | `/notifications` | Get user notifications | ✅ |
| PUT | `/notifications/read` | Mark notifications as read | ✅ |
| GET | `/leaderboard` | Get top 10 users & current rank | ✅ |
| GET | `/officers/pending` | Get pending officers (admin) | ✅ |
| PUT | `/officers/:id/status` | Approve/reject officer (admin) | ✅ |

### Issues (`/api/issues`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get issues (filter by status/department) | ✅ |
| GET | `/:id` | Get issue details | ✅ |
| POST | `/` | Create new issue (citizen) | ✅ |
| PUT | `/:id` | Update issue | ✅ |
| DELETE | `/:id` | Delete issue | ✅ |
| GET | `/my-issues` | Get user's reported issues | ✅ |
| PUT | `/:id/assign` | Assign issue to officer | ✅ |
| PUT | `/:id/status` | Update issue status | ✅ |

### Chat/Messages (`/api/chat`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/messages/:issueId` | Get messages for an issue | ✅ |
| POST | `/messages` | Post message to issue | ✅ |

### Departments (`/api/departments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all departments | ✅ |
| GET | `/:id` | Get department details | ✅ |
| POST | `/` | Create department (admin) | ✅ |

---

## 👥 User Roles & Features

### Citizen
- Register and login
- Report issues with photos and location
- Track reported issues
- Chat with assigned officers
- View leaderboard and earn coins
- Receive notifications on issue updates

### Officer
- Register (requires admin approval)
- View all issues in their department
- Assign themselves to issues
- Update issue status (in-progress, resolved)
- Chat with citizens
- Receive notifications
- View dashboard with issue statistics

### Admin
- Manage user accounts
- Approve/reject officer registrations
- Manage departments
- View system-wide dashboard
- Monitor all issues and activity
- Generate reports

---

## 🚀 Usage Guide

### For Citizens
1. **Sign Up**: Click "Register" → Choose "Citizen" role
2. **Verify Email**: Enter OTP sent to your email
3. **Report Issue**: Click "Report Issue" → Add title, description, photo, location
4. **Track Progress**: View "My Issues" to track status
5. **Communicate**: Chat with assigned officer via the issue page

### For Officers
1. **Sign Up**: Click "Register" → Choose "Officer" role → Select department
2. **Wait for Approval**: Admin must verify your account
3. **View Dashboard**: See pending issues in your department
4. **Assign Yourself**: Click issue → "Assign to Me"
5. **Update Status**: Change status to "In Progress" → "Resolved"
6. **Communicate**: Chat with citizens about the issue

### For Admins
1. **Login**: Use admin credentials (must be pre-configured in DB)
2. **Officer Management**: Approve pending officer registrations
3. **Department Management**: Create/manage departments
4. **Dashboard**: Monitor system activity and issue statistics

---

## 🔧 Common Setup Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Ensure MongoDB is running (`mongod` command)
- Check MongoDB URI in `.env` is correct
- For Atlas, ensure IP is whitelisted in firewall rules

### Email Not Sending
```
Error: Invalid login: user or password incorrect
```
**Solution**:
- Use Gmail App Password, NOT regular password
- Enable "Less secure app access" or use App Passwords (2FA)
- Generate new App Password from Google Account settings

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Ensure frontend URL matches `origin` in `server.js`
- Check frontend `.env.local` has correct API URL
- Verify backend is running on the correct port

### Cloudinary Upload Error
**Solution**:
- Verify Cloudinary credentials in `.env`
- Check folder settings in Cloudinary dashboard
- Ensure image size is within limits

### Socket.io Connection Failed
**Solution**:
- Verify JWT token is being sent in socket handshake
- Check WebSocket is not blocked by firewall
- Ensure both frontend and backend have matching socket.io versions

---

## 📝 Environment Variables Checklist

Before running the project, ensure you have:

- [ ] MongoDB URI (local or Atlas)
- [ ] Generated JWT Secret (random string)
- [ ] Gmail credentials with App Password
- [ ] Cloudinary account credentials
- [ ] Google OAuth Client ID & Secret
- [ ] Both `.env` and `.env.local` files created
- [ ] All API keys are NOT committed to Git

---

## 🧪 Testing

### Test Email Configuration
```bash
cd backend
node test-email.js
```

### Test User Registration Flow
1. Go to `http://localhost:5173/register`
2. Fill in details (use test email)
3. Verify you receive OTP email
4. Enter OTP to complete registration

### Test Officer Approval Flow
1. Register as officer
2. Login as admin
3. Go to Admin Dashboard → Approve officer
4. Officer can now access dashboard

---

## 📊 Database Schema Overview

### User
```javascript
{
  name, email, password (hashed),
  role: 'citizen' | 'officer' | 'admin',
  department: (officers only),
  status: 'approved' | 'pending' | 'rejected',
  coins: 0,
  lastLogin, createdAt,
  notifications: [{ msg, read, createdAt }]
}
```

### Issue
```javascript
{
  title, description, status: 'open' | 'assigned' | 'in-progress' | 'resolved',
  createdBy: User._id,
  assignedOfficer: User._id,
  location: { type, coordinates: [long, lat] },
  images: [urls],
  department,
  priority: 'low' | 'medium' | 'high',
  createdAt, updatedAt
}
```

### Message
```javascript
{
  issueId: Issue._id,
  sender: User._id,
  type: 'text' | 'image',
  text, mediaURL,
  deliveredAt, readAt
}
```

---

## 🔒 Security Best Practices

✅ **Implemented**:
- Password hashing with bcryptjs
- JWT token-based authentication
- CORS configuration
- Environment variable protection
- Socket.io JWT verification

⚠️ **To Implement**:
- HTTPS in production
- Rate limiting on auth endpoints
- Input validation and sanitization
- SQL injection prevention (already safe with Mongoose)
- CSRF tokens
- Regular security audits

---

## 📈 Deployment

### Deploy to Heroku/Railway
1. Create `.env` in root with production variables
2. Update MongoDB URI to use Atlas
3. Set `NODE_ENV=production`
4. Deploy backend and frontend separately

### Deploy Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist folder
```

### Deploy Backend (Heroku/Railway)
```bash
cd backend
git push heroku main
```

---

## 📞 Support & Contribution

For issues, questions, or contributions:
1. Check existing GitHub issues
2. Create detailed bug reports with steps to reproduce
3. Follow the project's coding standards
4. Submit pull requests with clear descriptions

---

## 📄 License

This project is licensed under the ISC License.

---

## 🎉 Getting Started Quick Summary

```bash
# Terminal 1 - Backend
cd backend
npm install
# Create .env file with all required variables
npm run dev

# Terminal 2 - Frontend (after backend is running)
cd frontend
npm install
# Create .env.local file
npm run dev

# Open browser to http://localhost:5173
```

**That's it!** You're now ready to explore CivicConnect. 🚀

---

**Last Updated**: April 29, 2026
**Version**: 1.0.0
