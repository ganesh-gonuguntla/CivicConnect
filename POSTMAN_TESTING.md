# 🧪 Postman Testing Guide for CivicConnect API

## Server Info
- **Base URL**: `http://localhost:5000`
- **Current Status**: Server should be running with nodemon

---

## 📌 Available Endpoints

### 1. **Test Endpoint** (Check if server is responding)
- **Method**: `GET`
- **URL**: `http://localhost:5000/`
- **Expected Response**:
```json
"CivicConnect API Running..."
```

---

### 2. **Register User**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen"
}
```
- **Expected Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

---

### 3. **Login User**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Expected Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

---

### 4. **Create Issue**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/issues`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "title": "Broken Street Light",
  "description": "The street light on Main Street is not working",
  "category": "Roads",
  "imageUrl": "https://example.com/image.jpg",
  "location": {
    "lat": 12.9716,
    "lng": 77.5946
  }
}
```
- **Expected Response** (201):
```json
{
  "message": "Issue submitted successfully",
  "issue": {
    "_id": "...",
    "title": "Broken Street Light",
    "description": "The street light on Main Street is not working",
    "category": "Roads",
    "imageUrl": "https://example.com/image.jpg",
    "location": {
      "lat": 12.9716,
      "lng": 77.5946
    },
    "status": "Pending",
    "createdBy": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 5. **Get All Issues**
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/issues`
- **Expected Response** (200):
```json
[
  {
    "_id": "...",
    "title": "Broken Street Light",
    "description": "The street light on Main Street is not working",
    "category": "Roads",
    "status": "Pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

## 🔍 Troubleshooting

### If you're not getting any response:
1. ✅ Check if server is running (should see `🚀 Server running on port 5000` in terminal)
2. ✅ Check if MongoDB is connected (should see `MongoDB Connected: localhost`)
3. ✅ Make sure you're using `http://` not `https://`
4. ✅ Check that Content-Type header is set to `application/json`
5. ✅ Verify the request body is set to "raw" and "JSON" format in Postman

### Common Errors:
- **"Cannot POST /api/issues"** → Issue routes weren't registered (FIXED NOW!)
- **No response** → Server might not be running or wrong URL
- **500 Error** → Check server logs for detailed error message
- **400 Error** → Missing required fields in request body

---

## 🎯 Quick Test Sequence

1. **Test basic connection**: `GET http://localhost:5000/`
2. **Register a user**: `POST http://localhost:5000/api/auth/register`
3. **Login with that user**: `POST http://localhost:5000/api/auth/login`
4. **Create an issue**: `POST http://localhost:5000/api/issues`
5. **Get all issues**: `GET http://localhost:5000/api/issues`

---

## 📝 Notes
- The `/api/issues` endpoints were missing before - they're now properly registered!
- MongoDB must be running locally on port 27017
- Check the terminal logs to see incoming requests and any errors
