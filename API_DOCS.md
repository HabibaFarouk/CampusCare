# CampusCare API Documentation

## 1. Authentication & Password Management

### Register User
*   **Method:** `POST`
*   **URL:** `/auth/register`
*   **Auth Role:** None
*   **Sample Request Body:**
    ```jsonc
    {
      "name": "John Doe",             // String
      "email": "johndoe@example.com", // String
      "password": "securepassword123",// String
      "role": "MEMBER",               // String (Enum: 'MEMBER', 'FACILITY_MANAGER', 'WORKER', 'ADMIN')
      "phoneNumber": "1234567890"     // String (Optional)
    }
    ```
*   **Sample Success Response (201 Created):**
    ```jsonc
    {
      "message": "Registration successful",   // String
      "accessToken": "eyJhbGciOiJIUzI1Ni...", // String
      "user": {
        "id": 1,                              // Integer
        "name": "John Doe",                   // String
        "email": "johndoe@example.com",       // String
        "role": "MEMBER",                     // String
        "phoneNumber": "1234567890"           // String
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
    ```jsonc
    {
      "email": "habiba@gmail.com", // String
      "password": "Beno@2006"      // String
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "accessToken": "eyJhbGciOiJIUzI1Ni...", // String
      "user": {
        "id": 2,                              // Integer
        "name": "Habiba",                     // String
        "email": "habiba@gmail.com",          // String
        "role": "MEMBER"                      // String
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
    ```jsonc
    {
      "message": "Logged out successfully" // String
    }
    ```
*   **Sample Error Responses:**
    *   **401 Unauthorized:** `{"error": "Unauthorized"}` (Standard from auth middleware)

### Forgot Password
*   **Method:** `POST`
*   **URL:** `/auth/forgot-password`
*   **Auth Role:** None
*   **Sample Request Body:**
    ```jsonc
    {
      "email": "habiba@gmail.com" // String
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "Password reset token generated", // String
      "resetToken": "eyJhbGciOiJIUzI1Ni..."        // String
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
    ```jsonc
    {
      "token": "eyJhbGciOiJIUzI1Ni...",          // String
      "newPassword": "newsecurepassword123"      // String
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "Password has been reset successfully" // String
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
    ```jsonc
    {
      "name": "Habiba Updated",       // String (Optional)
      "email": "habiba_new@gmail.com" // String (Optional)
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "user": {
        "id": 2,                         // Integer
        "name": "Habiba Updated",        // String
        "email": "habiba_new@gmail.com", // String
        "role": "MEMBER",                // String
        "isActive": true                 // Boolean
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
*   **URL:** `/notifications` (Supports Query Parameter: `?unreadOnly=true` (Boolean))
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    [
      {
        "id": 1,                                    // Integer
        "userId": 2,                                // Integer
        "message": "New issue submitted: Broken pipe",// String
        "isRead": false,                            // Boolean
        "createdAt": "2026-05-15T10:00:00.000Z"     // DateTime (String)
      }
    ]
    ```
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Mark Notification Read
*   **Method:** `PUT`
*   **URL:** `/notifications/:id/read`
*   **Path Parameters:** `id` (Integer) - ID of the notification
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "Notification marked as read" // String
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
    ```jsonc
    {
      "message": "All notifications marked as read", // String
      "count": 3                                     // Integer
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
    ```jsonc
    {
      "title": "Broken AC",                         // String
      "description": "AC in room 101 is not cooling.",// String
      "category": "MAINTENANCE",                    // String (Enum: 'MAINTENANCE', 'CLEANLINESS', 'SUSTAINABILITY')
      "location": "Room 101",                       // String
      "imageUrl": "https://example.com/image.jpg"   // String (Optional)
    }
    ```
*   **Sample Success Response (201 Created):**
    ```jsonc
    {
      "id": 1,                                      // Integer
      "title": "Broken AC",                         // String
      "description": "AC in room 101 is not cooling.",// String
      "status": "SUBMITTED",                        // String
      "category": "MAINTENANCE",                    // String
      "location": "Room 101",                       // String
      "imageUrl": "https://example.com/image.jpg",  // String | Null
      "createdById": 2,                             // Integer
      "createdAt": "2026-05-15T10:00:00.000Z",      // DateTime (String)
      "createdBy": {
        "id": 2,                                    // Integer
        "name": "Habiba",                           // String
        "email": "habiba@gmail.com"                 // String
      }
    }
    ```
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "title, description, category, and location are required"}`
    *   **400 Bad Request:** `{"error": "Invalid category. Use one of: MAINTENANCE, CLEANLINESS, SUSTAINABILITY"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Get My Issues
*   **Method:** `GET`
*   **URL:** `/issues/my` (Supports Query Parameter: `?status=SUBMITTED` (String Enum))
*   **Auth Role:** `MEMBER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    [
      {
        "id": 1,                                  // Integer
        "title": "Broken AC",                     // String
        "status": "SUBMITTED",                    // String
        "category": "MAINTENANCE",                // String
        "location": "Room 101",                   // String
        "assignedTo": null,                       // Object | Null
        "createdAt": "2026-05-15T10:00:00.000Z"   // DateTime (String)
      }
    ]
    ```
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid status. Use one of: SUBMITTED, ASSIGNED, IN_PROGRESS, FINISHED, FINALIZED, RESOLVED, CANCELLED"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Update My Issue
*   **Method:** `PUT`
*   **URL:** `/issues/:id/member`
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `MEMBER`, `ADMIN`
*   **Note:** Only possible if status is `SUBMITTED` and ticket is unassigned.
*   **Sample Request Body:**
    ```jsonc
    {
      "title": "Broken AC Updated", // String (Optional)
      "location": "Room 102"        // String (Optional)
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,                                        // Integer
      "title": "Broken AC Updated",                   // String
      "description": "AC in room 101 is not cooling.",// String
      "location": "Room 102",                         // String
      "status": "SUBMITTED",                          // String
      "createdBy": {
        "id": 2,                                      // Integer
        "name": "Habiba",                             // String
        "email": "habiba@gmail.com"                   // String
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
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `MEMBER`, `ADMIN`
*   **Note:** Only possible if status is `SUBMITTED` and ticket is unassigned.
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "Issue deleted" // String
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
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** Any Authenticated User (Authorization logic inside controller)
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,                                        // Integer
      "title": "Broken AC Updated",                   // String
      "description": "AC in room 101 is not cooling.",// String
      "location": "Room 102",                         // String
      "status": "ASSIGNED",                           // String
      "category": "MAINTENANCE",                      // String
      "imageUrl": "https://example.com/image.jpg",    // String | Null
      "completionPhotoUrl": null,                     // String | Null
      "createdById": 2,                               // Integer
      "assignedToId": 3,                              // Integer | Null
      "createdAt": "2026-05-15T10:00:00.000Z",        // DateTime (String)
      "updatedAt": "2026-05-15T11:00:00.000Z",        // DateTime (String)
      "assignedTo": {
        "id": 3,                                      // Integer
        "name": "Ahmed",                              // String
        "email": "ahmeds@gmail.com"                   // String
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
*   **URL:** `/issues`
*   **Query Parameters:**
    *   `status` (String Enum - Optional)
    *   `category` (String Enum - Optional)
    *   `assignedToId` (Integer or "unassigned" - Optional)
    *   `startDate` (DateTime String - Optional)
    *   `endDate` (DateTime String - Optional)
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    [
      {
        "id": 1,                                  // Integer
        "title": "Broken AC Updated",             // String
        "status": "SUBMITTED",                    // String
        "category": "MAINTENANCE",                // String
        "location": "Room 102",                   // String
        "createdBy": { 
          "name": "Habiba",                       // String
          "email": "habiba@gmail.com"             // String
        },
        "assignedTo": null,                       // Object | Null
        "createdAt": "2026-05-15T10:00:00.000Z"   // DateTime (String)
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
    ```jsonc
    [
      {
        "id": 1,                                  // Integer
        "title": "Broken AC Updated",             // String
        "status": "SUBMITTED",                    // String
        "createdBy": { 
          "name": "Habiba",                       // String
          "email": "habiba@gmail.com"             // String
        },
        "createdAt": "2026-05-15T10:00:00.000Z"   // DateTime (String)
      }
    ]
    ```
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Assign Issue to Worker
*   **Method:** `PUT`
*   **URL:** `/issues/:id/assign`
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:**
    ```jsonc
    {
      "workerId": 3 // Integer
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,                                        // Integer
      "status": "ASSIGNED",                           // String
      "assignedToId": 3,                              // Integer
      "createdBy": { "name": "Habiba" },              // Object
      "assignedTo": { 
        "name": "Ahmed",                              // String
        "email": "ahmeds@gmail.com"                   // String
      }
    }
    ```
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Valid workerId is required"}`
    *   **404 Not Found:** `{"error": "Ticket not found"}` OR `{"error": "Worker not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Update Issue Status
*   **Method:** `PUT`
*   **URL:** `/issues/:id/status`
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `FACILITY_MANAGER`, `WORKER`, `ADMIN`
*   **Sample Request Body:**
    ```jsonc
    {
      "status": "RESOLVED" // String (Enum: 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'FINISHED', 'FINALIZED', 'RESOLVED', 'CANCELLED')
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,                                        // Integer
      "status": "RESOLVED",                           // String
      "createdBy": { "name": "Habiba" },              // Object
      "assignedTo": { "name": "Ahmed" }               // Object
    }
    ```
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Invalid status..."}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Close Issue (Finalize)
*   **Method:** `PUT`
*   **URL:** `/issues/:id/close`
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Note:** Ticket must be in `FINISHED` status before it can be closed (FINALIZED).
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,               // Integer
      "status": "FINALIZED"  // String
    }
    ```
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid ticket id"}` OR `{"error": "Ticket already finalized"}` OR `{"error": "Cannot finalize ticket when status is..."}`
    *   **404 Not Found:** `{"error": "Ticket not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Delete Issue (Manager/Admin override)
*   **Method:** `DELETE`
*   **URL:** `/issues/:id`
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "Issue deleted successfully" // String
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
    ```jsonc
    [
      {
        "id": 1,                                        // Integer
        "title": "Broken AC Updated",                   // String
        "description": "AC in room 101 is not cooling.",// String
        "category": "MAINTENANCE",                      // String
        "status": "ASSIGNED",                           // String
        "imageUrl": null,                               // String | Null
        "completionPhotoUrl": null,                     // String | Null
        "createdAt": "2026-05-15T10:00:00.000Z",        // DateTime (String)
        "assignedTo": { 
          "id": 3,                                      // Integer
          "name": "Ahmed",                              // String
          "email": "ahmeds@gmail.com"                   // String
        }
      }
    ]
    ```
*   **Sample Error Responses:**
    *   **401 Unauthorized:** `{"error": "Unauthorized"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Start Issue
*   **Method:** `PUT`
*   **URL:** `/issues/:id/start`
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `WORKER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,                                        // Integer
      "title": "Broken AC Updated",                   // String
      "description": "AC in room 101 is not cooling.",// String
      "category": "MAINTENANCE",                      // String
      "status": "IN_PROGRESS",                        // String
      "createdAt": "2026-05-15T10:00:00.000Z",        // DateTime (String)
      "assignedTo": { 
        "id": 3,                                      // Integer
        "name": "Ahmed",                              // String
        "email": "ahmeds@gmail.com"                   // String
      }
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
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `WORKER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,                                        // Integer
      "title": "Broken AC Updated",                   // String
      "description": "AC in room 101 is not cooling.",// String
      "category": "MAINTENANCE",                      // String
      "status": "FINISHED",                           // String
      "createdAt": "2026-05-15T10:00:00.000Z",        // DateTime (String)
      "assignedTo": { 
        "id": 3,                                      // Integer
        "name": "Ahmed",                              // String
        "email": "ahmeds@gmail.com"                   // String
      }
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
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** Any Authenticated User
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    [
      {
        "id": 1,                                      // Integer
        "text": "I will start working on this tomorrow.",// String
        "ticketId": 1,                                // Integer
        "workerId": 3,                                // Integer
        "createdAt": "2026-05-15T12:00:00.000Z",      // DateTime (String)
        "worker": {
          "id": 3,                                    // Integer
          "name": "Ahmed",                            // String
          "email": "ahmeds@gmail.com"                 // String
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
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `WORKER`, `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:**
    ```jsonc
    {
      "text": "I will start working on this tomorrow." // String
    }
    ```
*   **Sample Success Response (201 Created):**
    ```jsonc
    {
      "id": 1,                                        // Integer
      "text": "I will start working on this tomorrow.",// String
      "ticketId": 1,                                  // Integer
      "workerId": 3,                                  // Integer
      "createdAt": "2026-05-15T12:00:00.000Z"         // DateTime (String)
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
*   **Path Parameters:** `id` (Integer) - ID of the issue
*   **Auth Role:** `WORKER`, `ADMIN`
*   **Sample Request Body:**
    ```jsonc
    {
      "photoUrl": "https://example.com/completion-photo.jpg" // String
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 1,                                                  // Integer
      "title": "Broken AC Updated",                             // String
      "status": "FINISHED",                                     // String
      "completionPhotoUrl": "https://example.com/completion-photo.jpg", // String
      "assignedTo": { 
        "id": 3,                                                // Integer
        "name": "Ahmed",                                        // String
        "email": "ahmeds@gmail.com"                             // String
      }
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
    ```jsonc
    {
      "message": "Workers fetched successfully",                // String
      "data": [
        {
          "id": 3,                                              // Integer
          "name": "Ahmed",                                      // String
          "email": "ahmeds@gmail.com",                          // String
          "role": "WORKER",                                     // String
          "isActive": true,                                     // Boolean
          "createdAt": "2026-05-10T08:00:00.000Z"               // DateTime (String)
        }
      ]
    }
    ```
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Get Worker Details
*   **Method:** `GET`
*   **URL:** `/manager/workers/:id`
*   **Path Parameters:** `id` (Integer) - ID of the worker
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:** None
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "id": 3,                                                  // Integer
      "name": "Ahmed",                                          // String
      "email": "ahmeds@gmail.com",                              // String
      "role": "WORKER",                                         // String
      "isActive": true,                                         // Boolean
      "createdAt": "2026-05-10T08:00:00.000Z",                  // DateTime (String)
      "activeTasks": 2,                                         // Integer
      "resolvedTasks": 15                                       // Integer
    }
    ```
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"message": "Invalid worker id"}`
    *   **404 Not Found:** `{"error": "Worker not found"}`
    *   **500 Internal Server Error:** `{"error": "Internal server error message"}`

### Update Worker Status
*   **Method:** `PUT`
*   **URL:** `/manager/workers/:id/status`
*   **Path Parameters:** `id` (Integer) - ID of the worker
*   **Auth Role:** `FACILITY_MANAGER`, `ADMIN`
*   **Sample Request Body:**
    ```jsonc
    {
      "status": "inactive" // String (Enum: 'active', 'inactive')
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "Worker 3 status updated to inactive",         // String
      "data": {
        "id": 3,                                                // Integer
        "name": "Ahmed",                                        // String
        "email": "ahmeds@gmail.com",                            // String
        "role": "WORKER",                                       // String
        "isActive": false                                       // Boolean
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
    ```jsonc
    {
      "totalIssues": 20,                                        // Integer
      "resolvedIssues": 12,                                     // Integer
      "submittedIssues": 3,                                     // Integer
      "inProgressIssues": 5,                                    // Integer
      "activeWorkers": 4                                        // Integer
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
    ```jsonc
    [
      {
        "workerId": 3,                                          // Integer
        "name": "Ahmed",                                        // String
        "activeTasksCount": 2                                   // Integer
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
    ```jsonc
    [
      {
        "id": 1,                                                // Integer
        "name": "Mashy Okay",                                   // String
        "email": "mashyokay@gmail.com",                         // String
        "role": "ADMIN",                                        // String
        "phoneNumber": "123456",                                // String
        "isActive": true,                                       // Boolean
        "createdAt": "2026-05-01T08:00:00.000Z"                 // DateTime (String)
      }
    ]
    ```
*   **Sample Error Responses:**
    *   **500 Internal Server Error:** `{"error": "Failed to fetch users"}`

### Update User Status
*   **Method:** `PUT`
*   **URL:** `/admin/users/:id/status`
*   **Path Parameters:** `id` (Integer) - ID of the user
*   **Auth Role:** `ADMIN`
*   **Sample Request Body:**
    ```jsonc
    {
      "isActive": false // Boolean
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "User deactivated successfully",               // String
      "user": {
        "id": 2,                                                // Integer
        "name": "Habiba",                                       // String
        "email": "habiba@gmail.com",                            // String
        "role": "MEMBER",                                       // String
        "isActive": false                                       // Boolean
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
*   **Path Parameters:** `id` (Integer) - ID of the user
*   **Auth Role:** `ADMIN`
*   **Sample Request Body:**
    ```jsonc
    {
      "role": "FACILITY_MANAGER" // String (Enum: 'MEMBER', 'FACILITY_MANAGER', 'WORKER', 'ADMIN')
    }
    ```
*   **Sample Success Response (200 OK):**
    ```jsonc
    {
      "message": "Role updated successfully",                   // String
      "user": {
        "id": 2,                                                // Integer
        "name": "Habiba",                                       // String
        "role": "FACILITY_MANAGER"                              // String
      }
    }
    ```
*   **Sample Error Responses:**
    *   **400 Bad Request:** `{"error": "Invalid user id"}` OR `{"error": "Invalid role provided"}`
    *   **404 Not Found:** `{"error": "User not found"}`
    *   **500 Internal Server Error:** `{"error": "Failed to update user role"}`
