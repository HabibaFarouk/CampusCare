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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "name, email, and password are required"}`
    *   **400 Bad Request:** `{"error": "Invalid role. Use MEMBER, FACILITY_MANAGER, WORKER, or ADMIN"}`
    *   **400 Bad Request:** `{"error": "Email already registered"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "email and password are required"}`
    *   **401 Unauthorized:** `{"error": "User not found"}` OR `{"error": "Invalid password"}`
    *   **403 Forbidden:** `{"error": "Account is deactivated"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error"}`

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
*   **Sample Error Responses:**
    *   **401 Unauthorized:** `{"error": "Unauthorized"}` (Standard from auth middleware)

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
*   **Sample Error Responses:**
    *   **404 Not Found:** `{"error": "User not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Token and new password are required"}`
    *   **400 Bad Request:** `{"error": "Invalid or expired reset token"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Nothing to update"}`
    *   **409 Conflict:** `{"error": "Email already in use"}`
    *   **500 Internal Server Error:** `{"error": "Failed to update profile"}`

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
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid notification id"}`
    *   **404 Not Found:** `{"error": "Notification not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "title, description, category, and location are required"}`
    *   **400 Bad Request:** `{"error": "Invalid category. Use one of: MAINTENANCE, CLEANLINESS, SUSTAINABILITY"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid status. Use one of: SUBMITTED, ASSIGNED, IN_PROGRESS, FINISHED, FINALIZED, RESOLVED, CANCELLED"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Assigned tickets cannot be edited"}` OR `{"error": "Cannot edit ticket when status is ..."}` OR `{"error": "No fields provided for update"}`
    *   **403 Forbidden:** `{"error": "Not authorized to edit this ticket"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Only unassigned submitted issues can be deleted"}`
    *   **403 Forbidden:** `{"error": "Not authorized to delete this ticket"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}`
    *   **403 Forbidden:** `{"error": "Access denied"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid status..."}` OR `{"error": "Invalid category..."}` OR `{"error": "assignedToId must be a valid id..."}` OR `{"error": "startDate must be a valid date string"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Valid workerId is required"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}` OR `{"error": "Worker not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Invalid status..."}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Ticket already finalized"}` OR `{"error": "Cannot finalize ticket when status is..."}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **401 Unauthorized:** `{"error": "Unauthorized"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Ticket already started/finished/finalized"}` OR `{"error": "Cannot start ticket when status is..."}`
    *   **403 Forbidden:** `{"error": "Not authorized to start this ticket"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Ticket already finished/finalized"}` OR `{"error": "Cannot finish ticket when status is..."}`
    *   **403 Forbidden:** `{"error": "Not authorized to finish this ticket"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}`
    *   **403 Forbidden:** `{"error": "Access denied"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Comment text is required"}` OR `{"error": "Ticket has no assignee; assign a worker first"}`
    *   **403 Forbidden:** `{"error": "Only workers, facility managers, or admins can perform this action"}` OR `{"error": "Not authorized to comment on this ticket"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "photoUrl is required"}`
    *   **403 Forbidden:** `{"error": "Only workers or admins can perform this action"}` OR `{"error": "Not authorized to upload photo for this ticket"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"message": "Invalid worker id"}`
    *   **404 Not Found:** `{"error": "Worker not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"message": "Invalid worker id"}` OR `{"message": "Status is required"}` OR `{"message": "Status must be 'active' or 'inactive'"}`
    *   **404 Not Found:** `{"error": "Worker not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

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
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Failed to fetch users"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid user id"}` OR `{"error": "isActive must be boolean"}`
    *   **404 Not Found:** `{"error": "User not found"}`
    *   **500 Internal Server Error:** `{"error": "Failed to update user status"}`

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
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid user id"}` OR `{"error": "Invalid role provided"}`
    *   **404 Not Found:** `{"error": "User not found"}`
    *   **500 Internal Server Error:** `{"error": "Failed to update user role"}`
