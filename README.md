# CampusCare

CampusCare is a campus maintenance mobile application for the German International University (GIU).
It supports reporting maintenance issues, managing assignments, and tracking task progress across roles.

## Prerequisites

- Node.js 18 or newer
- npm (included with Node.js)
- Expo CLI installed globally, or use `npx expo`:
  ```bash
  npm install --global expo-cli
  ```
- PostgreSQL database or Supabase PostgreSQL
- Supabase project for image storage (optional but recommended)
- A code editor such as VS Code

## Local Setup

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd Backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on your environment and fill in the values:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://user:password@host:port/dbname
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_SECRET=your_password_reset_secret
   NODE_ENV=development
   ```
4. Generate the Prisma client:
   ```bash
   npm run postinstall
   ```
5. Apply the Prisma schema to your database:
   ```bash
   npm run db:push
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Mobile App Setup

1. Open a terminal and navigate to the mobile folder:
   ```bash
   cd mobile
   ```
2. Install mobile dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `mobile/` with your Supabase and API settings:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_SUPABASE_BUCKET=Images
   ```
4. Start the Expo development server:
   ```bash
   npm start
   ```
5. Launch the app on an emulator or physical device:
   ```bash
   npm run android
   npm run ios
   ```

> If you run the app on a physical device, make sure `EXPO_PUBLIC_API_URL` points to your machine's local network IP address instead of `localhost`.

## Environment Variables

### Backend

- `PORT` — port for the backend server
- `DATABASE_URL` — PostgreSQL connection URL
- `JWT_ACCESS_SECRET` — secret used for access token signing
- `JWT_REFRESH_SECRET` — secret used for refresh token signing
- `JWT_SECRET` — secret used for password reset token signing
- `NODE_ENV` — set to `development` or `production`

### Mobile

- `EXPO_PUBLIC_API_URL` — backend API base URL used by the mobile app
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous client key
- `EXPO_PUBLIC_SUPABASE_BUCKET` — Supabase storage bucket name for images

## Third-Party Service Setup

### PostgreSQL / Supabase

- Create a PostgreSQL database locally or on Supabase.
- Use the database connection string in `Backend/.env`.
- Prisma will create tables and models using `npm run db:push`.

### Supabase Storage

- Create a Supabase project or use an existing one.
- Create a storage bucket named `Images` (or update `EXPO_PUBLIC_SUPABASE_BUCKET`).
- Provide the Supabase URL and anonymous key in `mobile/.env`.

## Project Structure Overview

### Backend

- `Backend/index.js` — server entry point and HTTP listener.
- `Backend/src/app.js` — Express app setup with middleware and routes.
- `Backend/src/Controllers/` — controller functions for tickets, users, authentication, notifications, and comments.
- `Backend/src/Routes/` — API route definitions.
- `Backend/src/middleware/auth.js` — JWT-based authentication and role authorization.
- `Backend/src/prismaClient.js` — Prisma client configuration and database connection.
- `Backend/prisma/schema.prisma` — database schema for users, tickets, comments, notifications, and audit logs.

### Mobile

- `mobile/App.js` — root Expo component and app providers.
- `mobile/src/auth/` — authentication context and role gating logic.
- `mobile/src/navigation/` — app navigation structure and role-based tabs.
- `mobile/src/screens/` — screens for member, worker, manager, and admin flows.
- `mobile/src/components/` — reusable UI components and issue-related UI.
- `mobile/src/api/` — mobile API client wrappers and Supabase client config.
- `mobile/src/services/` — Supabase image upload and storage helpers.
- `mobile/src/utils/` — shared constants, secure storage, error handling, and notification context.

For a more detailed file-level overview, see `PROJECT_STRUCTURE.md`.

## Notes

- The backend is built with Express and Prisma.
- The mobile app is built with Expo and connects to backend APIs plus Supabase storage.
- Use secure secrets management in production and do not commit `.env` files.

## Contribution

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Open a pull request

## License

This project is provided for academic and development purposes.

