# CampusCare Project Structure

This document gives a concise overview of the CampusCare frontend and backend folder layout.

## Backend/

The backend provides REST APIs, authentication, and database access.

- `Backend/index.js` — application entry point and HTTP server startup.
- `Backend/src/app.js` — Express setup, middleware, and route registration.
- `Backend/src/Controllers/` — controller functions for user auth, tickets, comments, notifications, and audit logs.
- `Backend/src/Routes/` — API route definitions that map HTTP endpoints to controllers.
- `Backend/src/middleware/auth.js` — JWT auth middleware and role-based access checks.
- `Backend/src/prismaClient.js` — Prisma client configuration and database connection pooling.
- `Backend/prisma/schema.prisma` — database model definitions for users, tickets, comments, notifications, and audit logs.

### Backend key models

- `User` — application users with roles, credentials, and profile data.
- `Ticket` — maintenance reports that can be assigned, updated, and closed.
- `Comment` — worker comments attached to tickets.
- `Notification` — user notifications for ticket updates.
- `AuditLog` — history of ticket changes for accountability.
- `Role`, `Status`, `Category` enums — define allowed roles, ticket states, and issue categories.

## mobile/

The mobile app is built with Expo and connects to backend APIs plus Supabase storage.

- `mobile/App.js` — root Expo component that initializes app providers and navigation.
- `mobile/app.json` — Expo configuration for app metadata and permissions.
- `mobile/babel.config.js` — Babel setup for Expo.
- `mobile/package.json` — mobile dependencies and start scripts.

### mobile/src/

- `src/auth/AuthContext.js` — authentication state, login/logout flows, and secure token storage.
- `src/auth/RoleGate.js` — route gating to restrict access by user role.
- `src/navigation/AppNavigator.js` — main app navigator that switches between auth state and role-based tabs.
- `src/navigation/RoleTabs.js` — bottom tab layout for different user roles.
- `src/screens/` — user-facing screens organized by role:
  - `admin/` — admin management screens
  - `manager/` — facility manager dashboards and worker management
  - `member/` — issue reporting and member dashboards
  - `shared/` — login, registration, issue detail, notifications, and profile screens
  - `worker/` — assigned task management screens
- `src/components/` — reusable UI building blocks:
  - `common/` — buttons, cards, inputs, headers, and badges
  - `issues/` — issue cards, comments, and photo upload UIs
  - `manager/` — KPI widgets and worker rows
- `src/api/` — network clients for backend API and Supabase integration.
- `src/services/supabaseStorage.js` — image upload and public URL handling for Supabase buckets.
- `src/utils/` — constants, error handling, notification context, and secure storage abstractions.
- `src/theme.js` — shared color and theme settings for the app.

## Overview

- Backend handles authentication, database operations, and issue workflows.
- Mobile frontend provides role-based UI and uploads images to Supabase storage.
- Environment variables in `Backend/.env` and `mobile/.env` connect each part to services.
- The backend and mobile app are kept separate so the API can be developed independently from the mobile UI.
