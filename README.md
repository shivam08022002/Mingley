 Mingley API — Developer Guide

## 🌐 Live API
```
https://mingley-backend-v2.onrender.com
```

## 📖 Swagger UI
```
https://mingley-backend-v2.onrender.com/swagger/index.html
```

## 🖥️ Admin Panel
```
https://mingley-backend-v2.onrender.com/admin/index.html
```
- **Email:** `admin@mingley.app`
- **Password:** `Mingley@123`

---

## 🔑 Test Accounts

> **Universal Password for all accounts:** `Mingley@123`

### 👨 Male Users
| Name | Email | Coins | Premium |
|---|---|---|---|
| Arjun Singh | `arjun@demo.com` | 10,000 | ✅ Gold |
| Rahul Mehta | `rahul@demo.com` | 5,000 | ❌ |
| Vikram Nair | `vikram@demo.com` | 3,000 | ❌ |
| Deepak Verma | `deepak@demo.com` | 500 | ❌ |
| Aman Joshi | `aman@demo.com` | 6,000 | ✅ Gold |

### 👩 Female Users
| Name | Email | Coins | Premium | Online |
|---|---|---|---|---|
| Priya Sharma | `priya@demo.com` | 2,500 | ✅ Gold | 🟢 |
| Shreya Patel | `shreya@demo.com` | 3,500 | ✅ Gold | 🟢 |
| Neha Kapoor | `neha@demo.com` | 800 | ❌ | 🟢 |
| Aisha Khan | `aisha@demo.com` | 1,800 | ❌ | 🟢 |
| Pooja Gupta | `pooja@demo.com` | 950 | ❌ | 🟢 |

---

## 🔐 Authentication

All protected endpoints require JWT Bearer token in header:
```
Authorization: Bearer <token>
```

### Register
```http
POST /v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "password": "Password@123",
  "gender": "male",
  "dateOfBirth": "1995-01-01T00:00:00Z"
}
```

### Verify OTP
```http
POST /v1/auth/verify-otp
Content-Type: application/json

{
  "userId": "<userId from register>",
  "otp": "123456",
  "purpose": "registration"
}
```

### Login
```http
POST /v1/auth/login
Content-Type: application/json

{
  "identifier": "arjun@demo.com",
  "password": "Mingley@123",
  "fcmToken": ""
}
```
**Response:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "user": { "id": "...", "fullName": "Arjun Singh", ... }
  }
}
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/auth/register` | Register new user |
| POST | `/v1/auth/verify-otp` | Verify OTP |
| POST | `/v1/auth/resend-otp` | Resend OTP |
| POST | `/v1/auth/login` | Login |
| POST | `/v1/auth/refresh` | Refresh token |
| POST | `/v1/auth/logout` | Logout |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/users/me` | Get my profile |
| PUT | `/v1/users/me` | Update profile |
| PUT | `/v1/users/me/interests` | Update interests |
| PUT | `/v1/users/me/preferences` | Update preferences |
| POST | `/v1/users/me/images` | Add image |
| DELETE | `/v1/users/me/images/{id}` | Delete image |
| POST | `/v1/users/{id}/block` | Block user |
| POST | `/v1/users/{id}/report` | Report user |

### Discover
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/discover` | Get discover feed |
| POST | `/v1/discover/swipe` | Swipe (like/pass) |
| GET | `/v1/matches` | Get matches |
| DELETE | `/v1/matches/{matchId}` | Decline match |

**Discover Query Params:**
```
?page=1&limit=20&interestedIn=girls&distance=50&ageRange[]=18&ageRange[]=40&onlineStatus=false&verifiedOnly=false
```

**Swipe Body:**
```json
{ "targetId": "<userId>", "action": "like" }
```
Actions: `like`, `pass`, `superlike`

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/chats` | Get all chats |
| GET | `/v1/chats/{chatId}/messages` | Get messages |
| POST | `/v1/chats/{chatId}/messages` | Send message |
| PUT | `/v1/chats/{chatId}/read` | Mark as read |

**Send Message Body:**
```json
{
  "content": "Hello!",
  "messageType": "TEXT"
}
```

### Calls
| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/calls/initiate` | Start a call |
| POST | `/v1/calls/{id}/answer` | Answer call |
| POST | `/v1/calls/{id}/decline` | Decline call |
| POST | `/v1/calls/{id}/end` | End call |
| GET | `/v1/calls/{id}/agora-token` | Get Agora token |
| GET | `/v1/calls/history` | Call history |

**Initiate Call Body:**
```json
{ "targetId": "<userId>", "callType": "audio" }
```
Call types: `audio`, `video`

### Wallet
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/wallet/balance` | Get coin balance |
| GET | `/v1/wallet/packages` | Get coin packages |
| GET | `/v1/wallet/transactions` | Get transactions |
| POST | `/v1/wallet/razorpay/order` | Create Razorpay order |
| POST | `/v1/wallet/razorpay/verify` | Verify payment |
| POST | `/v1/wallet/deposit` | Request deposit |
| POST | `/v1/wallet/withdraw` | Request withdrawal |

### Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/subscriptions/plans` | Get plans |
| GET | `/v1/subscriptions/status` | Get my subscription |
| POST | `/v1/subscriptions/subscribe` | Subscribe to plan |

### Gifts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/gifts/catalog` | Get gift catalog |
| POST | `/v1/gifts/send` | Send a gift |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/notifications` | Get notifications |
| GET | `/v1/notifications/unread-count` | Unread count |
| PUT | `/v1/notifications/{id}/read` | Mark read |
| PUT | `/v1/notifications/read-all` | Mark all read |

### Interests
| Method | Endpoint | Description |
|---|---|---|
| GET | `/v1/interests` | Get all interests |

---

## 🔌 SignalR (Real-time)

**Hub URLs:**
```
wss://mingley-backend-v2.onrender.com/hubs/chat
wss://mingley-backend-v2.onrender.com/hubs/notifications
```

Pass JWT token as query param:
```
/hubs/chat?access_token=<token>
```

**Chat Hub Events:**
| Event | Direction | Description |
|---|---|---|
| `ReceiveMessage` | Server → Client | New message received |
| `UserTyping` | Server → Client | User is typing |
| `UserStoppedTyping` | Server → Client | User stopped typing |
| `UserOnline` | Server → Client | User came online |
| `UserOffline` | Server → Client | User went offline |
| `IncomingCall` | Server → Client | Incoming call |
| `CallAnswered` | Server → Client | Call answered |
| `CallDeclined` | Server → Client | Call declined |
| `CallEnded` | Server → Client | Call ended |

**Notification Hub Events:**
| Event | Direction | Description |
|---|---|---|
| `NewMatch` | Server → Client | New match |
| `NewNotification` | Server → Client | New notification |

---

## 💰 Subscription Plans

| Plan | Price | Duration | Video Calls |
|---|---|---|---|
| Silver | ₹299 | 30 days | ❌ |
| Gold | ₹599 | 30 days | ✅ |
| Platinum | ₹999 | 30 days | ✅ |

---

## 🔧 Third-party Keys (Test Mode)

| Service | Key |
|---|---|
| Razorpay Key ID | `rzp_test_Sq4maCpZVgCTeM` |
| Agora App ID | `8592b7de7bec4f0a9b1ef2a0a79279f6` |

---

## ⚠️ Notes

- Free Render instance **sleeps after 15 min** of inactivity — first request takes ~50 seconds to wake up
- OTP in production requires SMS gateway (MSG91/Twilio) — use demo accounts for testing
- Video/Audio calls require native APK build — does not work in Expo Go
- All amounts in **paise** for Razorpay (₹1 = 100 paise)

---

## 📞 Quick Test Flow

1. Login as `arjun@demo.com` / `Mingley@123` → get token
2. Call `GET /v1/discover` to see female profiles
3. Call `POST /v1/discover/swipe` with `action: "like"`
4. Login as `priya@demo.com` on another device → swipe right on Arjun
5. Both get matched → chat unlocks
6. Send messages via `POST /v1/chats/{chatId}/messages`




















This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
