

## 🚀 1. What is Mingley? (Project Overview)

**Mingley** is a dating and social matching app (like Tinder or Bumble). 
* **Platforms**: It runs on Android, iOS, and Web browsers.
* **Tech Stack**: Frontend is built using **React Native (with Expo)**, and Backend is built using **ASP.NET Core (C#)** with **PostgreSQL** database.
* **Key Features**:
  1. **Profile Swiping**: Users can swipe right to like, left to pass, or swipe up to superlike/premium upgrade.
  2. **Smart Filters**: Users can filter matches by location, distance, age, interests, and verified status.
  3. **Live Chatting**: Real-time messaging with typing indicators, read receipts, and online/offline status.
  4. **Video & Audio Calling**: Direct calls using **Agora SDK**. It bills the caller "coins" per minute.
  5. **Coin Wallet & Shop**: Users can buy coins using **Razorpay** (UPI, Card, Netbanking) to send superchats or make calls.
  6. **Superchats**: Direct messages that users can send by spending coins, even before matching. If the other person doesn't reply, the coins are refunded.
  7. **Chat Security**: Blocks users from taking screenshots or screen recordings inside private chats.

---

## 🛠️ 2. Tech Stack & Why We Used It (Simple Reasons)

When the interviewer asks: **"Why did you choose these technologies?"**, tell them these points:

* **React Native (Expo)**: 
  * *Reason*: Single codebase for Android, iOS, and Web. We don't need to write separate code for Java/Kotlin and Swift. Expo makes it very fast to test and build.
* **Zustand (State Management)**: 
  * *Reason*: It is extremely simple to use. Redux has too much boilerplate code (actions, reducers, types) which makes it heavy. React Context causes unnecessary re-renders of components. Zustand is super lightweight and works outside React components too (which is very useful for WebSockets).
* **SignalR (WebSockets)**: 
  * *Reason*: We needed live chatting. SignalR handles real-time bidirectional communication. It has built-in auto-reconnect feature, so if the user's mobile internet fluctuates, it automatically reconnects.
* **Agora RTC**: 
  * *Reason*: It is the best service for video and audio calls. There is almost zero lag, quality is automatically adjusted based on network speed, and it works globally.
* **Razorpay**: 
  * *Reason*: The most popular payment gateway in India. It supports UPI (GPay, PhonePe, Paytm), net banking, and cards out of the box with very simple integration.
* **AsyncStorage**: 
  * *Reason*: Simple local database to save user's login tokens (`accessToken` and `refreshToken`), so they don't have to log in again and again when they open the app.
* **Expo Screen Capture**: 
  * *Reason*: High privacy. It disables screen recording and blackouts screenshots inside the chat screen so users feel safe.

---

## 📐 3. Main System Flows (How things work)

Here are the two main technical flows you should explain to the interviewer:

### Flow 1: Video/Audio Calling Flow (SignalR + Agora)
How does calling connect between two users?
1. **Initiate Call**: Caller calls the backend API `POST /v1/calls/initiate`. The backend checks coins, locks some balance, generates an Agora Token, and returns it.
2. **Alerting Callee**: Backend sends a SignalR WebSocket event called `IncomingCall` to the Callee.
3. **Ringing Screen**: Callee's app receives this event and opens the `CallingScreen` with a ringing tone.
4. **Answer Call**: Callee taps "Accept", calling backend API `POST /v1/calls/{id}/answer` to get their Agora token.
5. **Connecting Media**: Callee joins the Agora channel. Simultaneously, the backend sends a `CallAnswered` SignalR event to the Caller.
6. **Live Streaming**: The Caller also joins the Agora channel. Now, direct video/audio streaming starts via Agora servers.
7. **Per-Minute Billing**: Every 60 seconds, the client checks the balance. The backend also tracks the exact duration and deducts coins from the database once the call ends.

---

### Flow 2: Auto Login & Token Refresh Flow
How do we keep the user logged in for a long time securely?
1. When the user opens the app, we check if an `accessToken` is saved in local storage.
2. If it is there, we call the profile API `/v1/users/me` using Axios.
3. If the token is valid, the user goes straight to the home screen.
4. If the token has expired, the server returns a `401 Unauthorized` error.
5. Our **Axios Interceptor** automatically catches this 401 error, stops the main request, and calls the refresh API `/v1/auth/refresh` with the stored `refreshToken`.
6. If the refresh token is valid, we get new tokens, save them to storage, and automatically retry the original API call. The user does not see any login screen or error message.
7. If the refresh token is also expired, we clear storage and redirect the user to the Login page.

---

## 💡 4. Smart Engineering Decisions (How we handled tricky parts)

You can impress the interviewer by sharing these engineering solutions:

### 1. Web Platform Compatibility (Anti-Crash Solution)
* **Problem**: Native SDKs like Agora (`react-native-agora`) and Razorpay only work on real mobile devices. If we run the code on Web browsers, the app will instantly crash.
* **Solution**: We check the platform using `Platform.OS === 'web'`. We dynamically import native modules using a `try-catch` block. If it fails (like on web), we substitute it with mock (dummy) classes. The calling screen still opens on Web, but simulates the call flows with dummy actions so the web version never crashes.

### 2. Browser Ringing Sound Generator
* **Problem**: Playing audio files dynamically on web browsers has security blocks and slow loading issues.
* **Solution**: Instead of loading an `.mp3` file, we used the browser's native **Web Audio API** (`AudioContext`). We generate dialing tones (440Hz + 480Hz) and ringing tones (480Hz + 540Hz) programmatically using digital oscillators. It is very light and works instantly without downloading sound files.

### 3. Smart Local Session Guard
* **Problem**: If the user's internet is slow or off when they open the app, the profile API will fail. If we logout the user on every API failure, it will annoy them.
* **Solution**: We check the error code. We only logout the user if the server explicitly rejects the credentials with a `401` or `403` code. For regular network timeouts or offline errors, we keep them logged in locally.

---

## ❓ 5. Common Interview Questions & Simple Answers

### Q1: Why did you use Zustand instead of Redux?
> **Answer**: "Sir/Ma'am, Redux is good, but it has too much boilerplate code. You have to write slices, reducers, actions, and map them. It makes the code very bulky for small to medium apps. 
> 
> Zustand is very simple. We can create a store in just 5 lines. It uses React hooks, so components only subscribe to the state they need, avoiding extra re-renders. Also, we can update Zustand stores directly from outside React components, like inside our WebSocket service. This is very hard to do in Redux."

### Q2: How does the wallet billing work? What if a user shuts down their internet during a call to save coins?
> **Answer**: "On the client side, we run a 60-second timer to deduct coins locally and show the updated balance. If coins run out, the client ends the call.
> 
> But for security, the **backend server is the final authority**. When the call ends, the backend calculates the difference between `EndTime` and `StartTime` from the database logs. It rounds it up to the next minute and deducts the final coins. Even if the user disconnects their internet, the socket connection drops, the backend detects the disconnect, ends the call database entry, and deducts the correct coins. No one can cheat the system."

### Q3: How do you handle JWT Token Refresh?
> **Answer**: "We use an Axios interceptor. It acts like a middleman for API calls. If an API returns a `401 Unauthorized` (meaning token expired), the interceptor stops the flow, hits the `/v1/auth/refresh` API using the `refreshToken`, saves the new access token to AsyncStorage, and retries the original API call. The user doesn't see anything, everything happens silently in the background."

### Q4: How did you make the app compatible with Web if Agora and Razorpay are native libraries?
> **Answer**: "I used conditional logic. Before calling native code, we check if the platform is web. If it is web, we bypass the native library calls. For example, in calling, we run a mock simulation on web that behaves exactly like Agora events. For payment, we can fallback to standard web URL checkouts instead of native SDK. This keeps the single codebase working on Android, iOS, and Web browsers."

### Q5: How did you block screenshots in the chat screen?
> **Answer**: "We used `expo-screen-capture` library. On the private chat screen, we call the hook `usePreventScreenCapture()`. This binds to the native Android and iOS operating system flags. On Android, it enables `FLAG_SECURE` on the window layout, which blocks screenshots and shows a black screen during screen recordings. When the user exits the chat screen, the block is removed."
