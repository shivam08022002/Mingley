# Mingley — Backend REST API Specification

**Version:** 1.0.0
**Date:** April 23, 2026
**Base URL:** `https://api.mingley.app/v1`
**Architecture:** RESTful
**Format:** JSON
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [General Information](#1-general-information)
2. [Authentication APIs](#2-authentication-apis)
3. [User Profile APIs](#3-user-profile-apis)
4. [Discovery / Match APIs](#4-discovery--match-apis)
5. [Chat / Message APIs](#5-chat--message-apis)
6. [Calling System APIs](#6-calling-system-apis)
7. [Wallet / Coin System APIs](#7-wallet--coin-system-apis)
8. [Gift System APIs](#8-gift-system-apis)
9. [Coin Transfer APIs](#9-coin-transfer-apis)
10. [Cashout System APIs (Female Users)](#10-cashout-system-apis-female-users)
11. [Premium Subscription APIs](#11-premium-subscription-apis)
12. [Discovery Filter APIs](#12-discovery-filter-apis)
13. [Notification APIs](#13-notification-apis)
14. [Report / Block User APIs](#14-report--block-user-apis)
15. [Admin APIs](#15-admin-apis)
16. [Appendix: Error Codes](#16-appendix-error-codes)
17. [Appendix: Coin Economy](#17-appendix-coin-economy)
18. [Appendix: WebSocket Events](#18-appendix-websocket-events)

---

## 1. General Information

### 1.1 Authentication Headers

All authenticated endpoints require:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 1.2 Standard Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### 1.3 Standard Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ ... ]
  }
}
```

### 1.4 Pagination Format

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 1.5 User Roles

| Role | Description |
|------|-------------|
| `male` | Male user — pays coins for messaging, calls, gifts |
| `female` | Female user — gets 3 free messages per match, can cashout coins |
| `premium` | Premium subscriber — unlocks advanced filters and features |
| `admin` | Platform admin — manages users, reports, subscriptions |

### 1.6 HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| `200` | OK — Successful request |
| `201` | Created — Resource successfully created |
| `204` | No Content — Successful deletion |
| `400` | Bad Request — Invalid input |
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — Insufficient permissions |
| `404` | Not Found — Resource doesn't exist |
| `409` | Conflict — Duplicate resource |
| `422` | Unprocessable Entity — Validation failed |
| `429` | Too Many Requests — Rate limit exceeded |
| `500` | Internal Server Error |

---

## 2. Authentication APIs

### 2.1 Register

**API Name:** Register User
**Method:** `POST`
**Endpoint:** `/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+911234567890",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "fullName": "John Doe",
  "gender": "male",
  "dateOfBirth": "1998-05-15",
  "authMethod": "email"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Conditional | Required if `authMethod` = `email` |
| `phone` | string | Conditional | Required if `authMethod` = `phone` |
| `password` | string | Yes | Min 8 chars, 1 uppercase, 1 number, 1 special char |
| `confirmPassword` | string | Yes | Must match `password` |
| `fullName` | string | Yes | User's display name |
| `gender` | string | Yes | `male` / `female` |
| `dateOfBirth` | string | Yes | ISO 8601 date. Must be 18+ years old |
| `authMethod` | string | Yes | `email` / `phone` |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. OTP sent for verification.",
  "data": {
    "userId": "usr_a1b2c3d4e5",
    "email": "user@example.com",
    "phone": "+911234567890",
    "otpSentTo": "email",
    "otpExpiresAt": "2026-04-23T00:35:00Z"
  }
}
```

**Response — Error (409):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "An account with this email already exists.",
  "error": {
    "code": "DUPLICATE_ACCOUNT",
    "details": ["Email is already registered"]
  }
}
```

**Response — Error (422):**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      "Password must be at least 8 characters",
      "User must be at least 18 years old"
    ]
  }
}
```

**Notes:**
- Passwords are hashed using bcrypt (12 salt rounds) before storage.
- OTP is sent via email or SMS based on `authMethod`.
- OTP is valid for 10 minutes.
- User account is created in `unverified` status until OTP is confirmed.
- Default coin balance of 50 is credited on successful verification (welcome bonus).

---

### 2.2 Login

**API Name:** Login User
**Method:** `POST`
**Endpoint:** `/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "SecurePass@123",
  "deviceToken": "fcm_device_token_here",
  "deviceType": "ios"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | string | Yes | Email or phone number |
| `password` | string | Yes | User password |
| `deviceToken` | string | No | FCM token for push notifications |
| `deviceType` | string | No | `ios` / `android` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "userId": "usr_a1b2c3d4e5",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "usr_a1b2c3d4e5",
      "fullName": "John Doe",
      "email": "user@example.com",
      "gender": "male",
      "avatar": "https://cdn.mingley.app/avatars/usr_a1b2c3d4e5.jpg",
      "isPremium": false,
      "isVerified": true,
      "coinBalance": 150,
      "profileComplete": true
    }
  }
}
```

**Response — Error (401):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password.",
  "error": {
    "code": "INVALID_CREDENTIALS",
    "details": []
  }
}
```

**Response — Error (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Account not verified. Please verify your account first.",
  "error": {
    "code": "ACCOUNT_UNVERIFIED",
    "details": ["OTP verification is pending"]
  }
}
```

**Notes:**
- Access token expires in 1 hour (3600 seconds).
- Refresh token expires in 30 days.
- Device token is stored for push notification delivery.
- Failed login attempts are tracked; account is locked after 5 consecutive failures for 15 minutes.

---

### 2.3 Verify OTP

**API Name:** Verify OTP
**Method:** `POST`
**Endpoint:** `/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "usr_a1b2c3d4e5",
  "otp": "482916",
  "purpose": "registration"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User ID received during registration |
| `otp` | string | Yes | 6-digit OTP code |
| `purpose` | string | Yes | `registration` / `password_reset` / `login` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified successfully.",
  "data": {
    "userId": "usr_a1b2c3d4e5",
    "verified": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

**Response — Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired OTP.",
  "error": {
    "code": "INVALID_OTP",
    "details": ["OTP has expired or is incorrect"]
  }
}
```

**Notes:**
- OTP is valid for 10 minutes from generation.
- After 3 failed OTP attempts, a new OTP must be requested.
- On successful verification for `registration`, welcome bonus of 50 coins is credited.
- Tokens are issued immediately upon successful verification (auto-login).

---

### 2.4 Resend OTP

**API Name:** Resend OTP
**Method:** `POST`
**Endpoint:** `/auth/resend-otp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "usr_a1b2c3d4e5",
  "purpose": "registration"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User ID |
| `purpose` | string | Yes | `registration` / `password_reset` / `login` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP resent successfully.",
  "data": {
    "otpSentTo": "email",
    "otpExpiresAt": "2026-04-23T00:45:00Z"
  }
}
```

**Response — Error (429):**
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many OTP requests. Please wait before retrying.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": ["Retry after 60 seconds"]
  }
}
```

**Notes:**
- Rate limited to 1 OTP request per 60 seconds.
- Maximum 5 OTP requests per hour per user.
- Previous OTP is invalidated when a new one is sent.

---

### 2.5 Refresh Token

**API Name:** Refresh Access Token
**Method:** `POST`
**Endpoint:** `/auth/refresh-token`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | Yes | Valid refresh token |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

**Response — Error (401):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Refresh token is invalid or expired.",
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "details": []
  }
}
```

**Notes:**
- Old refresh token is invalidated (rotation strategy).
- A new refresh token is issued with each refresh.
- If the refresh token is expired (>30 days), user must re-login.

---

### 2.6 Logout

**API Name:** Logout User
**Method:** `POST`
**Endpoint:** `/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceToken": "fcm_device_token_here"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceToken` | string | No | Remove specific device from push notifications |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully.",
  "data": null
}
```

**Notes:**
- Access token and refresh token are added to a blacklist.
- Device token is removed from push notification registry.
- Active WebSocket connections for this user are terminated.

---

### 2.7 Forgot Password

**API Name:** Forgot Password
**Method:** `POST`
**Endpoint:** `/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "identifier": "user@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | string | Yes | Registered email or phone number |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset OTP sent.",
  "data": {
    "userId": "usr_a1b2c3d4e5",
    "otpSentTo": "email",
    "otpExpiresAt": "2026-04-23T00:45:00Z"
  }
}
```

**Response — Error (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "No account found with this email.",
  "error": {
    "code": "USER_NOT_FOUND",
    "details": []
  }
}
```

**Notes:**
- Always returns success even if account doesn't exist (to prevent enumeration attacks). In production, the 404 error above should be avoided; return a generic success message instead.
- OTP is sent to the registered email/phone.

---

### 2.8 Reset Password

**API Name:** Reset Password
**Method:** `POST`
**Endpoint:** `/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "usr_a1b2c3d4e5",
  "otp": "482916",
  "newPassword": "NewSecurePass@456",
  "confirmNewPassword": "NewSecurePass@456"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User ID |
| `otp` | string | Yes | 6-digit OTP from forgot-password |
| `newPassword` | string | Yes | New password (same validation rules) |
| `confirmNewPassword` | string | Yes | Must match `newPassword` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully. Please login with your new password.",
  "data": null
}
```

**Response — Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired OTP.",
  "error": {
    "code": "INVALID_OTP",
    "details": []
  }
}
```

**Notes:**
- All existing sessions (tokens) for this user are invalidated.
- User must login again with new password.

---

## 3. User Profile APIs

### 3.1 Get My Profile

**API Name:** Get Current User Profile
**Method:** `GET`
**Endpoint:** `/users/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:** None

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully.",
  "data": {
    "id": "usr_a1b2c3d4e5",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phone": "+911234567890",
    "gender": "male",
    "dateOfBirth": "1998-05-15",
    "age": 28,
    "bio": "Love hiking and photography",
    "avatar": "https://cdn.mingley.app/avatars/usr_a1b2c3d4e5.jpg",
    "coverImage": "https://cdn.mingley.app/covers/usr_a1b2c3d4e5.jpg",
    "images": [
      {
        "id": "img_001",
        "url": "https://cdn.mingley.app/photos/img_001.jpg",
        "position": 1,
        "uploadedAt": "2026-04-20T10:00:00Z"
      },
      {
        "id": "img_002",
        "url": "https://cdn.mingley.app/photos/img_002.jpg",
        "position": 2,
        "uploadedAt": "2026-04-20T10:01:00Z"
      }
    ],
    "interests": ["hiking", "photography", "cooking", "music"],
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "coordinates": {
        "lat": 19.076,
        "lng": 72.8777
      }
    },
    "preferences": {
      "ageRange": { "min": 22, "max": 32 },
      "maxDistance": 50,
      "genderPreference": "female",
      "showVerifiedOnly": false
    },
    "stats": {
      "totalMatches": 24,
      "totalLikesReceived": 156,
      "profileViews": 342
    },
    "isPremium": false,
    "premiumExpiresAt": null,
    "isVerified": true,
    "profileComplete": true,
    "coinBalance": 150,
    "lastActive": "2026-04-23T00:20:00Z",
    "createdAt": "2026-04-01T08:00:00Z"
  }
}
```

**Notes:**
- `coinBalance` is visible only to the logged-in user (not on public profiles).
- `stats` are visible only to the user themselves.

---

### 3.2 Get User Profile (Public)

**API Name:** Get User Profile by ID
**Method:** `GET`
**Endpoint:** `/users/:userId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | Target user's ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile fetched successfully.",
  "data": {
    "id": "usr_f6g7h8i9j0",
    "fullName": "Jane Smith",
    "gender": "female",
    "age": 25,
    "bio": "Coffee lover and travel enthusiast",
    "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg",
    "images": [
      {
        "id": "img_010",
        "url": "https://cdn.mingley.app/photos/img_010.jpg",
        "position": 1
      }
    ],
    "interests": ["travel", "coffee", "yoga"],
    "location": {
      "city": "Mumbai",
      "distance": 12.5
    },
    "isPremium": true,
    "isVerified": true,
    "lastActive": "2026-04-22T23:50:00Z",
    "isMatched": false,
    "isBlocked": false,
    "isBlockedBy": false
  }
}
```

**Response — Error (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found.",
  "error": {
    "code": "USER_NOT_FOUND",
    "details": []
  }
}
```

**Notes:**
- Sensitive fields (email, phone, coinBalance, stats) are hidden from public view.
- `distance` is calculated from the requesting user's location.
- `isBlocked` / `isBlockedBy` indicates block status between both users.
- If the user has blocked the requester, a 404 is returned (to prevent stalking).

---

### 3.3 Update Profile

**API Name:** Update User Profile
**Method:** `PUT`
**Endpoint:** `/users/me`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "bio": "Love hiking, photography, and exploring new places!",
  "dateOfBirth": "1998-05-15",
  "location": {
    "city": "Delhi",
    "state": "Delhi",
    "country": "India",
    "coordinates": {
      "lat": 28.6139,
      "lng": 77.209
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | No | Updated display name |
| `bio` | string | No | Max 500 characters |
| `dateOfBirth` | string | No | ISO 8601 date |
| `location` | object | No | Updated location |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully.",
  "data": {
    "id": "usr_a1b2c3d4e5",
    "fullName": "John Doe Updated",
    "bio": "Love hiking, photography, and exploring new places!",
    "updatedAt": "2026-04-23T00:25:00Z"
  }
}
```

**Response — Error (422):**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Bio cannot exceed 500 characters"]
  }
}
```

**Notes:**
- Only provided fields are updated (PATCH-like behavior).
- `gender` cannot be changed after registration.
- `email` and `phone` changes require OTP re-verification.

---

### 3.4 Upload Profile Images

**API Name:** Upload Profile Images
**Method:** `POST`
**Endpoint:** `/users/me/images`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | file[] | Yes | Image files (JPEG, PNG, WebP). Max 5MB each |
| `position` | integer | No | Position index (1-6) |
| `type` | string | No | `avatar` / `cover` / `gallery`. Default: `gallery` |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Images uploaded successfully.",
  "data": {
    "images": [
      {
        "id": "img_015",
        "url": "https://cdn.mingley.app/photos/img_015.jpg",
        "thumbnailUrl": "https://cdn.mingley.app/photos/img_015_thumb.jpg",
        "position": 3,
        "type": "gallery",
        "uploadedAt": "2026-04-23T00:26:00Z"
      }
    ]
  }
}
```

**Response — Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Maximum 6 images allowed per profile.",
  "error": {
    "code": "IMAGE_LIMIT_EXCEEDED",
    "details": ["You already have 6 images. Please delete one before uploading."]
  }
}
```

**Notes:**
- Maximum 6 gallery images + 1 avatar + 1 cover image per user.
- Images are automatically resized and optimized (max 1200px wide).
- Thumbnail versions are generated (300px wide).
- NSFW content detection is run on upload; explicit images are rejected.
- Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.

---

### 3.5 Delete Profile Image

**API Name:** Delete Profile Image
**Method:** `DELETE`
**Endpoint:** `/users/me/images/:imageId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `imageId` | string | Image ID to delete |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Image deleted successfully.",
  "data": {
    "deletedImageId": "img_015",
    "remainingImages": 4
  }
}
```

**Response — Error (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Image not found.",
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "details": []
  }
}
```

**Notes:**
- At least 1 profile image must remain (avatar cannot be deleted unless replaced).
- Image is also removed from the CDN.

---

### 3.6 Reorder Profile Images

**API Name:** Reorder Profile Images
**Method:** `PUT`
**Endpoint:** `/users/me/images/reorder`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "imageOrder": [
    { "imageId": "img_002", "position": 1 },
    { "imageId": "img_001", "position": 2 },
    { "imageId": "img_003", "position": 3 }
  ]
}
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Image order updated successfully.",
  "data": {
    "images": [
      { "id": "img_002", "position": 1 },
      { "id": "img_001", "position": 2 },
      { "id": "img_003", "position": 3 }
    ]
  }
}
```

**Notes:**
- Position 1 image is shown as the main profile image in discovery cards.

---

### 3.7 Update Interests

**API Name:** Update User Interests
**Method:** `PUT`
**Endpoint:** `/users/me/interests`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "interests": ["hiking", "photography", "cooking", "music", "yoga"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `interests` | string[] | Yes | Array of interest tags. Min 3, max 10 |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Interests updated successfully.",
  "data": {
    "interests": ["hiking", "photography", "cooking", "music", "yoga"],
    "matchScore": "Interests will be used to improve your match suggestions."
  }
}
```

**Response — Error (422):**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Minimum 3 interests required", "Maximum 10 interests allowed"]
  }
}
```

**Notes:**
- Interests must be selected from a predefined list (see Appendix).
- Interests affect the discovery algorithm's matching score.
- Updating interests triggers a re-indexing of the user profile in the discovery engine.

---

### 3.8 Update Preferences

**API Name:** Update Discovery Preferences
**Method:** `PUT`
**Endpoint:** `/users/me/preferences`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "ageRange": { "min": 22, "max": 30 },
  "maxDistance": 25,
  "genderPreference": "female",
  "showVerifiedOnly": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ageRange` | object | No | `min` (18-100), `max` (18-100) |
| `maxDistance` | integer | No | In kilometers (1-500) |
| `genderPreference` | string | No | `male` / `female` / `both` |
| `showVerifiedOnly` | boolean | No | Premium only feature |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Preferences updated successfully.",
  "data": {
    "ageRange": { "min": 22, "max": 30 },
    "maxDistance": 25,
    "genderPreference": "female",
    "showVerifiedOnly": true
  }
}
```

**Response — Error (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Verified-only filter is a premium feature.",
  "error": {
    "code": "PREMIUM_REQUIRED",
    "details": ["Upgrade to premium to use the verified users filter"]
  }
}
```

**Notes:**
- `showVerifiedOnly` is only available for premium users.
- Preferences affect the discovery feed query.

---

### 3.9 Update Location

**API Name:** Update User Location
**Method:** `PUT`
**Endpoint:** `/users/me/location`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "coordinates": {
    "lat": 19.076,
    "lng": 72.8777
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `coordinates.lat` | number | Yes | Latitude (-90 to 90) |
| `coordinates.lng` | number | Yes | Longitude (-180 to 180) |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Location updated successfully.",
  "data": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "coordinates": {
      "lat": 19.076,
      "lng": 72.8777
    },
    "updatedAt": "2026-04-23T00:28:00Z"
  }
}
```

**Notes:**
- City/state/country are reverse-geocoded from coordinates.
- Location is used for distance-based discovery filtering.
- Location updates are rate-limited to once per 5 minutes.

---

## 4. Discovery / Match APIs

### 4.1 Get Discover Users

**API Name:** Get Discovery Feed
**Method:** `GET`
**Endpoint:** `/discover`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Number of profiles per page (max 50) |
| `minAge` | integer | from prefs | Minimum age filter |
| `maxAge` | integer | from prefs | Maximum age filter |
| `maxDistance` | integer | from prefs | Max distance in km |
| `verifiedOnly` | boolean | false | Show only verified users (premium) |
| `nearbyOnly` | boolean | false | Show nearby users (premium) |
| `interests` | string | — | Comma-separated interest tags |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Discovery feed loaded.",
  "data": {
    "users": [
      {
        "id": "usr_f6g7h8i9j0",
        "fullName": "Jane Smith",
        "age": 25,
        "bio": "Coffee lover",
        "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg",
        "images": [
          {
            "id": "img_010",
            "url": "https://cdn.mingley.app/photos/img_010.jpg",
            "position": 1
          }
        ],
        "interests": ["travel", "coffee", "yoga"],
        "distance": 12.5,
        "city": "Mumbai",
        "isPremium": true,
        "isVerified": true,
        "matchScore": 85,
        "lastActive": "2026-04-22T23:50:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 8,
      "totalItems": 156,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Notes:**
- Users are sorted by `matchScore` (interest overlap + activity + distance).
- Users already swiped (liked/disliked) are excluded.
- Blocked users are excluded.
- `verifiedOnly` and `nearbyOnly` return 403 for non-premium users.
- Discovery algorithm factors: distance, shared interests, activity recency, profile completeness.

---

### 4.2 Swipe (Like / Dislike / Super Like)

**API Name:** Swipe on User
**Method:** `POST`
**Endpoint:** `/discover/swipe`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetUserId": "usr_f6g7h8i9j0",
  "action": "like"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetUserId` | string | Yes | User being swiped on |
| `action` | string | Yes | `like` / `dislike` / `superlike` |

**Response — Success (200) — No Match:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Swipe recorded.",
  "data": {
    "action": "like",
    "targetUserId": "usr_f6g7h8i9j0",
    "isMatch": false,
    "remainingSwipes": 49,
    "remainingSuperLikes": 2
  }
}
```

**Response — Success (200) — Match Created:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "It's a match!",
  "data": {
    "action": "like",
    "targetUserId": "usr_f6g7h8i9j0",
    "isMatch": true,
    "match": {
      "matchId": "mtch_x1y2z3",
      "matchedAt": "2026-04-23T00:30:00Z",
      "matchedUser": {
        "id": "usr_f6g7h8i9j0",
        "fullName": "Jane Smith",
        "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg"
      }
    },
    "remainingSwipes": 49,
    "remainingSuperLikes": 2
  }
}
```

**Response — Error (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Daily swipe limit reached.",
  "error": {
    "code": "SWIPE_LIMIT_REACHED",
    "details": ["Free users get 50 swipes per day. Upgrade to premium for unlimited swipes."],
    "resetsAt": "2026-04-24T00:00:00Z"
  }
}
```

**Response — Error (402) — Super Like:**
```json
{
  "success": false,
  "statusCode": 402,
  "message": "Insufficient coins for super like.",
  "error": {
    "code": "INSUFFICIENT_COINS",
    "details": ["Super like costs 50 coins. Your balance: 30 coins."],
    "requiredCoins": 50,
    "currentBalance": 30
  }
}
```

**Notes:**
- Free users: 50 swipes/day, 1 super like/day.
- Premium users: unlimited swipes, 5 super likes/day.
- Super like costs 50 coins.
- When both users have liked each other, a match is automatically created.
- Match creation triggers push notifications to both users.
- A match also creates a chat room between the two users.

---

### 4.3 Undo Last Swipe

**API Name:** Undo Last Swipe
**Method:** `POST`
**Endpoint:** `/discover/swipe/undo`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Last swipe undone.",
  "data": {
    "undoneAction": "dislike",
    "undoneUserId": "usr_f6g7h8i9j0",
    "undoneUserName": "Jane Smith"
  }
}
```

**Response — Error (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Undo is a premium feature.",
  "error": {
    "code": "PREMIUM_REQUIRED",
    "details": ["Upgrade to premium to undo swipes"]
  }
}
```

**Notes:**
- Premium only feature.
- Only the most recent swipe can be undone.
- Cannot undo a swipe that resulted in a match (match must be unmatched separately).

---

### 4.4 Get Matches List

**API Name:** Get All Matches
**Method:** `GET`
**Endpoint:** `/matches`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `sortBy` | string | `matchedAt` | `matchedAt` / `lastMessage` / `name` |
| `order` | string | `desc` | `asc` / `desc` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Matches fetched successfully.",
  "data": {
    "matches": [
      {
        "matchId": "mtch_x1y2z3",
        "matchedUser": {
          "id": "usr_f6g7h8i9j0",
          "fullName": "Jane Smith",
          "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg",
          "age": 25,
          "isOnline": true,
          "lastActive": "2026-04-23T00:20:00Z",
          "isPremium": true
        },
        "matchedAt": "2026-04-22T18:00:00Z",
        "lastMessage": {
          "text": "Hey! How are you?",
          "sentAt": "2026-04-22T23:45:00Z",
          "sentBy": "usr_f6g7h8i9j0",
          "isRead": false
        },
        "unreadCount": 3,
        "chatId": "chat_m1n2o3"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 2,
      "totalItems": 24,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Notes:**
- Includes the last message preview and unread count for each match.
- Online status is based on WebSocket connection + last 5-minute activity.

---

### 4.5 Unmatch User

**API Name:** Unmatch User
**Method:** `DELETE`
**Endpoint:** `/matches/:matchId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `matchId` | string | Match ID to remove |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User unmatched successfully.",
  "data": {
    "matchId": "mtch_x1y2z3",
    "unmatchedAt": "2026-04-23T00:32:00Z"
  }
}
```

**Notes:**
- Unmatching deletes the match and all associated chat messages.
- Both users' discovery feeds are reset to allow re-discovery.
- The other user is not notified that they were unmatched (match just disappears).

---

### 4.6 Get Users Who Liked Me

**API Name:** Get Likes Received
**Method:** `GET`
**Endpoint:** `/discover/likes-received`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response — Success (200) — Premium User:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Likes received fetched successfully.",
  "data": {
    "likes": [
      {
        "id": "like_abc123",
        "user": {
          "id": "usr_k1l2m3",
          "fullName": "Emily Watson",
          "age": 24,
          "avatar": "https://cdn.mingley.app/avatars/usr_k1l2m3.jpg",
          "city": "Mumbai",
          "isVerified": true
        },
        "likedAt": "2026-04-22T20:00:00Z",
        "isSuperLike": false
      }
    ],
    "totalLikes": 12,
    "pagination": { "..." : "..." }
  }
}
```

**Response — Success (200) — Free User:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Likes received fetched successfully.",
  "data": {
    "likes": [
      {
        "id": "like_abc123",
        "user": {
          "id": "usr_k1l2m3",
          "fullName": "E****",
          "age": null,
          "avatar": "https://cdn.mingley.app/avatars/blurred_placeholder.jpg",
          "city": null,
          "isVerified": null
        },
        "likedAt": "2026-04-22T20:00:00Z",
        "isSuperLike": false
      }
    ],
    "totalLikes": 12,
    "blurred": true,
    "upgradeMessage": "Upgrade to premium to see who liked you!",
    "pagination": { "..." : "..." }
  }
}
```

**Notes:**
- Free users see blurred profiles; premium users see full profiles.
- Super likes are marked separately for prioritization.

---

## 5. Chat / Message APIs

### 5.1 Get Chat List

**API Name:** Get All Chats
**Method:** `GET`
**Endpoint:** `/chats`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chats fetched successfully.",
  "data": {
    "chats": [
      {
        "chatId": "chat_m1n2o3",
        "matchId": "mtch_x1y2z3",
        "participant": {
          "id": "usr_f6g7h8i9j0",
          "fullName": "Jane Smith",
          "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg",
          "isOnline": true,
          "lastActive": "2026-04-23T00:20:00Z"
        },
        "lastMessage": {
          "id": "msg_p1q2r3",
          "text": "Hey! How are you?",
          "sentAt": "2026-04-22T23:45:00Z",
          "sentBy": "usr_f6g7h8i9j0",
          "type": "text"
        },
        "unreadCount": 3,
        "createdAt": "2026-04-22T18:00:00Z"
      }
    ],
    "pagination": { "..." : "..." }
  }
}
```

**Notes:**
- Chats are sorted by most recent message by default.
- Only matched users can have chats.

---

### 5.2 Get Messages in a Chat

**API Name:** Get Chat Messages
**Method:** `GET`
**Endpoint:** `/chats/:chatId/messages`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `chatId` | string | Chat ID |

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Messages per page |
| `before` | string | — | Cursor: message ID to load messages before (for infinite scroll) |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages fetched successfully.",
  "data": {
    "chatId": "chat_m1n2o3",
    "messages": [
      {
        "id": "msg_p1q2r3",
        "senderId": "usr_f6g7h8i9j0",
        "text": "Hey! How are you?",
        "type": "text",
        "status": "delivered",
        "sentAt": "2026-04-22T23:45:00Z",
        "readAt": null
      },
      {
        "id": "msg_s4t5u6",
        "senderId": "usr_a1b2c3d4e5",
        "text": "I'm great! Love your travel pics",
        "type": "text",
        "status": "read",
        "sentAt": "2026-04-22T23:44:00Z",
        "readAt": "2026-04-22T23:44:30Z"
      },
      {
        "id": "msg_gift01",
        "senderId": "usr_a1b2c3d4e5",
        "text": null,
        "type": "gift",
        "giftData": {
          "giftId": "gift_rose",
          "giftName": "Rose",
          "giftImage": "https://cdn.mingley.app/gifts/rose.png",
          "coinValue": 100
        },
        "status": "read",
        "sentAt": "2026-04-22T23:43:00Z",
        "readAt": "2026-04-22T23:43:30Z"
      }
    ],
    "chatInfo": {
      "canSendMessage": true,
      "messageQuota": {
        "type": "unlimited",
        "remaining": null,
        "coinCostPerMessage": 0
      }
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "hasMore": true,
      "nextCursor": "msg_v7w8x9"
    }
  }
}
```

**Notes:**
- Messages are sorted newest-first.
- `chatInfo.canSendMessage` indicates whether the user can currently send a message.
- For male users, `coinCostPerMessage` shows the coin deduction amount.
- Message types: `text`, `image`, `gift`, `system`.

---

### 5.3 Send Message

**API Name:** Send Message
**Method:** `POST`
**Endpoint:** `/chats/:chatId/messages`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `chatId` | string | Chat ID |

**Request Body:**
```json
{
  "text": "Hey! How are you doing today?",
  "type": "text"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes (for text) | Message content. Max 1000 chars |
| `type` | string | Yes | `text` / `image` |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Message sent successfully.",
  "data": {
    "id": "msg_y1z2a3",
    "chatId": "chat_m1n2o3",
    "senderId": "usr_a1b2c3d4e5",
    "text": "Hey! How are you doing today?",
    "type": "text",
    "status": "sent",
    "sentAt": "2026-04-23T00:33:00Z",
    "coinDeducted": 10,
    "remainingBalance": 140
  }
}
```

**Response — Error (402) — Male User Insufficient Coins:**
```json
{
  "success": false,
  "statusCode": 402,
  "message": "Insufficient coins to send message.",
  "error": {
    "code": "INSUFFICIENT_COINS",
    "details": ["Sending a message costs 10 coins. Your balance: 5 coins."],
    "requiredCoins": 10,
    "currentBalance": 5
  }
}
```

**Response — Error (403) — Female User Quota Exhausted:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Free message quota exhausted for this match.",
  "error": {
    "code": "MESSAGE_QUOTA_EXHAUSTED",
    "details": [
      "You have used all 3 free messages for this match.",
      "Wait for the other user to reply, or use coins to continue."
    ],
    "freeMessagesUsed": 3,
    "freeMessagesTotal": 3,
    "coinCostPerMessage": 5
  }
}
```

**Notes:**

**Business Logic — Coin and Message Rules:**

| User Type | Rule |
|-----------|------|
| Male (free) | Each message costs **10 coins** |
| Male (premium) | Each message costs **5 coins** (50% discount) |
| Female (free) | **3 free messages per match**, then 5 coins/message |
| Female (premium) | **10 free messages per match**, then 3 coins/message |

- Coin deduction is atomic — message is only saved if coin deduction succeeds.
- Push notification is sent to the recipient.
- Message is also broadcast via WebSocket for real-time delivery.
- `coinDeducted` and `remainingBalance` are only included for the sender.

---

### 5.4 Send Image Message

**API Name:** Send Image Message
**Method:** `POST`
**Endpoint:** `/chats/:chatId/messages/image`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `chatId` | string | Chat ID |

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Yes | Image file (JPEG, PNG, WebP). Max 5MB |
| `caption` | string | No | Optional text caption |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Image message sent successfully.",
  "data": {
    "id": "msg_img01",
    "chatId": "chat_m1n2o3",
    "senderId": "usr_a1b2c3d4e5",
    "text": "Check this out!",
    "type": "image",
    "imageUrl": "https://cdn.mingley.app/chat-images/msg_img01.jpg",
    "thumbnailUrl": "https://cdn.mingley.app/chat-images/msg_img01_thumb.jpg",
    "status": "sent",
    "sentAt": "2026-04-23T00:34:00Z",
    "coinDeducted": 10,
    "remainingBalance": 130
  }
}
```

**Notes:**
- Same coin deduction rules as text messages.
- NSFW detection is run on the image; explicit images are rejected.
- Images are optimized and stored on CDN.

---

### 5.5 Delete Message

**API Name:** Delete Message
**Method:** `DELETE`
**Endpoint:** `/chats/:chatId/messages/:messageId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `chatId` | string | Chat ID |
| `messageId` | string | Message ID to delete |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Message deleted successfully.",
  "data": {
    "messageId": "msg_y1z2a3",
    "deletedAt": "2026-04-23T00:35:00Z",
    "deletedFor": "everyone"
  }
}
```

**Response — Error (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You can only delete your own messages.",
  "error": {
    "code": "FORBIDDEN",
    "details": []
  }
}
```

**Notes:**
- Users can only delete their own messages.
- Messages can be deleted for up to 1 hour after sending.
- After 1 hour, deletion is "for me only" (other user still sees it).
- Coins are NOT refunded for deleted messages.

---

### 5.6 Mark Messages as Read

**API Name:** Mark Messages as Read
**Method:** `PUT`
**Endpoint:** `/chats/:chatId/read`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `chatId` | string | Chat ID |

**Request Body:**
```json
{
  "lastReadMessageId": "msg_p1q2r3"
}
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages marked as read.",
  "data": {
    "chatId": "chat_m1n2o3",
    "lastReadMessageId": "msg_p1q2r3",
    "readAt": "2026-04-23T00:36:00Z"
  }
}
```

**Notes:**
- All messages up to `lastReadMessageId` are marked as read.
- Read receipts are broadcast via WebSocket to the sender.

---

### 5.7 Get Message Quota Status

**API Name:** Get Message Quota for Chat
**Method:** `GET`
**Endpoint:** `/chats/:chatId/quota`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `chatId` | string | Chat ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Message quota fetched.",
  "data": {
    "chatId": "chat_m1n2o3",
    "userGender": "female",
    "isPremium": false,
    "freeMessagesTotal": 3,
    "freeMessagesUsed": 2,
    "freeMessagesRemaining": 1,
    "coinCostPerMessage": 5,
    "currentCoinBalance": 150,
    "canSendFreeMessage": true
  }
}
```

**Notes:**
- Helps the client display remaining free messages or coin cost before sending.

---

## 6. Calling System APIs

### 6.1 Initiate Call

**API Name:** Start a Call
**Method:** `POST`
**Endpoint:** `/calls/initiate`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetUserId": "usr_f6g7h8i9j0",
  "callType": "audio"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetUserId` | string | Yes | User to call |
| `callType` | string | Yes | `audio` / `video` |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Call initiated.",
  "data": {
    "callId": "call_d1e2f3",
    "callerId": "usr_a1b2c3d4e5",
    "receiverId": "usr_f6g7h8i9j0",
    "callType": "audio",
    "status": "ringing",
    "coinRatePerMinute": 20,
    "currentBalance": 150,
    "estimatedMaxDuration": 7,
    "rtcToken": "agora_token_or_twilio_token_here",
    "channelName": "call_d1e2f3",
    "initiatedAt": "2026-04-23T00:37:00Z"
  }
}
```

**Response — Error (402):**
```json
{
  "success": false,
  "statusCode": 402,
  "message": "Insufficient coins to start a call.",
  "error": {
    "code": "INSUFFICIENT_COINS",
    "details": ["Minimum 20 coins required to start a call (1 minute). Your balance: 10 coins."],
    "requiredCoins": 20,
    "currentBalance": 10
  }
}
```

**Response — Error (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You can only call matched users.",
  "error": {
    "code": "NOT_MATCHED",
    "details": ["You must be matched with this user to initiate a call."]
  }
}
```

**Response — Error (409):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User is currently on another call.",
  "error": {
    "code": "USER_BUSY",
    "details": []
  }
}
```

**Notes:**

**Business Logic — Coin Deduction:**

| Call Type | Coin Cost |
|-----------|-----------|
| Audio call | **20 coins/minute** |
| Video call | **30 coins/minute** |
| Audio (premium) | **15 coins/minute** |
| Video (premium) | **25 coins/minute** |

- Minimum balance of 1 minute cost required to initiate.
- Coins are deducted per minute, at the start of each minute.
- **Auto-end:** If balance reaches 0, call is automatically terminated with a 10-second warning.
- Only matched users can call each other.
- Caller (initiator) bears the cost; receiver is free.
- RTC token is for WebRTC integration (Agora/Twilio).

---

### 6.2 Answer Call

**API Name:** Answer Incoming Call
**Method:** `POST`
**Endpoint:** `/calls/:callId/answer`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `callId` | string | Call ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Call answered.",
  "data": {
    "callId": "call_d1e2f3",
    "status": "connected",
    "rtcToken": "agora_token_for_receiver",
    "channelName": "call_d1e2f3",
    "connectedAt": "2026-04-23T00:37:30Z"
  }
}
```

**Notes:**
- Call transitions from `ringing` to `connected`.
- Coin deduction starts immediately upon connection.
- If not answered within 30 seconds, call is auto-declined (status: `missed`).

---

### 6.3 End Call

**API Name:** End Active Call
**Method:** `POST`
**Endpoint:** `/calls/:callId/end`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `callId` | string | Call ID |

**Request Body:**
```json
{
  "reason": "user_ended"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | No | `user_ended` / `no_answer` / `declined` / `insufficient_balance` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Call ended.",
  "data": {
    "callId": "call_d1e2f3",
    "status": "ended",
    "duration": 185,
    "durationFormatted": "3m 05s",
    "totalCoinDeducted": 80,
    "coinRatePerMinute": 20,
    "remainingBalance": 70,
    "endedAt": "2026-04-23T00:40:05Z",
    "endedBy": "usr_a1b2c3d4e5",
    "endReason": "user_ended"
  }
}
```

**Notes:**
- Final coin deduction is calculated pro-rata for the last partial minute.
- Call duration and cost are recorded in transaction history.
- If ended due to `insufficient_balance`, a 10-second warning was given before termination.

---

### 6.4 Decline Call

**API Name:** Decline Incoming Call
**Method:** `POST`
**Endpoint:** `/calls/:callId/decline`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `callId` | string | Call ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Call declined.",
  "data": {
    "callId": "call_d1e2f3",
    "status": "declined",
    "declinedAt": "2026-04-23T00:37:15Z"
  }
}
```

**Notes:**
- No coins are deducted for declined calls.
- Caller receives a WebSocket notification that the call was declined.

---

### 6.5 Get Call Status

**API Name:** Get Call Status
**Method:** `GET`
**Endpoint:** `/calls/:callId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `callId` | string | Call ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Call status fetched.",
  "data": {
    "callId": "call_d1e2f3",
    "callerId": "usr_a1b2c3d4e5",
    "receiverId": "usr_f6g7h8i9j0",
    "callType": "audio",
    "status": "connected",
    "duration": 120,
    "coinDeductedSoFar": 60,
    "remainingBalance": 90,
    "estimatedRemainingMinutes": 4,
    "connectedAt": "2026-04-23T00:37:30Z"
  }
}
```

**Notes:**
- `status` values: `ringing`, `connected`, `ended`, `missed`, `declined`, `failed`.
- `estimatedRemainingMinutes` is calculated from current balance and per-minute rate.

---

### 6.6 Get Call History

**API Name:** Get Call History
**Method:** `GET`
**Endpoint:** `/calls/history`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `type` | string | — | `audio` / `video` / `all` |
| `status` | string | — | `connected` / `missed` / `declined` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Call history fetched.",
  "data": {
    "calls": [
      {
        "callId": "call_d1e2f3",
        "callType": "audio",
        "direction": "outgoing",
        "status": "ended",
        "otherUser": {
          "id": "usr_f6g7h8i9j0",
          "fullName": "Jane Smith",
          "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg"
        },
        "duration": 185,
        "durationFormatted": "3m 05s",
        "coinDeducted": 80,
        "initiatedAt": "2026-04-23T00:37:00Z",
        "endedAt": "2026-04-23T00:40:05Z"
      }
    ],
    "pagination": { "..." : "..." }
  }
}
```

---

## 7. Wallet / Coin System APIs

### 7.1 Get Wallet Balance

**API Name:** Get Coin Balance
**Method:** `GET`
**Endpoint:** `/wallet/balance`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Wallet balance fetched.",
  "data": {
    "userId": "usr_a1b2c3d4e5",
    "coinBalance": 1250,
    "lifetimeEarned": 5000,
    "lifetimeSpent": 3750,
    "lifetimeCashedOut": 0,
    "pendingCashout": 0,
    "currency": "coins"
  }
}
```

---

### 7.2 Get Coin Packages

**API Name:** Get Available Coin Packages
**Method:** `GET`
**Endpoint:** `/wallet/packages`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Coin packages fetched.",
  "data": {
    "packages": [
      {
        "id": "pkg_starter",
        "name": "Starter",
        "coins": 100,
        "price": 99,
        "currency": "INR",
        "priceFormatted": "₹99",
        "bonusCoins": 0,
        "savings": null,
        "popular": false
      },
      {
        "id": "pkg_popular",
        "name": "Popular",
        "coins": 500,
        "price": 399,
        "currency": "INR",
        "priceFormatted": "₹399",
        "bonusCoins": 50,
        "savings": "20%",
        "popular": true
      },
      {
        "id": "pkg_premium",
        "name": "Premium Pack",
        "coins": 1500,
        "price": 999,
        "currency": "INR",
        "priceFormatted": "₹999",
        "bonusCoins": 200,
        "savings": "35%",
        "popular": false
      },
      {
        "id": "pkg_elite",
        "name": "Elite Pack",
        "coins": 5000,
        "price": 2499,
        "currency": "INR",
        "priceFormatted": "₹2,499",
        "bonusCoins": 1000,
        "savings": "50%",
        "popular": false
      }
    ]
  }
}
```

---

### 7.3 Buy Coins (Initiate Purchase)

**API Name:** Purchase Coins
**Method:** `POST`
**Endpoint:** `/wallet/purchase`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "packageId": "pkg_popular",
  "paymentMethod": "razorpay",
  "paymentToken": "pay_rzp_abc123xyz"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `packageId` | string | Yes | Coin package ID |
| `paymentMethod` | string | Yes | `razorpay` / `stripe` / `google_pay` / `apple_pay` |
| `paymentToken` | string | Yes | Payment gateway token from client-side payment |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Coins purchased successfully!",
  "data": {
    "transactionId": "txn_abc123def",
    "packageId": "pkg_popular",
    "coinsAdded": 550,
    "baseCoins": 500,
    "bonusCoins": 50,
    "amountPaid": 399,
    "currency": "INR",
    "newBalance": 1800,
    "paymentMethod": "razorpay",
    "purchasedAt": "2026-04-23T00:40:00Z"
  }
}
```

**Response — Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Payment verification failed.",
  "error": {
    "code": "PAYMENT_FAILED",
    "details": ["Payment was declined by the payment provider."]
  }
}
```

**Notes:**
- Server-side payment verification is mandatory.
- Coins are credited only after successful payment verification.
- Transaction is recorded with full audit trail.
- Purchase receipt is sent via email.

---

### 7.4 Get Transaction History

**API Name:** Get Transaction History
**Method:** `GET`
**Endpoint:** `/wallet/transactions`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `type` | string | `all` | `purchase` / `spend` / `receive` / `transfer` / `cashout` / `all` |
| `startDate` | string | — | ISO 8601 date (filter from) |
| `endDate` | string | — | ISO 8601 date (filter to) |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Transaction history fetched.",
  "data": {
    "transactions": [
      {
        "id": "txn_abc123def",
        "type": "purchase",
        "description": "Purchased Popular Pack",
        "coins": 550,
        "direction": "credit",
        "balanceAfter": 1800,
        "metadata": {
          "packageId": "pkg_popular",
          "paymentMethod": "razorpay",
          "amountPaid": 399,
          "currency": "INR"
        },
        "createdAt": "2026-04-23T00:40:00Z"
      },
      {
        "id": "txn_msg001",
        "type": "spend",
        "description": "Message to Jane Smith",
        "coins": 10,
        "direction": "debit",
        "balanceAfter": 1790,
        "metadata": {
          "category": "message",
          "chatId": "chat_m1n2o3",
          "recipientId": "usr_f6g7h8i9j0"
        },
        "createdAt": "2026-04-23T00:33:00Z"
      },
      {
        "id": "txn_call001",
        "type": "spend",
        "description": "Audio call with Jane Smith (3m 05s)",
        "coins": 80,
        "direction": "debit",
        "balanceAfter": 1710,
        "metadata": {
          "category": "call",
          "callId": "call_d1e2f3",
          "callType": "audio",
          "duration": 185
        },
        "createdAt": "2026-04-23T00:40:05Z"
      },
      {
        "id": "txn_gift001",
        "type": "spend",
        "description": "Sent Rose to Jane Smith",
        "coins": 100,
        "direction": "debit",
        "balanceAfter": 1610,
        "metadata": {
          "category": "gift",
          "giftId": "gift_rose",
          "recipientId": "usr_f6g7h8i9j0"
        },
        "createdAt": "2026-04-22T23:43:00Z"
      },
      {
        "id": "txn_recv001",
        "type": "receive",
        "description": "Received gift from Alex Johnson",
        "coins": 200,
        "direction": "credit",
        "balanceAfter": 1810,
        "metadata": {
          "category": "gift_received",
          "giftId": "gift_diamond",
          "senderId": "usr_x9y8z7"
        },
        "createdAt": "2026-04-22T22:00:00Z"
      }
    ],
    "summary": {
      "totalCredits": 750,
      "totalDebits": 190,
      "netChange": 560
    },
    "pagination": { "..." : "..." }
  }
}
```

---

## 8. Gift System APIs

### 8.1 Get Gift Catalog

**API Name:** Get Available Gifts
**Method:** `GET`
**Endpoint:** `/gifts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | `all` | `all` / `basic` / `premium` / `luxury` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gift catalog fetched.",
  "data": {
    "gifts": [
      {
        "id": "gift_rose",
        "name": "Rose",
        "description": "A classic red rose",
        "imageUrl": "https://cdn.mingley.app/gifts/rose.png",
        "animationUrl": "https://cdn.mingley.app/gifts/rose.json",
        "coinCost": 100,
        "category": "basic",
        "receiverEarns": 70
      },
      {
        "id": "gift_teddy",
        "name": "Teddy Bear",
        "description": "A cute teddy bear",
        "imageUrl": "https://cdn.mingley.app/gifts/teddy.png",
        "animationUrl": "https://cdn.mingley.app/gifts/teddy.json",
        "coinCost": 250,
        "category": "basic",
        "receiverEarns": 175
      },
      {
        "id": "gift_diamond",
        "name": "Diamond Ring",
        "description": "A sparkling diamond",
        "imageUrl": "https://cdn.mingley.app/gifts/diamond.png",
        "animationUrl": "https://cdn.mingley.app/gifts/diamond.json",
        "coinCost": 1000,
        "category": "luxury",
        "receiverEarns": 700
      },
      {
        "id": "gift_castle",
        "name": "Castle",
        "description": "A majestic castle",
        "imageUrl": "https://cdn.mingley.app/gifts/castle.png",
        "animationUrl": "https://cdn.mingley.app/gifts/castle.json",
        "coinCost": 5000,
        "category": "luxury",
        "receiverEarns": 3500
      }
    ]
  }
}
```

**Notes:**
- `receiverEarns` is the number of coins the gift recipient earns (70% of gift cost).
- `animationUrl` points to a Lottie animation file for in-app gift effects.
- Platform takes a 30% cut of all gift transactions.

---

### 8.2 Send Gift

**API Name:** Send Gift to User
**Method:** `POST`
**Endpoint:** `/gifts/send`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipientId": "usr_f6g7h8i9j0",
  "giftId": "gift_rose",
  "message": "You're beautiful!",
  "chatId": "chat_m1n2o3"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipientId` | string | Yes | Recipient user ID |
| `giftId` | string | Yes | Gift ID from catalog |
| `message` | string | No | Optional message with the gift. Max 200 chars |
| `chatId` | string | No | Chat ID to display gift message in |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Gift sent successfully!",
  "data": {
    "giftTransactionId": "gtxn_a1b2c3",
    "giftId": "gift_rose",
    "giftName": "Rose",
    "coinDeducted": 100,
    "recipientEarned": 70,
    "recipientId": "usr_f6g7h8i9j0",
    "recipientName": "Jane Smith",
    "senderBalance": 1510,
    "chatMessageId": "msg_gift02",
    "sentAt": "2026-04-23T00:42:00Z"
  }
}
```

**Response — Error (402):**
```json
{
  "success": false,
  "statusCode": 402,
  "message": "Insufficient coins to send this gift.",
  "error": {
    "code": "INSUFFICIENT_COINS",
    "details": ["Gift costs 100 coins. Your balance: 50 coins."],
    "requiredCoins": 100,
    "currentBalance": 50
  }
}
```

**Notes:**
- Sender is deducted the full gift cost.
- Recipient receives 70% of the gift cost as coins.
- Platform retains 30% as commission.
- A gift message is automatically created in the chat (if `chatId` provided).
- Push notification is sent to the recipient.
- Gifts can be sent to any matched user.
- Gift animation is triggered on the recipient's device via WebSocket.

---

### 8.3 Get Gift History (Sent)

**API Name:** Get Sent Gift History
**Method:** `GET`
**Endpoint:** `/gifts/sent`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sent gifts fetched.",
  "data": {
    "gifts": [
      {
        "id": "gtxn_a1b2c3",
        "gift": {
          "id": "gift_rose",
          "name": "Rose",
          "imageUrl": "https://cdn.mingley.app/gifts/rose.png"
        },
        "recipient": {
          "id": "usr_f6g7h8i9j0",
          "fullName": "Jane Smith",
          "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg"
        },
        "coinCost": 100,
        "message": "You're beautiful!",
        "sentAt": "2026-04-23T00:42:00Z"
      }
    ],
    "totalCoinSpent": 1500,
    "pagination": { "..." : "..." }
  }
}
```

---

### 8.4 Get Gift History (Received)

**API Name:** Get Received Gift History
**Method:** `GET`
**Endpoint:** `/gifts/received`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Received gifts fetched.",
  "data": {
    "gifts": [
      {
        "id": "gtxn_d4e5f6",
        "gift": {
          "id": "gift_diamond",
          "name": "Diamond Ring",
          "imageUrl": "https://cdn.mingley.app/gifts/diamond.png"
        },
        "sender": {
          "id": "usr_x9y8z7",
          "fullName": "Alex Johnson",
          "avatar": "https://cdn.mingley.app/avatars/usr_x9y8z7.jpg"
        },
        "coinsEarned": 700,
        "message": "You deserve the best!",
        "receivedAt": "2026-04-22T22:00:00Z"
      }
    ],
    "totalCoinsEarned": 3500,
    "pagination": { "..." : "..." }
  }
}
```

---

## 9. Coin Transfer APIs

### 9.1 Transfer Coins to User

**API Name:** Send Coins to User
**Method:** `POST`
**Endpoint:** `/transfers/send`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipientId": "usr_f6g7h8i9j0",
  "amount": 200,
  "note": "Thanks for the great conversation!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipientId` | string | Yes | Recipient user ID |
| `amount` | integer | Yes | Coins to transfer. Min 10, max 10000 |
| `note` | string | No | Optional transfer note. Max 200 chars |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Coins transferred successfully.",
  "data": {
    "transferId": "trf_g1h2i3",
    "senderId": "usr_a1b2c3d4e5",
    "recipientId": "usr_f6g7h8i9j0",
    "recipientName": "Jane Smith",
    "amount": 200,
    "platformFee": 10,
    "netTransferred": 190,
    "senderNewBalance": 1310,
    "note": "Thanks for the great conversation!",
    "transferredAt": "2026-04-23T00:45:00Z"
  }
}
```

**Response — Error (402):**
```json
{
  "success": false,
  "statusCode": 402,
  "message": "Insufficient coins.",
  "error": {
    "code": "INSUFFICIENT_COINS",
    "details": ["Transfer amount: 200 coins. Your balance: 100 coins."],
    "requiredCoins": 200,
    "currentBalance": 100
  }
}
```

**Response — Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot transfer coins to yourself.",
  "error": {
    "code": "INVALID_TRANSFER",
    "details": []
  }
}
```

**Notes:**
- Platform fee: 5% of transfer amount (minimum 1 coin).
- Recipient receives (amount - platform fee).
- Both users must be matched to transfer coins.
- Daily transfer limit: 5000 coins per user.
- Each transfer is recorded in both users' transaction histories.

---

### 9.2 Get Transfer History (Sent)

**API Name:** Get Sent Transfers
**Method:** `GET`
**Endpoint:** `/transfers/sent`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sent transfers fetched.",
  "data": {
    "transfers": [
      {
        "id": "trf_g1h2i3",
        "recipient": {
          "id": "usr_f6g7h8i9j0",
          "fullName": "Jane Smith",
          "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg"
        },
        "amount": 200,
        "platformFee": 10,
        "netTransferred": 190,
        "note": "Thanks for the great conversation!",
        "transferredAt": "2026-04-23T00:45:00Z"
      }
    ],
    "totalSent": 1200,
    "pagination": { "..." : "..." }
  }
}
```

---

### 9.3 Get Transfer History (Received)

**API Name:** Get Received Transfers
**Method:** `GET`
**Endpoint:** `/transfers/received`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Received transfers fetched.",
  "data": {
    "transfers": [
      {
        "id": "trf_j4k5l6",
        "sender": {
          "id": "usr_x9y8z7",
          "fullName": "Alex Johnson",
          "avatar": "https://cdn.mingley.app/avatars/usr_x9y8z7.jpg"
        },
        "amount": 190,
        "note": "Have a great day!",
        "receivedAt": "2026-04-22T21:00:00Z"
      }
    ],
    "totalReceived": 3800,
    "pagination": { "..." : "..." }
  }
}
```

---

## 10. Cashout System APIs (Female Users)

### 10.1 Get Cashout Eligibility

**API Name:** Get Cashout Eligibility
**Method:** `GET`
**Endpoint:** `/cashout/eligibility`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cashout eligibility fetched.",
  "data": {
    "eligible": true,
    "currentBalance": 5000,
    "cashableBalance": 3500,
    "minCashoutAmount": 500,
    "maxCashoutPercent": 70,
    "conversionRate": {
      "coins": 100,
      "inr": 10,
      "description": "100 coins = ₹10"
    },
    "estimatedPayout": {
      "minPayout": "₹50",
      "maxPayout": "₹350"
    },
    "paymentMethods": ["upi", "bank_transfer", "paytm"],
    "processingTime": "2-5 business days",
    "kycVerified": true
  }
}
```

**Response — Error (403) — Male User:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Cashout is only available for female users.",
  "error": {
    "code": "CASHOUT_NOT_AVAILABLE",
    "details": ["This feature is restricted to female users."]
  }
}
```

**Response — Error (403) — KYC Not Done:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "KYC verification required for cashout.",
  "error": {
    "code": "KYC_REQUIRED",
    "details": ["Please complete KYC verification to enable cashout."]
  }
}
```

**Notes:**
- Only female users can cash out coins.
- Maximum 70% of total coin balance can be cashed out.
- Minimum cashout: 500 coins.
- Conversion rate: 100 coins = ₹10 INR.
- KYC verification is required before first cashout.

---

### 10.2 Submit KYC Verification

**API Name:** Submit KYC for Cashout
**Method:** `POST`
**Endpoint:** `/cashout/kyc`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | Yes | Legal name as per ID |
| `documentType` | string | Yes | `aadhaar` / `pan` / `passport` |
| `documentNumber` | string | Yes | Document number |
| `documentFront` | file | Yes | Front image of document |
| `documentBack` | file | No | Back image (required for Aadhaar) |
| `selfie` | file | Yes | Live selfie for face matching |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "KYC submitted for review.",
  "data": {
    "kycId": "kyc_m1n2o3",
    "status": "under_review",
    "submittedAt": "2026-04-23T00:46:00Z",
    "estimatedReview": "24-48 hours"
  }
}
```

**Notes:**
- KYC is verified manually or via third-party API.
- Documents are encrypted and stored securely.
- NSFW/fake document detection is applied.

---

### 10.3 Request Cashout (Withdrawal)

**API Name:** Request Coin Cashout
**Method:** `POST`
**Endpoint:** `/cashout/withdraw`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 2000,
  "paymentMethod": "upi",
  "paymentDetails": {
    "upiId": "janedoe@paytm"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | Yes | Coins to cash out. Min 500 |
| `paymentMethod` | string | Yes | `upi` / `bank_transfer` / `paytm` |
| `paymentDetails` | object | Yes | Payment method details |

**Payment Details by Method:**

For `upi`:
```json
{ "upiId": "user@upi" }
```

For `bank_transfer`:
```json
{
  "accountHolderName": "Jane Smith",
  "accountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "bankName": "State Bank of India"
}
```

For `paytm`:
```json
{ "paytmNumber": "+911234567890" }
```

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Withdrawal request submitted.",
  "data": {
    "withdrawalId": "wdr_p1q2r3",
    "coinsWithdrawn": 2000,
    "payoutAmount": 200,
    "payoutCurrency": "INR",
    "payoutFormatted": "₹200",
    "paymentMethod": "upi",
    "status": "pending",
    "newCoinBalance": 3000,
    "estimatedProcessing": "2-5 business days",
    "requestedAt": "2026-04-23T00:48:00Z"
  }
}
```

**Response — Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cashout amount exceeds maximum allowed.",
  "error": {
    "code": "CASHOUT_LIMIT_EXCEEDED",
    "details": [
      "Maximum cashout is 70% of your balance.",
      "Your balance: 5000 coins. Max cashout: 3500 coins."
    ],
    "maxAmount": 3500
  }
}
```

**Response — Error (400) — Below Minimum:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Minimum cashout amount is 500 coins.",
  "error": {
    "code": "BELOW_MINIMUM_CASHOUT",
    "details": [],
    "minimumAmount": 500
  }
}
```

**Notes:**
- Coins are immediately deducted from balance upon request.
- Conversion: 100 coins = ₹10 INR.
- Platform may apply a processing fee (currently 0%).
- Withdrawal can be cancelled if still in `pending` status.
- Status progression: `pending` → `processing` → `completed` / `rejected`.

---

### 10.4 Get Withdrawal History

**API Name:** Get Withdrawal History
**Method:** `GET`
**Endpoint:** `/cashout/history`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | `all` | `pending` / `processing` / `completed` / `rejected` / `all` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Withdrawal history fetched.",
  "data": {
    "withdrawals": [
      {
        "id": "wdr_p1q2r3",
        "coinsWithdrawn": 2000,
        "payoutAmount": 200,
        "payoutCurrency": "INR",
        "paymentMethod": "upi",
        "paymentDetails": {
          "upiId": "jane***@paytm"
        },
        "status": "completed",
        "requestedAt": "2026-04-22T10:00:00Z",
        "processedAt": "2026-04-23T14:00:00Z",
        "transactionRef": "UTR12345678"
      },
      {
        "id": "wdr_s4t5u6",
        "coinsWithdrawn": 1000,
        "payoutAmount": 100,
        "payoutCurrency": "INR",
        "paymentMethod": "bank_transfer",
        "paymentDetails": {
          "accountNumber": "****7890",
          "bankName": "State Bank of India"
        },
        "status": "pending",
        "requestedAt": "2026-04-23T00:48:00Z",
        "processedAt": null,
        "transactionRef": null
      }
    ],
    "summary": {
      "totalWithdrawn": 3000,
      "totalPaidOut": 300,
      "pendingAmount": 100
    },
    "pagination": { "..." : "..." }
  }
}
```

---

### 10.5 Cancel Withdrawal

**API Name:** Cancel Pending Withdrawal
**Method:** `POST`
**Endpoint:** `/cashout/:withdrawalId/cancel`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `withdrawalId` | string | Withdrawal ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Withdrawal cancelled. Coins refunded.",
  "data": {
    "withdrawalId": "wdr_s4t5u6",
    "coinsRefunded": 1000,
    "newBalance": 4000,
    "cancelledAt": "2026-04-23T01:00:00Z"
  }
}
```

**Response — Error (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot cancel. Withdrawal is already being processed.",
  "error": {
    "code": "CANNOT_CANCEL",
    "details": ["Only pending withdrawals can be cancelled."],
    "currentStatus": "processing"
  }
}
```

**Notes:**
- Only `pending` withdrawals can be cancelled.
- Coins are refunded immediately on cancellation.

---

## 11. Premium Subscription APIs

### 11.1 Get Subscription Plans

**API Name:** Get Available Plans
**Method:** `GET`
**Endpoint:** `/subscriptions/plans`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscription plans fetched.",
  "data": {
    "plans": [
      {
        "id": "plan_weekly",
        "name": "Weekly",
        "duration": 7,
        "durationUnit": "days",
        "price": 199,
        "currency": "INR",
        "priceFormatted": "₹199/week",
        "features": [
          "Unlimited swipes",
          "5 super likes/day",
          "See who liked you",
          "Undo swipes",
          "Verified users filter",
          "Nearby users filter",
          "50% discount on message coins",
          "25% discount on call coins",
          "Priority in discovery",
          "Ad-free experience"
        ],
        "savings": null,
        "popular": false
      },
      {
        "id": "plan_monthly",
        "name": "Monthly",
        "duration": 30,
        "durationUnit": "days",
        "price": 499,
        "currency": "INR",
        "priceFormatted": "₹499/month",
        "features": [
          "All Weekly features",
          "10 super likes/day",
          "Profile boost (1x/week)",
          "Read receipts"
        ],
        "savings": "37%",
        "popular": true
      },
      {
        "id": "plan_quarterly",
        "name": "Quarterly",
        "duration": 90,
        "durationUnit": "days",
        "price": 1199,
        "currency": "INR",
        "priceFormatted": "₹1,199/quarter",
        "features": [
          "All Monthly features",
          "Unlimited super likes",
          "Profile boost (3x/week)",
          "Priority support"
        ],
        "savings": "50%",
        "popular": false
      },
      {
        "id": "plan_yearly",
        "name": "Yearly",
        "duration": 365,
        "durationUnit": "days",
        "price": 2999,
        "currency": "INR",
        "priceFormatted": "₹2,999/year",
        "features": [
          "All Quarterly features",
          "Exclusive badge",
          "500 bonus coins/month",
          "VIP customer support"
        ],
        "savings": "65%",
        "popular": false
      }
    ]
  }
}
```

---

### 11.2 Subscribe to Plan

**API Name:** Purchase Subscription
**Method:** `POST`
**Endpoint:** `/subscriptions/subscribe`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planId": "plan_monthly",
  "paymentMethod": "razorpay",
  "paymentToken": "pay_rzp_sub456xyz",
  "autoRenew": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | string | Yes | Plan ID |
| `paymentMethod` | string | Yes | `razorpay` / `stripe` / `google_play` / `apple_iap` |
| `paymentToken` | string | Yes | Payment token from gateway |
| `autoRenew` | boolean | No | Auto-renew subscription. Default: true |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Subscription activated! Welcome to Mingley Premium",
  "data": {
    "subscriptionId": "sub_v1w2x3",
    "planId": "plan_monthly",
    "planName": "Monthly",
    "status": "active",
    "startDate": "2026-04-23T00:50:00Z",
    "endDate": "2026-05-23T00:50:00Z",
    "autoRenew": true,
    "amountPaid": 499,
    "currency": "INR",
    "features": [
      "Unlimited swipes",
      "10 super likes/day",
      "See who liked you",
      "Undo swipes",
      "Verified users filter",
      "Nearby users filter",
      "50% discount on message coins",
      "25% discount on call coins",
      "Priority in discovery",
      "Ad-free experience",
      "Profile boost (1x/week)",
      "Read receipts"
    ]
  }
}
```

**Response — Error (409):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "You already have an active subscription.",
  "error": {
    "code": "SUBSCRIPTION_ACTIVE",
    "details": ["Your current plan (Monthly) expires on 2026-05-23."]
  }
}
```

**Notes:**
- Users with an active subscription can upgrade but not downgrade.
- Auto-renewal charges 24 hours before expiry.
- Subscription receipt is emailed.

---

### 11.3 Get Subscription Status

**API Name:** Get Current Subscription
**Method:** `GET`
**Endpoint:** `/subscriptions/status`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200) — Active Subscription:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscription status fetched.",
  "data": {
    "hasSubscription": true,
    "subscription": {
      "id": "sub_v1w2x3",
      "planId": "plan_monthly",
      "planName": "Monthly",
      "status": "active",
      "startDate": "2026-04-23T00:50:00Z",
      "endDate": "2026-05-23T00:50:00Z",
      "daysRemaining": 30,
      "autoRenew": true,
      "features": ["..."]
    }
  }
}
```

**Response — Success (200) — No Subscription:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "No active subscription.",
  "data": {
    "hasSubscription": false,
    "subscription": null,
    "upgradeMessage": "Unlock premium features! Starting at ₹199/week."
  }
}
```

---

### 11.4 Cancel Subscription

**API Name:** Cancel Subscription
**Method:** `POST`
**Endpoint:** `/subscriptions/cancel`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "too_expensive",
  "feedback": "I found the pricing a bit high for my budget."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | `too_expensive` / `not_useful` / `found_partner` / `other` |
| `feedback` | string | No | Optional detailed feedback |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Auto-renewal cancelled. Your premium features will remain active until the end of your billing period.",
  "data": {
    "subscriptionId": "sub_v1w2x3",
    "status": "cancelled",
    "activeUntil": "2026-05-23T00:50:00Z",
    "autoRenew": false
  }
}
```

**Notes:**
- Cancellation stops auto-renewal but does not immediately revoke access.
- Premium features remain active until the billing period ends.
- No refund for partial periods.

---

### 11.5 Get Subscription History

**API Name:** Get Subscription History
**Method:** `GET`
**Endpoint:** `/subscriptions/history`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscription history fetched.",
  "data": {
    "subscriptions": [
      {
        "id": "sub_v1w2x3",
        "planName": "Monthly",
        "status": "active",
        "amountPaid": 499,
        "startDate": "2026-04-23T00:50:00Z",
        "endDate": "2026-05-23T00:50:00Z"
      },
      {
        "id": "sub_old001",
        "planName": "Weekly",
        "status": "expired",
        "amountPaid": 199,
        "startDate": "2026-04-01T00:00:00Z",
        "endDate": "2026-04-08T00:00:00Z"
      }
    ]
  }
}
```

---

## 12. Discovery Filter APIs

### 12.1 Save Discovery Filters

**API Name:** Save Discovery Filters
**Method:** `PUT`
**Endpoint:** `/discover/filters`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "ageRange": {
    "min": 22,
    "max": 30
  },
  "maxDistance": 25,
  "genderPreference": "female",
  "verifiedOnly": true,
  "nearbyOnly": true,
  "interests": ["hiking", "photography", "travel"],
  "onlineOnly": false,
  "hasPhotos": true,
  "sortBy": "distance"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ageRange` | object | No | `min` (18-100), `max` (18-100) |
| `maxDistance` | integer | No | Maximum distance in km (1-500) |
| `genderPreference` | string | No | `male` / `female` / `both` |
| `verifiedOnly` | boolean | No | Premium only — show verified profiles only |
| `nearbyOnly` | boolean | No | Premium only — show users within 5km |
| `interests` | string[] | No | Filter by matching interests |
| `onlineOnly` | boolean | No | Show only currently online users |
| `hasPhotos` | boolean | No | Require at least 1 photo |
| `sortBy` | string | No | `distance` / `matchScore` / `lastActive` / `newest` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Filters saved successfully.",
  "data": {
    "filters": {
      "ageRange": { "min": 22, "max": 30 },
      "maxDistance": 25,
      "genderPreference": "female",
      "verifiedOnly": true,
      "nearbyOnly": true,
      "interests": ["hiking", "photography", "travel"],
      "onlineOnly": false,
      "hasPhotos": true,
      "sortBy": "distance"
    },
    "premiumFiltersActive": ["verifiedOnly", "nearbyOnly"],
    "estimatedResults": 45
  }
}
```

**Response — Error (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Premium filters require an active subscription.",
  "error": {
    "code": "PREMIUM_REQUIRED",
    "details": [
      "'verifiedOnly' is a premium feature.",
      "'nearbyOnly' is a premium feature."
    ],
    "premiumFilters": ["verifiedOnly", "nearbyOnly"]
  }
}
```

**Notes:**
- `verifiedOnly` — Only show profiles with verified identity (premium feature).
- `nearbyOnly` — Show profiles within 5km radius (premium feature).
- Non-premium users attempting to use premium filters get a 403 error.
- Filters are persisted and applied to all subsequent `/discover` requests.
- `estimatedResults` gives an approximate count of profiles matching the filters.

---

### 12.2 Get Current Filters

**API Name:** Get Saved Discovery Filters
**Method:** `GET`
**Endpoint:** `/discover/filters`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current filters fetched.",
  "data": {
    "filters": {
      "ageRange": { "min": 22, "max": 30 },
      "maxDistance": 25,
      "genderPreference": "female",
      "verifiedOnly": true,
      "nearbyOnly": true,
      "interests": ["hiking", "photography", "travel"],
      "onlineOnly": false,
      "hasPhotos": true,
      "sortBy": "distance"
    },
    "isPremium": true,
    "availableFilters": {
      "basic": ["ageRange", "maxDistance", "genderPreference", "interests", "onlineOnly", "hasPhotos", "sortBy"],
      "premium": ["verifiedOnly", "nearbyOnly"]
    }
  }
}
```

---

### 12.3 Reset Filters

**API Name:** Reset Discovery Filters to Defaults
**Method:** `DELETE`
**Endpoint:** `/discover/filters`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Filters reset to defaults.",
  "data": {
    "filters": {
      "ageRange": { "min": 18, "max": 50 },
      "maxDistance": 100,
      "genderPreference": "female",
      "verifiedOnly": false,
      "nearbyOnly": false,
      "interests": [],
      "onlineOnly": false,
      "hasPhotos": false,
      "sortBy": "matchScore"
    }
  }
}
```

---

## 13. Notification APIs

### 13.1 Get Notifications

**API Name:** Get User Notifications
**Method:** `GET`
**Endpoint:** `/notifications`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `type` | string | `all` | `match` / `message` / `gift` / `call` / `system` / `all` |
| `unreadOnly` | boolean | false | Show only unread notifications |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications fetched.",
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "type": "match",
        "title": "New Match!",
        "body": "You matched with Jane Smith!",
        "data": {
          "matchId": "mtch_x1y2z3",
          "userId": "usr_f6g7h8i9j0",
          "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg"
        },
        "isRead": false,
        "createdAt": "2026-04-23T00:30:00Z"
      },
      {
        "id": "notif_002",
        "type": "message",
        "title": "New Message",
        "body": "Jane Smith: Hey! How are you?",
        "data": {
          "chatId": "chat_m1n2o3",
          "senderId": "usr_f6g7h8i9j0",
          "messageId": "msg_p1q2r3"
        },
        "isRead": false,
        "createdAt": "2026-04-22T23:45:00Z"
      },
      {
        "id": "notif_003",
        "type": "gift",
        "title": "Gift Received!",
        "body": "Alex Johnson sent you a Diamond Ring!",
        "data": {
          "giftTransactionId": "gtxn_d4e5f6",
          "senderId": "usr_x9y8z7",
          "giftId": "gift_diamond",
          "coinsEarned": 700
        },
        "isRead": true,
        "createdAt": "2026-04-22T22:00:00Z"
      },
      {
        "id": "notif_004",
        "type": "call",
        "title": "Missed Call",
        "body": "You missed a call from Alex Johnson",
        "data": {
          "callId": "call_xyz",
          "callerId": "usr_x9y8z7",
          "callType": "audio"
        },
        "isRead": true,
        "createdAt": "2026-04-22T20:00:00Z"
      },
      {
        "id": "notif_005",
        "type": "system",
        "title": "Welcome Bonus!",
        "body": "You've received 50 coins as a welcome bonus!",
        "data": {
          "coinsAdded": 50,
          "reason": "welcome_bonus"
        },
        "isRead": true,
        "createdAt": "2026-04-01T08:00:00Z"
      }
    ],
    "unreadCount": 2,
    "pagination": { "..." : "..." }
  }
}
```

---

### 13.2 Mark Notification as Read

**API Name:** Mark Notification as Read
**Method:** `PUT`
**Endpoint:** `/notifications/:notificationId/read`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `notificationId` | string | Notification ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read.",
  "data": {
    "notificationId": "notif_001",
    "isRead": true,
    "readAt": "2026-04-23T00:55:00Z"
  }
}
```

---

### 13.3 Mark All Notifications as Read

**API Name:** Mark All Notifications as Read
**Method:** `PUT`
**Endpoint:** `/notifications/read-all`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "All notifications marked as read.",
  "data": {
    "markedCount": 5,
    "readAt": "2026-04-23T00:55:00Z"
  }
}
```

---

### 13.4 Get Unread Notification Count

**API Name:** Get Unread Count
**Method:** `GET`
**Endpoint:** `/notifications/unread-count`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Unread count fetched.",
  "data": {
    "totalUnread": 5,
    "byType": {
      "match": 1,
      "message": 3,
      "gift": 1,
      "call": 0,
      "system": 0
    }
  }
}
```

---

### 13.5 Update Notification Preferences

**API Name:** Update Notification Settings
**Method:** `PUT`
**Endpoint:** `/notifications/settings`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pushEnabled": true,
  "emailEnabled": false,
  "preferences": {
    "matches": true,
    "messages": true,
    "gifts": true,
    "calls": true,
    "likes": true,
    "promotions": false,
    "systemUpdates": true
  }
}
```

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification settings updated.",
  "data": {
    "pushEnabled": true,
    "emailEnabled": false,
    "preferences": {
      "matches": true,
      "messages": true,
      "gifts": true,
      "calls": true,
      "likes": true,
      "promotions": false,
      "systemUpdates": true
    }
  }
}
```

---

## 14. Report / Block User APIs

### 14.1 Report User

**API Name:** Report a User
**Method:** `POST`
**Endpoint:** `/reports`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reportedUserId": "usr_f6g7h8i9j0",
  "reason": "inappropriate_content",
  "description": "User is sending inappropriate messages and fake profile pictures.",
  "evidence": [
    {
      "type": "message",
      "messageId": "msg_abc123"
    },
    {
      "type": "screenshot",
      "imageUrl": "https://cdn.mingley.app/reports/evidence_001.jpg"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reportedUserId` | string | Yes | User being reported |
| `reason` | string | Yes | See reason codes below |
| `description` | string | No | Additional details. Max 1000 chars |
| `evidence` | array | No | Supporting evidence |

**Report Reason Codes:**

| Code | Description |
|------|-------------|
| `fake_profile` | Fake or misleading profile |
| `inappropriate_content` | Inappropriate photos or content |
| `harassment` | Harassment or bullying |
| `spam` | Spam or promotional content |
| `underage` | User appears to be underage |
| `scam` | Financial scam or fraud |
| `offensive_behavior` | Offensive or threatening behavior |
| `other` | Other (requires description) |

**Response — Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Report submitted. Our team will review this within 24 hours.",
  "data": {
    "reportId": "rpt_a1b2c3",
    "status": "under_review",
    "reportedUserId": "usr_f6g7h8i9j0",
    "reason": "inappropriate_content",
    "submittedAt": "2026-04-23T01:00:00Z"
  }
}
```

**Notes:**
- Users can only submit 1 report per user per 24 hours.
- Reports are reviewed by the admin/moderation team.
- Reported user is not notified of the report.
- After 3 confirmed reports, user receives a warning. After 5, account may be suspended.

---

### 14.2 Block User

**API Name:** Block a User
**Method:** `POST`
**Endpoint:** `/users/:userId/block`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID to block |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User blocked successfully.",
  "data": {
    "blockedUserId": "usr_f6g7h8i9j0",
    "blockedAt": "2026-04-23T01:02:00Z"
  }
}
```

**Notes:**
- Blocked users cannot:
  - See the blocker's profile in discovery.
  - Send messages or gifts.
  - Initiate calls.
  - See the blocker in their match list.
- If the users were matched, the match is automatically removed.
- All existing chat messages remain but the chat is disabled.
- Blocking is silent; the blocked user is not notified.

---

### 14.3 Unblock User

**API Name:** Unblock a User
**Method:** `DELETE`
**Endpoint:** `/users/:userId/block`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID to unblock |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User unblocked.",
  "data": {
    "unblockedUserId": "usr_f6g7h8i9j0",
    "unblockedAt": "2026-04-23T01:05:00Z"
  }
}
```

**Notes:**
- Unblocking does not restore the previous match.
- Both users will be able to see each other in discovery again.
- They will need to re-match to chat/call again.

---

### 14.4 Get Blocked Users List

**API Name:** Get Blocked Users
**Method:** `GET`
**Endpoint:** `/users/blocked`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Blocked users fetched.",
  "data": {
    "blockedUsers": [
      {
        "id": "usr_f6g7h8i9j0",
        "fullName": "Jane Smith",
        "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg",
        "blockedAt": "2026-04-23T01:02:00Z"
      }
    ],
    "totalBlocked": 1,
    "pagination": { "..." : "..." }
  }
}
```

---

## 15. Admin APIs

> **Note:** All admin APIs require the `admin` role. Admin tokens include an `admin` claim in the JWT.

### 15.1 Admin Login

**API Name:** Admin Login
**Method:** `POST`
**Endpoint:** `/admin/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@mingley.app",
  "password": "AdminSecure@123",
  "twoFactorCode": "482916"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Admin email |
| `password` | string | Yes | Admin password |
| `twoFactorCode` | string | Yes | 2FA TOTP code |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin login successful.",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "admin": {
      "id": "adm_001",
      "email": "admin@mingley.app",
      "fullName": "Admin User",
      "role": "super_admin",
      "permissions": ["manage_users", "manage_reports", "manage_subscriptions", "manage_content", "view_analytics"]
    }
  }
}
```

**Notes:**
- Admin login requires 2FA (TOTP).
- Admin panel is accessible from a separate admin domain.

---

### 15.2 Get Dashboard Analytics

**API Name:** Admin Dashboard Analytics
**Method:** `GET`
**Endpoint:** `/admin/dashboard`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `7d` | `24h` / `7d` / `30d` / `90d` / `1y` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard data fetched.",
  "data": {
    "period": "7d",
    "users": {
      "total": 50000,
      "newThisPeriod": 1200,
      "activeThisPeriod": 15000,
      "male": 28000,
      "female": 22000,
      "premiumActive": 5000,
      "verified": 12000
    },
    "engagement": {
      "totalMatches": 8500,
      "totalMessages": 125000,
      "totalCalls": 3200,
      "totalGiftsSent": 1500,
      "averageSessionMinutes": 18
    },
    "revenue": {
      "coinPurchases": {
        "totalTransactions": 2500,
        "totalRevenue": 450000,
        "currency": "INR"
      },
      "subscriptions": {
        "totalNew": 800,
        "totalRevenue": 320000,
        "currency": "INR"
      },
      "totalRevenue": 770000,
      "revenueGrowth": "+12%"
    },
    "moderation": {
      "pendingReports": 45,
      "resolvedThisPeriod": 120,
      "usersSuspended": 15,
      "usersBanned": 3
    }
  }
}
```

---

### 15.3 Get All Users (Admin)

**API Name:** Admin — List Users
**Method:** `GET`
**Endpoint:** `/admin/users`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page |
| `search` | string | — | Search by name, email, or phone |
| `gender` | string | — | `male` / `female` |
| `status` | string | — | `active` / `suspended` / `banned` / `unverified` |
| `isPremium` | boolean | — | Filter by premium status |
| `sortBy` | string | `createdAt` | `createdAt` / `lastActive` / `reportCount` |
| `order` | string | `desc` | `asc` / `desc` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched.",
  "data": {
    "users": [
      {
        "id": "usr_a1b2c3d4e5",
        "fullName": "John Doe",
        "email": "user@example.com",
        "phone": "+911234567890",
        "gender": "male",
        "age": 28,
        "status": "active",
        "isPremium": false,
        "isVerified": true,
        "coinBalance": 150,
        "reportCount": 0,
        "matchCount": 24,
        "lastActive": "2026-04-23T00:20:00Z",
        "createdAt": "2026-04-01T08:00:00Z"
      }
    ],
    "pagination": { "..." : "..." }
  }
}
```

---

### 15.4 Get User Details (Admin)

**API Name:** Admin — Get User Details
**Method:** `GET`
**Endpoint:** `/admin/users/:userId`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User details fetched.",
  "data": {
    "id": "usr_a1b2c3d4e5",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phone": "+911234567890",
    "gender": "male",
    "age": 28,
    "bio": "Love hiking and photography",
    "status": "active",
    "isPremium": false,
    "isVerified": true,
    "coinBalance": 150,
    "images": ["..."],
    "interests": ["..."],
    "location": { "..." : "..." },
    "stats": {
      "totalMatches": 24,
      "totalMessages": 450,
      "totalCalls": 12,
      "totalGiftsSent": 8,
      "totalGiftsReceived": 3,
      "totalCoinsPurchased": 2000,
      "totalCoinsSpent": 1850,
      "totalReportsReceived": 0,
      "totalReportsFiled": 1
    },
    "subscription": { "..." : "..." },
    "kycStatus": null,
    "loginHistory": [
      {
        "ip": "103.xx.xx.xx",
        "device": "iPhone 15 Pro",
        "os": "iOS 19.2",
        "loginAt": "2026-04-23T00:15:00Z"
      }
    ],
    "createdAt": "2026-04-01T08:00:00Z",
    "lastActive": "2026-04-23T00:20:00Z"
  }
}
```

---

### 15.5 Suspend/Ban User (Admin)

**API Name:** Admin — Suspend or Ban User
**Method:** `PUT`
**Endpoint:** `/admin/users/:userId/status`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID |

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Multiple reports for inappropriate content.",
  "duration": 7,
  "durationUnit": "days",
  "notifyUser": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | `active` / `suspended` / `banned` |
| `reason` | string | Yes | Reason for status change |
| `duration` | integer | Conditional | Required for `suspended`. Duration of suspension |
| `durationUnit` | string | Conditional | `hours` / `days` / `weeks` |
| `notifyUser` | boolean | No | Send email/notification. Default: true |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User suspended for 7 days.",
  "data": {
    "userId": "usr_f6g7h8i9j0",
    "previousStatus": "active",
    "newStatus": "suspended",
    "suspendedUntil": "2026-04-30T01:10:00Z",
    "reason": "Multiple reports for inappropriate content.",
    "actionBy": "adm_001",
    "actionAt": "2026-04-23T01:10:00Z"
  }
}
```

**Notes:**
- `suspended` = temporary ban with auto-reinstatement.
- `banned` = permanent removal. User cannot re-register with same email/phone.
- All active sessions are terminated.
- User is removed from all discovery feeds.
- Existing matches and chats are preserved but disabled.

---

### 15.6 Get Reports (Admin)

**API Name:** Admin — Get All Reports
**Method:** `GET`
**Endpoint:** `/admin/reports`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page |
| `status` | string | `under_review` | `under_review` / `resolved` / `dismissed` / `all` |
| `reason` | string | — | Filter by report reason |
| `priority` | string | — | `low` / `medium` / `high` / `critical` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reports fetched.",
  "data": {
    "reports": [
      {
        "id": "rpt_a1b2c3",
        "reportedUser": {
          "id": "usr_f6g7h8i9j0",
          "fullName": "Jane Smith",
          "avatar": "https://cdn.mingley.app/avatars/usr_f6g7h8i9j0.jpg",
          "totalReports": 3
        },
        "reportedBy": {
          "id": "usr_a1b2c3d4e5",
          "fullName": "John Doe"
        },
        "reason": "inappropriate_content",
        "description": "User is sending inappropriate messages.",
        "evidence": ["..."],
        "status": "under_review",
        "priority": "medium",
        "submittedAt": "2026-04-23T01:00:00Z"
      }
    ],
    "stats": {
      "totalPending": 45,
      "highPriority": 5,
      "resolvedToday": 12
    },
    "pagination": { "..." : "..." }
  }
}
```

---

### 15.7 Resolve Report (Admin)

**API Name:** Admin — Resolve Report
**Method:** `PUT`
**Endpoint:** `/admin/reports/:reportId`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `reportId` | string | Report ID |

**Request Body:**
```json
{
  "resolution": "action_taken",
  "action": "suspend",
  "actionDetails": {
    "suspensionDuration": 7,
    "durationUnit": "days"
  },
  "adminNotes": "Verified the inappropriate content. User has been warned previously. 7-day suspension issued."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resolution` | string | Yes | `action_taken` / `dismissed` / `warning_issued` |
| `action` | string | Conditional | `none` / `warn` / `suspend` / `ban` / `remove_content` |
| `actionDetails` | object | No | Action-specific details |
| `adminNotes` | string | No | Internal notes |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Report resolved.",
  "data": {
    "reportId": "rpt_a1b2c3",
    "status": "resolved",
    "resolution": "action_taken",
    "action": "suspend",
    "resolvedBy": "adm_001",
    "resolvedAt": "2026-04-23T01:15:00Z"
  }
}
```

---

### 15.8 Manage Subscriptions (Admin)

**API Name:** Admin — Get All Subscriptions
**Method:** `GET`
**Endpoint:** `/admin/subscriptions`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page |
| `status` | string | `all` | `active` / `cancelled` / `expired` / `all` |
| `planId` | string | — | Filter by plan |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscriptions fetched.",
  "data": {
    "subscriptions": [
      {
        "id": "sub_v1w2x3",
        "user": {
          "id": "usr_a1b2c3d4e5",
          "fullName": "John Doe",
          "email": "user@example.com"
        },
        "planId": "plan_monthly",
        "planName": "Monthly",
        "status": "active",
        "amountPaid": 499,
        "startDate": "2026-04-23T00:50:00Z",
        "endDate": "2026-05-23T00:50:00Z",
        "autoRenew": true,
        "paymentMethod": "razorpay"
      }
    ],
    "stats": {
      "totalActive": 5000,
      "monthlyRevenue": 320000,
      "churnRate": "8%"
    },
    "pagination": { "..." : "..." }
  }
}
```

---

### 15.9 Manage Cashout Requests (Admin)

**API Name:** Admin — Get Cashout Requests
**Method:** `GET`
**Endpoint:** `/admin/cashouts`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page |
| `status` | string | `pending` | `pending` / `processing` / `completed` / `rejected` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cashout requests fetched.",
  "data": {
    "cashouts": [
      {
        "id": "wdr_p1q2r3",
        "user": {
          "id": "usr_f6g7h8i9j0",
          "fullName": "Jane Smith",
          "email": "jane@example.com",
          "kycVerified": true
        },
        "coinsWithdrawn": 2000,
        "payoutAmount": 200,
        "payoutCurrency": "INR",
        "paymentMethod": "upi",
        "paymentDetails": {
          "upiId": "janedoe@paytm"
        },
        "status": "pending",
        "requestedAt": "2026-04-23T00:48:00Z"
      }
    ],
    "stats": {
      "totalPending": 15,
      "totalPendingAmount": 8500,
      "completedToday": 12
    },
    "pagination": { "..." : "..." }
  }
}
```

---

### 15.10 Process Cashout (Admin)

**API Name:** Admin — Process Cashout Request
**Method:** `PUT`
**Endpoint:** `/admin/cashouts/:cashoutId`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `cashoutId` | string | Cashout request ID |

**Request Body:**
```json
{
  "action": "approve",
  "transactionRef": "UTR12345678",
  "adminNotes": "Payment processed via UPI."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | `approve` / `reject` |
| `transactionRef` | string | Conditional | Required for `approve`. Bank/UPI transaction reference |
| `rejectionReason` | string | Conditional | Required for `reject`. Reason for rejection |
| `adminNotes` | string | No | Internal notes |

**Response — Success (200) — Approved:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cashout approved and processed.",
  "data": {
    "cashoutId": "wdr_p1q2r3",
    "status": "completed",
    "transactionRef": "UTR12345678",
    "processedBy": "adm_001",
    "processedAt": "2026-04-23T01:20:00Z"
  }
}
```

**Response — Success (200) — Rejected:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cashout rejected. Coins refunded to user.",
  "data": {
    "cashoutId": "wdr_p1q2r3",
    "status": "rejected",
    "rejectionReason": "Invalid UPI ID. Please resubmit with correct details.",
    "coinsRefunded": 2000,
    "processedBy": "adm_001",
    "processedAt": "2026-04-23T01:20:00Z"
  }
}
```

**Notes:**
- Rejected cashouts have their coins refunded to the user's balance.
- User is notified via push notification and email.

---

### 15.11 Admin — Manage Content

**API Name:** Admin — Review Flagged Content
**Method:** `GET`
**Endpoint:** `/admin/content/flagged`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page |
| `type` | string | `all` | `image` / `message` / `profile` |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Flagged content fetched.",
  "data": {
    "flaggedItems": [
      {
        "id": "flag_001",
        "type": "image",
        "userId": "usr_f6g7h8i9j0",
        "userName": "Jane Smith",
        "contentUrl": "https://cdn.mingley.app/photos/flagged_img.jpg",
        "flagReason": "nsfw_detected",
        "confidence": 0.92,
        "flaggedAt": "2026-04-23T00:50:00Z",
        "status": "pending_review"
      }
    ],
    "pagination": { "..." : "..." }
  }
}
```

---

### 15.12 Admin — Moderate Flagged Content

**API Name:** Admin — Action on Flagged Content
**Method:** `PUT`
**Endpoint:** `/admin/content/flagged/:flagId`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "remove",
  "notifyUser": true,
  "warningMessage": "Your photo was removed for violating community guidelines."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | `approve` / `remove` / `ban_user` |
| `notifyUser` | boolean | No | Notify the content owner. Default: true |
| `warningMessage` | string | No | Custom warning message for the user |

**Response — Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Content removed and user notified.",
  "data": {
    "flagId": "flag_001",
    "action": "remove",
    "actionBy": "adm_001",
    "actionAt": "2026-04-23T01:25:00Z"
  }
}
```

---

## 16. Appendix: Error Codes

| Error Code | Description | HTTP Status |
|-----------|-------------|-------------|
| `VALIDATION_ERROR` | Request body validation failed | 422 |
| `INVALID_CREDENTIALS` | Wrong email/password | 401 |
| `INVALID_OTP` | OTP is invalid or expired | 400 |
| `ACCOUNT_UNVERIFIED` | Account pending OTP verification | 403 |
| `DUPLICATE_ACCOUNT` | Email/phone already registered | 409 |
| `USER_NOT_FOUND` | User doesn't exist | 404 |
| `INVALID_REFRESH_TOKEN` | Refresh token expired/invalid | 401 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INSUFFICIENT_COINS` | Not enough coins for action | 402 |
| `PREMIUM_REQUIRED` | Feature requires premium subscription | 403 |
| `SWIPE_LIMIT_REACHED` | Daily swipe limit hit | 403 |
| `MESSAGE_QUOTA_EXHAUSTED` | Free message limit reached | 403 |
| `NOT_MATCHED` | Users are not matched | 403 |
| `USER_BUSY` | User is on another call | 409 |
| `CASHOUT_NOT_AVAILABLE` | Cashout not available for user role | 403 |
| `KYC_REQUIRED` | KYC verification needed | 403 |
| `CASHOUT_LIMIT_EXCEEDED` | Exceeds max cashout percentage | 400 |
| `BELOW_MINIMUM_CASHOUT` | Below minimum cashout amount | 400 |
| `CANNOT_CANCEL` | Cannot cancel processed withdrawal | 400 |
| `SUBSCRIPTION_ACTIVE` | Already has active subscription | 409 |
| `PAYMENT_FAILED` | Payment verification failed | 400 |
| `IMAGE_LIMIT_EXCEEDED` | Max profile images reached | 400 |
| `IMAGE_NOT_FOUND` | Image doesn't exist | 404 |
| `INVALID_TRANSFER` | Invalid coin transfer | 400 |
| `FORBIDDEN` | Action not allowed | 403 |
| `INTERNAL_ERROR` | Server error | 500 |

---

## 17. Appendix: Coin Economy

### 17.1 Coin Earning Sources

| Source | Amount | Notes |
|--------|--------|-------|
| Welcome bonus | 50 coins | On registration + verification |
| Daily login bonus | 10 coins | Once per day |
| Coin purchase | Variable | See coin packages |
| Gift received | 70% of gift value | Platform takes 30% |
| Coin transfer received | 95% of transferred amount | Platform takes 5% |
| Profile completion bonus | 25 coins | When profile is 100% complete |

### 17.2 Coin Spending

| Action | Free User Cost | Premium User Cost |
|--------|---------------|-------------------|
| Send message (male) | 10 coins | 5 coins |
| Send message (female, after free quota) | 5 coins | 3 coins |
| Audio call | 20 coins/min | 15 coins/min |
| Video call | 30 coins/min | 25 coins/min |
| Super like | 50 coins | 50 coins |
| Send gift | Gift-specific price | Gift-specific price |
| Transfer coins | Amount + 5% fee | Amount + 5% fee |

### 17.3 Female Free Message Quota

| Tier | Free Messages per Match |
|------|------------------------|
| Free | 3 messages |
| Premium | 10 messages |

### 17.4 Cashout Conversion

| Coins | INR | |
|-------|---------|
| 100 | ₹10 |
| 500 | ₹50 |
| 1000 | ₹100 |
| 5000 | ₹500 |

- Max cashout: 70% of total balance
- Minimum cashout: 500 coins (₹50)
- Female users only

### 17.5 Swipe Limits

| Tier | Daily Swipes | Daily Super Likes |
|------|-------------|-------------------|
| Free | 50 | 1 |
| Premium | Unlimited | 5 (Weekly), 10 (Monthly+) |

---

## 18. Appendix: WebSocket Events

The real-time communication layer uses WebSocket connections for instant message delivery, call signaling, and live notifications.

**WebSocket URL:** `wss://ws.mingley.app/v1`

### 18.1 Connection

```json
{
  "event": "connect",
  "data": {
    "token": "<jwt_access_token>"
  }
}
```

### 18.2 Events Reference

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:new` | Server to Client | New message received |
| `message:read` | Server to Client | Messages marked as read |
| `message:typing` | Client to Server to Client | User is typing |
| `match:new` | Server to Client | New match created |
| `match:removed` | Server to Client | Match unmatched |
| `call:incoming` | Server to Client | Incoming call |
| `call:answered` | Server to Client | Call answered |
| `call:ended` | Server to Client | Call ended |
| `call:declined` | Server to Client | Call declined |
| `call:balance_warning` | Server to Client | Low balance during call (10s warning) |
| `gift:received` | Server to Client | Gift received |
| `coins:updated` | Server to Client | Coin balance changed |
| `notification:new` | Server to Client | New notification |
| `user:online` | Server to Client | Matched user came online |
| `user:offline` | Server to Client | Matched user went offline |
| `presence:heartbeat` | Client to Server | Keep-alive (every 30s) |

### 18.3 Event Payload Examples

**New Message:**
```json
{
  "event": "message:new",
  "data": {
    "chatId": "chat_m1n2o3",
    "message": {
      "id": "msg_p1q2r3",
      "senderId": "usr_f6g7h8i9j0",
      "text": "Hey! How are you?",
      "type": "text",
      "sentAt": "2026-04-22T23:45:00Z"
    }
  }
}
```

**Incoming Call:**
```json
{
  "event": "call:incoming",
  "data": {
    "callId": "call_d1e2f3",
    "caller": {
      "id": "usr_a1b2c3d4e5",
      "fullName": "John Doe",
      "avatar": "https://cdn.mingley.app/avatars/usr_a1b2c3d4e5.jpg"
    },
    "callType": "audio",
    "rtcToken": "agora_token_here",
    "channelName": "call_d1e2f3"
  }
}
```

**Balance Warning (During Call):**
```json
{
  "event": "call:balance_warning",
  "data": {
    "callId": "call_d1e2f3",
    "remainingBalance": 15,
    "secondsUntilDisconnect": 10,
    "message": "Your balance is low. Call will end in 10 seconds."
  }
}
```

---

## End of Document

**Document Version:** 1.0.0
**Total APIs Documented:** 65+
**Last Updated:** April 23, 2026
**Prepared for:** Mingley Backend Development Team
