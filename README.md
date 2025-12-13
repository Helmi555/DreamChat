# 🎉 DreamChat — Modern Expo Chat App

![Expo](https://img.shields.io/badge/Expo-48CFAD?logo=expo&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=000) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=fff)

DreamChat is an Expo + TypeScript mobile chat client with real-time messaging, group invites, reactions (emoji), typing indicators, read receipts, and media sharing. The app uses Firebase Authentication and Firebase Realtime Database for identity, presence, and message delivery, and Supabase Storage (buckets) to host user media (images, audio, video).

<p align="center">
  <img src="assets/screenshots/Dream Chat.png" alt="Loading screen" style="border-radius:10px; max-width:100%; height:auto;" />
</p>

Features
- Realtime 1:1 chats and group chats
- Group creation and real-time invitations
- Direct messages, message reactions, typing indicators, and read receipts
- Upload and share media (images/audio/video) stored in Supabase
- Firebase Authentication (Email, Google, Phone as configured)
- Profiles, edit profile images and chat backgrounds
- Theme support and basic settings

Tech stack
- Expo managed workflow (React Native)
- TypeScript
- Firebase Auth + Firebase Realtime Database (for realtime sync & presence)
- Supabase Storage for media
- React Navigation, Context API and a small services layer (src/services)

Firebase (Auth + Realtime DB)
- Firebase Auth manages sign-in flow (email/social/phone depending on your Firebase console setup).
- Realtime Database is used for:
  - Presence (online/offline)
  - Typing indicators
  - Message delivery with low latency
- Example Realtime DB structure:
```
/users/{userId}            // profile info
/chats/{chatId}            // participants[], lastMessage, updatedAt
/chats/{chatId}/messages/{messageId}  // senderId, text, mediaUrl, createdAt, reactions
/groups/{groupId}          // name, members[], pendingInvites[], metadata
```
- Typical listeners: on('child_added') for new messages, on('value') for small data (presence).

Supabase Storage (media)
- Create a Supabase project and a storage bucket (recommended `chat-media`).
- Public bucket example:
  `https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path-to-file.jpg>`
- Private bucket: use signed URLs for access (recommended in production).
- Upload flow: client uploads media via `src/services/supabaseImageService.ts`, receives URL, attach to message object in Realtime DB.

Gallery:
<table>
  <tr>
    <td align="center">Loading / Splash<br/><img src="assets/screenshots/Screenshot_1765660902.png" alt="Loading screen" width="240"/></td>
    <td align="center">Sign In<br/><img src="assets/screenshots/Screenshot_1765661006.png" alt="Sign in" width="240"/></td>
    <td align="center">Home / Chats<br/><img src="assets/screenshots/Screenshot_1765661042.png" alt="Home screen" width="240"/></td>
    <td align="center">Chat View<br/><img src="assets/screenshots/Screenshot_1765661059.png" alt="Chat" width="240"/></td>
  </tr>
  <tr>
    <td align="center">Groups / Create Group<br/><img src="assets/screenshots/Screenshot_1765661113.png" alt="Groups" width="240"/></td>
    <td align="center">Start Chat / New Chat<br/><img src="assets/screenshots/Screenshot_1765661186.png" alt="Start chat" width="240"/></td>
    <td align="center">Message Reactions / Media<br/><img src="assets/screenshots/Screenshot_1765661207.png" alt="Message reaction" width="240"/></td>
    <td align="center">Edit Profile<br/><img src="assets/screenshots/Screenshot_1765661216.png" alt="Edit Profile" width="240"/></td>
  </tr>
  <tr>
    <td align="center">Alt Chat<br/><img src="assets/screenshots/Screenshot_1765661221.png" alt="Alt Chat" width="240"/></td>
    <td align="center">Settings<br/><img src="assets/screenshots/Screenshot_1765661246.png" alt="Settings" width="240"/></td>
    <td></td>
    <td></td>
  </tr>
</table>

---

Quick start (development)
Prereqs:
- Node.js (>= 18)
- npm or yarn
- Expo CLI (optional): `npm install -g expo-cli`

Clone & run:
```powershell
git clone https://github.com/Helmi555/DreamChat.git
cd "DreamChat"
npm install
npx expo start
```
Open the Expo DevTools and run on a simulator or device.

Environment variables / config
- Add keys to `src/configs/firebase.js` and `src/configs/supabase.js` or use a `.env` approach and import them.
Required keys:
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY

Key files & structure (important)
- App.tsx — Expo entry
- src/context/UserContext.tsx — auth & session helpers
- src/services/messageService.ts — message send/listen flow
- src/services/groupsService.ts — groups & invites
- src/services/supabaseImageService.ts — upload + signed URL helpers
- src/configs/firebase.js — Firebase config
- src/configs/supabase.js — Supabase config
- src/screens — UI screens
- assets/screenshots — screenshots used in README and docs

Messaging & media flow (summary)
- Sign in via Firebase Auth.
- App initializes realtime listeners for chats and groups.
- Sending a message with media:
  1. Upload to Supabase bucket.
  2. Store returned URL in message object in Realtime Database.
  3. Notify participants via realtime listeners.
- Reactions are small maps on message objects (e.g., { "❤️": ["uid1","uid2"] }).

Security short notes
- Do not commit service-role keys to the client.
- Use private Supabase buckets + signed URLs for production media.
- Limit large data within Realtime DB items to reduce network payload and costs.

Contributing
- Fork → Branch → PR.
- Add or update screenshots when UI changes.
- Consider adding `.env.example`, linting, and CI checks in future PRs.

License & contact
- Add a LICENSE file to the repo root (MIT recommended).
- Maintainer: Helmi555 — https://github.com/Helmi555/DreamChat