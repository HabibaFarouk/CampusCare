# CampusCare API Documentation

## 1. Authentication & Password Management

### Register User
*   **Method:** `POST`
*   **URL:** `/auth/register`
*   **Auth Role:** None
*   **Sample Request Body:**
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "securepassword123",
      "role": "MEMBER",
      "phoneNumber": "1234567890"
    }
    ```
*   **Sample Success Response (201 Created):**
    ```json
    {
      "message": "Registration successful",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "MEMBER",
        "phoneNumber": "1234567890"
      }
    }
    ```

### Login User
*   **Method:** `POST`
*   **URL:** `/auth/login`
*   **Auth Role:** None
*   **Sample Request Body:**
    ```json
    {
      "email": "habiba@gmail.com",
      "password": "Beno@2006"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
      "user": {
        "id": 2,
        "name": "Habiba",
        "email": "habiba@gmail.com",
        "role": "MEMBER"
      }
    }
    ```

### Logout User
*   **Method:** `POST`
*   **URL:** `/auth/logout`
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Logged out successfully"
    }
    ```

### Forgot Password
*   **Method:** `POST`
*   **URL:** `/auth/forgot-password`
*   **Auth Role:** None
*   **Sample Request Body:**
    ```json
    {
      "email": "habiba@gmail.com"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Password reset token generated",
      "resetToken": "eyJhbGciOiJIUzI1NiIsInR..."
    }
    ```

### Reset Password
*   **Method:** `POST`
*   **URL:** `/auth/reset-password`
*   **Auth Role:** None
*   **Sample Request Body:**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR...",
      "newPassword": "newsecurepassword123"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Password has been reset successfully"
    }
    ```

### Update My Profile
*   **Method:** `PUT`
*   **URL:** `/users/me`
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:**
    ```json
    {
      "name": "Habiba Updated",
      "email": "habiba_new@gmail.com"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "user": {
        "id": 2,
        "name": "Habiba Updated",
        "email": "habiba_new@gmail.com",
        "role": "MEMBER",
        "isActive": true
      }
    }
    ```

---

## 2. Notifications

### Get Notifications
*   **Method:** `GET`
*   **URL:** `/notifications` (Supports `?unreadOnly=true`)
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "userId": 2,
        "message": "New issue submitted: Broken pipe",
        "isRead": false,
        "createdAt": "2026-05-15T10:00:00.000Z"
      }
    ]
    ```

### Mark Notification Read
*   **Method:** `PUT`
*   **URL:** `/notifications/:id/read`
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Notification marked as read"
    }
    ```

### Mark All Notifications Read
*   **Method:** `PUT`
*   **URL:** `/notifications/read-all`
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "All notifications marked as read",
      "count": 3
    }
    ```

---

## 3. Community Member Flows

### Create Issue
*   **Method:** `POST`
*   **URL:** `/issues`
*   **Auth Role:** `MEMBER`, `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "title": "Broken AC",
      "description": "AC in room 101 is not cooling.",
      "category": "MAINTENANCE",
      "location": "Room 101",
      "imageUrl": "https://example.com/image.jpg"
    }
    ```
*   **Sample Success Response (201 Created):**
    ```json
    {
      "id": 1,
      "title": "Broken AC",
      "description": "AC in room 101 is not cooling.",
      "status": "SUBMITTED",
      "category": "MAINTENANCE",
      "location": "Room 101",
      "imageUrl": "https://example.com/image.jpg",
      "createdById": 2,
      "createdAt": "2026-05-15T10:00:00.000Z",
      "createdBy": {
        "id": 2,
        "name": "Habiba",
        "email": "habiba@gmail.com"
      }
    }
    ```

### Get My Issues
*   **Method:** `GET`
*   **URL:** `/issues/my` (Supports `?status=SUBMITTED`)
*   **Auth Role:** `MEMBER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "title": "Broken AC",
        "status": "SUBMITTED",
        "category": "MAINTENANCE",
        "location": "Room 101",
        "assignedTo": null,
        "createdAt": "2026-05-15T10:00:00.000Z"
      }
    ]
    ```

### Update My Issue
*   **Method:** `PUT`
*   **URL:** `/issues/:id/member`
*   **Auth Role:** `MEMBER`, `ADMIN`
*   **Note:** Only possible if status is `SUBMITTED` and ticket is unassigned.
*   **Sample Request Body:**
    ```json
    {
      "title": "Broken AC Updated",
      "location": "Room 102"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "title": "Broken AC Updated",
      "description": "AC in room 101 is not cooling.",
      "location": "Room 102",
      "status": "SUBMITTED",
      "createdBy": {
        "id": 2,
        "name": "Habiba",
        "email": "habiba@gmail.com"
      }
    }
    ```

### Delete My Issue
*   **Method:** `DELETE`
*   **URL:** `/issues/:id/member`
*   **Auth Role:** `MEMBER`, `ADMIN`
*   **Note:** Only possible if status is `SUBMITTED` and ticket is unassigned.
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Issue deleted"
    }
    ```

### Get Issue Status (Two Routes)
*   **Method:** `GET`
*   **URL:** `/issues/:id/status`  OR  `/api/issues/:id`
*   **Auth Role:** Any Authenticated User (Authorization logic inside controller)
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "title": "Broken AC Updated",
      "description": "AC in room 101 is not cooling.",
      "location": "Room 102",
      "status": "ASSIGNED",
      "category": "MAINTENANCE",
      "imageUrl": "https://example.com/image.jpg",
      "completionPhotoUrl": null,
      "createdById": 2,
      "assignedToId": 3,
      "createdAt": "2026-05-15T10:00:00.000Z",
      "updatedAt": "2026-05-15T11:00:00.000Z",
      "assignedTo": {
        "id": 3,
        "name": "Ahmed",
        "email": "ahmeds@gmail.com"
      }
    }
    ```

---

## 4. Facility Manager Flows

### Get All Issues
*   **Method:** `GET`
*   **URL:** `/issues` (Supports `?status=...&category=...&assignedToId=...&startDate=...&endDate=...`)
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "title": "Broken AC Updated",
        "status": "SUBMITTED",
        "category": "MAINTENANCE",
        "location": "Room 102",
        "createdBy": { "name": "Habiba", "email": "habiba@gmail.com" },
        "assignedTo": null,
        "createdAt": "2026-05-15T10:00:00.000Z"
      }
    ]
    ```

### Get Prioritized Issues
*   **Method:** `GET`
*   **URL:** `/issues/prioritized`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "title": "Broken AC Updated",
        "status": "SUBMITTED",
        "createdBy": { "name": "Habiba", "email": "habiba@gmail.com" },
        "createdAt": "2026-05-15T10:00:00.000Z"
      }
    ]
    ```

### Assign Issue to Worker
*   **Method:** `PUT`
*   **URL:** `/issues/:id/assign`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "workerId": 3
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "status": "ASSIGNED",
      "assignedToId": 3,
      "createdBy": { "name": "Habiba" },
      "assignedTo": { "name": "Ahmed", "email": "ahmeds@gmail.com" }
    }
    ```

### Update Issue Status
*   **Method:** `PUT`
*   **URL:** `/issues/:id/status`
*   **Auth Role:** `FACILITY_MANAGER`, `WORKER`, `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "status": "RESOLVED"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "status": "RESOLVED",
      "createdBy": { "name": "Habiba" },
      "assignedTo": { "name": "Ahmed" }
    }
    ```

### Close Issue (Finalize)
*   **Method:** `PUT`
*   **URL:** `/issues/:id/close`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Note:** Ticket must be in `FINISHED` status before it can be closed (FINALIZED).
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "status": "FINALIZED"
    }
    ```

### Delete Issue (Manager/Admin override)
*   **Method:** `DELETE`
*   **URL:** `/issues/:id`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Issue deleted successfully"
    }
    ```

---

## 5. Worker Flows

### Get Assigned Issues
*   **Method:** `GET`
*   **URL:** `/issues/assigned`
*   **Auth Role:** `WORKER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "title": "Broken AC Updated",
        "description": "AC in room 101 is not cooling.",
        "category": "MAINTENANCE",
        "status": "ASSIGNED",
        "imageUrl": null,
        "completionPhotoUrl": null,
        "createdAt": "2026-05-15T10:00:00.000Z",
        "assignedTo": { "id": 3, "name": "Ahmed", "email": "ahmeds@gmail.com" }
      }
    ]
    ```

### Start Issue
*   **Method:** `PUT`
*   **URL:** `/issues/:id/start`
*   **Auth Role:** `WORKER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "title": "Broken AC Updated",
      "description": "AC in room 101 is not cooling.",
      "category": "MAINTENANCE",
      "status": "IN_PROGRESS",
      "createdAt": "2026-05-15T10:00:00.000Z",
      "assignedTo": { "id": 3, "name": "Ahmed", "email": "ahmeds@gmail.com" }
    }
    ```

### Finish Issue
*   **Method:** `PUT`
*   **URL:** `/issues/:id/finish`
*   **Auth Role:** `WORKER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "title": "Broken AC Updated",
      "description": "AC in room 101 is not cooling.",
      "category": "MAINTENANCE",
      "status": "FINISHED",
      "createdAt": "2026-05-15T10:00:00.000Z",
      "assignedTo": { "id": 3, "name": "Ahmed", "email": "ahmeds@gmail.com" }
    }
    ```

### Get Issue Comments
*   **Method:** `GET`
*   **URL:** `/issues/:id/comments`
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "text": "I will start working on this tomorrow.",
        "ticketId": 1,
        "workerId": 3,
        "createdAt": "2026-05-15T12:00:00.000Z",
        "worker": {
          "id": 3,
          "name": "Ahmed",
          "email": "ahmeds@gmail.com"
        }
      }
    ]
    ```

### Add Comment
*   **Method:** `POST`
*   **URL:** `/issues/:id/comments`
*   **Auth Role:** `WORKER`, `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "text": "I will start working on this tomorrow."
    }
    ```
*   **Sample Success Response (201 Created):**
    ```json
    {
      "id": 1,
      "text": "I will start working on this tomorrow.",
      "ticketId": 1,
      "workerId": 3,
      "createdAt": "2026-05-15T12:00:00.000Z"
    }
    ```

### Upload Completion Photo
*   **Method:** `POST`
*   **URL:** `/issues/:id/photo`
*   **Auth Role:** `WORKER`, `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "photoUrl": "https://example.com/completion-photo.jpg"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "title": "Broken AC Updated",
      "status": "FINISHED",
      "completionPhotoUrl": "https://example.com/completion-photo.jpg",
      "assignedTo": { "id": 3, "name": "Ahmed", "email": "ahmeds@gmail.com" }
    }
    ```

---

## 6. Manager Dashboards & Worker Management

### Get Workers
*   **Method:** `GET`
*   **URL:** `/manager/workers`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Workers fetched successfully",
      "data": [
        {
          "id": 3,
          "name": "Ahmed",
          "email": "ahmeds@gmail.com",
          "role": "WORKER",
          "isActive": true,
          "createdAt": "2026-05-10T08:00:00.000Z"
        }
      ]
    }
    ```

### Get Worker Details
*   **Method:** `GET`
*   **URL:** `/manager/workers/:id`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "id": 3,
      "name": "Ahmed",
      "email": "ahmeds@gmail.com",
      "role": "WORKER",
      "isActive": true,
      "createdAt": "2026-05-10T08:00:00.000Z",
      "activeTasks": 2,
      "resolvedTasks": 15
    }
    ```

### Update Worker Status
*   **Method:** `PUT`
*   **URL:** `/manager/workers/:id/status`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "status": "inactive"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Worker 3 status updated to inactive",
      "data": {
        "id": 3,
        "name": "Ahmed",
        "email": "ahmeds@gmail.com",
        "role": "WORKER",
        "isActive": false
      }
    }
    ```

### Get Dashboard KPIs
*   **Method:** `GET`
*   **URL:** `/manager/dashboard`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    {
      "totalIssues": 20,
      "resolvedIssues": 12,
      "submittedIssues": 3,
      "inProgressIssues": 5,
      "activeWorkers": 4
    }
    ```

### Get Worker Workloads
*   **Method:** `GET`
*   **URL:** `/manager/workloads`
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "workerId": 3,
        "name": "Ahmed",
        "activeTasksCount": 2
      }
    ]
    ```

---

## 7. System Admin Flows

### Get All Users
*   **Method:** `GET`
*   **URL:** `/admin/users`
*   **Auth Role:** `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "Mashy Okay",
        "email": "mashyokay@gmail.com",
        "role": "ADMIN",
        "phoneNumber": "123456",
        "isActive": true,
        "createdAt": "2026-05-01T08:00:00.000Z"
      }
    ]
    ```

### Update User Status
*   **Method:** `PUT`
*   **URL:** `/admin/users/:id/status`
*   **Auth Role:** `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "isActive": false
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "User deactivated successfully",
      "user": {
        "id": 2,
        "name": "Habiba",
        "email": "habiba@gmail.com",
        "role": "MEMBER",
        "isActive": false
      }
    }
    ```

### Update User Role
*   **Method:** `PUT`
*   **URL:** `/admin/users/:id/role`
*   **Auth Role:** `ADMIN`
*   **Sample Request Body:**
    ```json
    {
      "role": "FACILITY_MANAGER"
    }
    ```
*   **Sample Success Response (200 OK):**
    ```json
    {
      "message": "Role updated successfully",
      "user": {
        "id": 2,
        "name": "Habiba",
        "role": "FACILITY_MANAGER"
      }
    }
    ```
