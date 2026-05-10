# Memory Journal — Mobile (React Native / Expo)

The mobile client for the backend in `../backend`.

## Quick start

```bash
cd mobile
npm install
cp .env.example .env      # set EXPO_PUBLIC_API_URL
npm start
```

Then in the terminal:

- Press **i** — iOS simulator (Mac + Xcode).
- Press **a** — Android emulator (Android Studio).
- Scan the QR with the **Expo Go** app on your phone (same Wi-Fi as laptop).

## API URL cheat sheet

| Where you run the app | `EXPO_PUBLIC_API_URL` value    |
|------------------------|--------------------------------|
| iOS simulator          | `http://localhost:3000`        |
| Android emulator       | `http://10.0.2.2:3000`         |
| Real phone (Expo Go)   | `http://<laptop-LAN-IP>:3000`  |

## File layout

```
mobile/
├── App.js                          # root: AuthProvider + stack navigator
├── app.json                        # Expo config (permissions, plugins)
├── babel.config.js
├── .env.example
├── package.json
└── src/
    ├── api/
    │   └── client.js               # fetch wrapper with auth header + upload
    ├── auth/
    │   └── AuthContext.js          # Context + SecureStore session persistence
    ├── components/
    │   └── MemoryCard.js           # single row in the memories list
    └── screens/
        ├── LoginScreen.js
        ├── SignupScreen.js
        ├── HomeScreen.js           # FlatList + pull-to-refresh + FAB
        ├── CreateMemoryScreen.js   # image picker + upload
        └── MemoryDetailScreen.js   # full view + delete
```

## Teaching flow

Follow [`../docs/MOBILE_GUIDE.md`](../docs/MOBILE_GUIDE.md) step by step —
it's the live-coding script with Why/What/Type for each part.
