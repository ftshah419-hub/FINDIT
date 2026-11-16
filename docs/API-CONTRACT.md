# FINDIT API Contract

Base URL prefix: `/api/v1`

Standard Response Formats:
- **Success (HTTP 200/201)**:
  ```json
  {
    "success": true,
    "message": "Operation successful description",
    "data": {}
  }
  ```
- **Error (HTTP 400/401/403/404/409/429/500)**:
  ```json
  {
    "success": false,
    "message": "Clear user-facing error message",
    "errorCode": "SPECIFIC_ERROR_CODE"
  }
  ```

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### 1.1 POST `/auth/register`
* **Access**: Public
* **Purpose**: Register a new user account with `role: "USER"`, `isEmailVerified: false`. Client-supplied roles are ignored.
* **Request Body**:
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "password": "MySecurePassword123!",
    "confirmPassword": "MySecurePassword123!",
    "phone": "+91 98765 43210"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account registered. Please enter the verification code sent to your email.",
    "data": {
      "challengeId": "664b1f2...",
      "email": "rahul@example.com",
      "name": "Rahul Sharma"
    }
  }
  ```
* **Conflict Response (409 Conflict)**:
  If the email is already registered and verified:
  ```json
  {
    "success": false,
    "message": "This email is already registered. Please log in using your existing email and password.",
    "errorCode": "EMAIL_ALREADY_REGISTERED"
  }
  ```

---

### 1.2 POST `/auth/verify-otp`
* **Access**: Public
* **Purpose**: Verify registration email with 6-digit OTP code and set `isEmailVerified: true`.
* **Request Body**:
  ```json
  {
    "challengeId": "664b1f2...",
    "otp": "489201"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully. You can now log in using your email and password.",
    "data": {
      "email": "rahul@example.com"
    }
  }
  ```

---

### 1.3 POST `/auth/resend-otp`
* **Access**: Public (Subject to 60s cooldown and 5 sends/hour limit)
* **Purpose**: Resend email verification OTP.
* **Request Body**:
  ```json
  {
    "email": "rahul@example.com"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "A fresh verification code has been sent to your email.",
    "data": {
      "challengeId": "664b2a3...",
      "email": "rahul@example.com"
    }
  }
  ```

---

### 1.4 POST `/auth/login`
* **Access**: Public
* **Purpose**: Step 1 of Login. Verifies email & password for existing accounts, verifies active status and email verification, and sends 6-digit Login OTP.
* **Request Body**:
  ```json
  {
    "email": "rahul@example.com",
    "password": "MySecurePassword123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login credentials verified. Please enter the security code sent to your email.",
    "data": {
      "challengeId": "664b3c4...",
      "email": "rahul@example.com"
    }
  }
  ```

---

### 1.5 POST `/auth/verify-login-otp`
* **Access**: Public
* **Purpose**: Step 2 of Login. Verifies login OTP, creates a session in `Sessions`, rotates/issues a 7-day HttpOnly refresh token cookie, and returns a 15-minute Access JWT.
* **Request Body**:
  ```json
  {
    "challengeId": "664b3c4...",
    "otp": "839102"
  }
  ```
* **Set-Cookie**:
  `refreshToken=<raw-token>; Path=/api/v1/auth; HttpOnly; SameSite=Lax; Max-Age=604800; [Secure]`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "_id": "664b1f2...",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "role": "USER",
        "phone": "+91 98765 43210",
        "profileImage": null,
        "isEmailVerified": true,
        "isActive": true,
        "createdAt": "2026-11-16T04:20:00.000Z",
        "updatedAt": "2026-11-16T04:20:00.000Z"
      }
    }
  }
  ```

---

### 1.6 POST `/auth/refresh`
* **Access**: Public (Requires `refreshToken` HttpOnly cookie)
* **Purpose**: Silently refresh Access JWT and rotate refresh token. Detects token reuse and revokes compromised sessions.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Access token refreshed successfully.",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "user": { ... }
    }
  }
  ```

---

### 1.7 POST `/auth/logout`
* **Access**: Public / Authenticated (Reads `refreshToken` cookie)
* **Purpose**: Revoke current session and clear `refreshToken` cookie.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully.",
    "data": {}
  }
  ```

---

### 1.8 POST `/auth/logout-all`
* **Access**: Authenticated (`Authorization: Bearer <accessToken>`)
* **Purpose**: Revoke all active sessions belonging to the authenticated user across all devices.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "All device sessions terminated successfully.",
    "data": {}
  }
  ```

---

### 1.9 GET `/auth/me`
* **Access**: Authenticated (`Authorization: Bearer <accessToken>`)
* **Purpose**: Retrieve current authenticated user's fresh database profile and active role.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully.",
    "data": {
      "user": {
        "_id": "664b1f2...",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "role": "USER",
        "phone": "+91 98765 43210",
        "profileImage": null,
        "isEmailVerified": true,
        "isActive": true
      }
    }
  }
  ```

---

### 1.10 POST `/auth/forgot-password`
* **Access**: Public
* **Purpose**: Request a password reset OTP. Anti-enumeration: returns a generic success message.
* **Request Body**:
  ```json
  {
    "email": "rahul@example.com"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "If an account exists with this email, a 6-digit password reset code has been sent.",
    "data": {
      "challengeId": "664b4d5..."
    }
  }
  ```

---

### 1.11 POST `/auth/verify-reset-otp`
* **Access**: Public
* **Purpose**: Verify reset OTP code and receive a single-use 5-minute `resetGrant`.
* **Request Body**:
  ```json
  {
    "challengeId": "664b4d5...",
    "otp": "592019"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Verification code confirmed. You may now set your new password.",
    "data": {
      "userId": "664b1f2...",
      "resetGrant": "3fa85f64d9e9..."
    }
  }
  ```

---

### 1.12 POST `/auth/reset-password`
* **Access**: Public (Requires `resetGrant`)
* **Purpose**: Set new password, revoke all active sessions for this user, and allow logging in with the new password.
* **Request Body**:
  ```json
  {
    "userId": "664b1f2...",
    "resetGrant": "3fa85f64d9e9...",
    "newPassword": "BrandNewPassword123!",
    "confirmPassword": "BrandNewPassword123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password has been reset successfully. Please log in using your new password.",
    "data": {}
  }
  ```

---

## 2. Integration Guide for Admin & User Teammates

### Backend Middleware Usage:
```javascript
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

// Protect any user endpoint
router.get('/items/me', authenticate, itemController.getMyItems);

// Protect admin endpoint (verifies fresh MongoDB Atlas role in real time)
router.get('/admin/dashboard', authenticate, authorize('ADMIN'), adminController.getDashboard);
```

### Frontend AuthContext Usage:
```jsx
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  return (
    <div>
      {isAuthenticated && <span>Welcome, {user.name} ({user.role})</span>}
      {isAdmin && <a href="/admin">Admin Console</a>}
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```
