# API Documentation - Multi-Tenant SaaS Platform

## Overview

**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Bearer Token  
**Content-Type:** application/json  
**Default Port:** 5000

## Authentication

All endpoints except `/auth/register-tenant`, `/auth/login`, and `/health` require JWT authentication.

### Request Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response on Unauthorized (401)

```json
{
  "error": "Unauthorized: Invalid or expired token"
}
```

---

## 1. Authentication Endpoints

### 1.1 Register Tenant

**Endpoint:** `POST /auth/register-tenant`  
**Auth Required:** No  
**Rate Limit:** 10 requests per minute

**Request Body:**

```json
{
  "tenantName": "Test Corp",
  "subdomain": "testcorp",
  "adminEmail": "admin@testcorp.com",
  "adminPassword": "Password123!",
  "adminFullName": "Test Admin"
}
```

**Validation:**

- `tenantName`: Required, 1-100 characters
- `subdomain`: Required, 3-63 characters, alphanumeric + hyphens only, must be unique
- `adminEmail`: Required, valid email format
- `adminPassword`: Required, minimum 8 characters
- `adminFullName`: Required, 1-100 characters

**Success Response (201):**

```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
    "subdomain": "testcorp",
    "adminUser": {
      "id": "5e4e9da2-28c0-48f1-98e9-5c9bd32645ea",
      "email": "admin@testcorp.com",
      "full_name": "Test Admin",
      "role": "tenant_admin"
    }
  }
}
```

**Error Responses:**

409 Conflict - Subdomain already exists:

```json
{
  "error": "Subdomain 'testcorp' is already taken"
}
```

400 Bad Request - Validation error:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "param": "tenantName",
      "msg": "Tenant name is required"
    },
    {
      "param": "subdomain",
      "msg": "Subdomain must be 3-63 characters"
    }
  ]
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Corp",
    "subdomain": "testcorp",
    "adminEmail": "admin@testcorp.com",
    "adminPassword": "Password123!",
    "adminFullName": "Test Admin"
  }'
```

---

### 1.2 Login

**Endpoint:** `POST /auth/login`  
**Auth Required:** No  
**Rate Limit:** 5 requests per minute per IP

**Request Body:**

```json
{
  "tenantSubdomain": "testcorp",
  "email": "admin@testcorp.com",
  "password": "Password123!"
}
```

**Validation:**

- `tenantSubdomain`: Required, must exist
- `email`: Required, valid email format
- `password`: Required, must match user's password hash

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "5e4e9da2-28c0-48f1-98e9-5c9bd32645ea",
      "email": "admin@testcorp.com",
      "fullName": "Test Admin",
      "role": "tenant_admin",
      "tenantId": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
      "tenant": {
        "id": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
        "name": "Test Corp",
        "subdomain": "testcorp",
        "status": "active"
      }
    },
    "token": "eyJhbGciOiJIUzI1Ni...",
    "expiresIn": 86400
  }
}
```

**Error Responses:**

401 Unauthorized - Invalid credentials:

```json
{
  "error": "Invalid tenant, email, or password"
}
```

403 Forbidden - Tenant suspended:

```json
{
  "error": "Tenant account is suspended"
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSubdomain": "testcorp",
    "email": "admin@testcorp.com",
    "password": "Password123!"
  }'
```

---

### 1.3 Get Current User

**Endpoint:** `GET /auth/me`  
**Auth Required:** Yes  
**Method:** GET

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "5e4e9da2-28c0-48f1-98e9-5c9bd32645ea",
    "email": "admin@testcorp.com",
    "fullName": "Test Admin",
    "role": "tenant_admin",
    "isActive": true,
    "tenant": {
      "id": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
      "name": "Test Corp",
      "subdomain": "testcorp",
      "subscriptionPlan": "free",
      "maxUsers": 5,
      "maxProjects": 3
    }
  }
}
```

**Error Responses:**

401 Unauthorized - No valid token:

```json
{
  "error": "Unauthorized: Invalid or expired token"
}
```

**Curl Example:**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

### 1.4 Logout

**Endpoint:** `POST /auth/logout`  
**Auth Required:** Yes  
**Method:** POST

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** Backend logs logout event. Client should delete JWT from localStorage.

**Curl Example:**

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

## 2. Tenant Management Endpoints

### 2.1 Get Tenant Details

**Endpoint:** `GET /tenants/:tenantId`  
**Auth Required:** Yes  
**Accessible By:** Tenant members (own tenant only), Super Admin (any tenant)

**Path Parameters:**

- `tenantId` (UUID): Organization ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
    "name": "Test Corp",
    "subdomain": "testcorp",
    "status": "active",
    "subscriptionPlan": "free",
    "maxUsers": 5,
    "maxProjects": 3,
    "createdAt": "2026-01-02T19:44:21.355Z",
    "stats": {
      "totalUsers": 1,
      "totalProjects": 0,
      "totalTasks": 0
    }
  }
}
```

**Error Responses:**

403 Forbidden - Access denied:

```json
{
  "error": "Forbidden: You don't have access to this tenant"
}
```

404 Not Found - Tenant doesn't exist:

```json
{
  "error": "Tenant not found"
}
```

**Curl Example:**

```bash
curl -X GET http://localhost:5000/api/tenants/e1505a35-0cc2-4797-8b37-20bed7e364ab \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

### 2.2 Update Tenant

**Endpoint:** `PUT /tenants/:tenantId`  
**Auth Required:** Yes  
**Accessible By:** Tenant Admin (own tenant), Super Admin (any tenant)

**Request Body (Tenant Admin):**

```json
{
  "name": "Test Corporation"
}
```

**Request Body (Super Admin):**

```json
{
  "name": "Test Corporation ",
  "status": "active",
  "subscriptionPlan": "enterprise",
  "maxUsers": 100,
  "maxProjects": 50
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
    "name": "Test Corporation",
    "updated_at": "2026-01-02T20:21:49.449Z"
  }
}
```

**Error Responses:**

403 Forbidden - Insufficient permissions:

```json
{
  "error": "Forbidden: Only tenant admin or super admin can update"
}
```

400 Bad Request - Invalid downgrade:

```json
{
  "error": "Cannot downgrade max_users: current 15 users exceeds new limit 10"
}
```

**Curl Example:**

```bash
curl -X PUT http://localhost:5000/api/tenants/e1505a35-0cc2-4797-8b37-20bed7e364ab \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V...." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Corporation"
  }'
```

---

### 2.3 List All Tenants

**Endpoint:** `GET /tenants`  
**Auth Required:** Yes  
**Accessible By:** Super Admin only

**Query Parameters:**

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 10, max: 50)
- `status` (string, optional): Filter by status (active, suspended, deleted)
- `plan` (string, optional): Filter by plan (starter, pro, enterprise)
- `sortBy` (string, optional): Sort field (createdAt, name, userCount, projectCount)
- `sortOrder` (string, optional): asc or desc (default: desc)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
        "name": "Test Corporation",
        "subdomain": "testcorp",
        "status": "active",
        "subscriptionPlan": "free",
        "userCount": 1,
        "projectCount": 0,
        "createdAt": "2026-01-02T19:44:21.355Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response:**

403 Forbidden - Not super admin:

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**Curl Example:**

```bash
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

## 3. User Management Endpoints

### 3.1 Add User to Tenant

**Endpoint:** `POST /tenants/:tenantId/users`  
**Auth Required:** Yes  
**Accessible By:** Tenant Admin (own tenant), Super Admin (any tenant)

**Request Body:**

```json
{
  "fullName": "Alice Johnson",
  "email": "alice@testcorp.com",
  "password": "UserPass123!",
  "role": "user"
}
```

**Validation:**

- `fullName`: Required, 1-100 characters
- `email`: Required, valid email format, unique within tenant
- `password`: Required, minimum 8 characters
- `role`: Required, must be "user" or "admin"

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "4fde0b42-5966-4517-91d2-b02b1853ca45",
    "email": "alice@testcorp.com",
    "fullName": "Alice Johnson",
    "role": "user",
    "tenantId": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
    "isActive": true,
    "createdAt": "2026-01-02T20:31:38.192Z"
  }
}
```

**Error Responses:**

403 Forbidden - Insufficient permissions:

```json
{
  "error": "Forbidden: Only tenant admin can add users"
}
```

409 Conflict - User limit exceeded:

```json
{
  "error": "Subscription limit exceeded: Maximum 25 users allowed in pro plan, current: 25"
}
```

409 Conflict - Duplicate email:

```json
{
  "error": "Email 'alice@demo.com' is already registered in this tenant"
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:5000/api/tenants/e1505a35-0cc2-4797-8b37-20bed7e364ab/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V..." \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice Johnson",
    "email": "alice@testcorp.com",
    "password": "UserPass123!",
    "role": "user"
  }'
```

---

### 3.2 List Tenant Users

**Endpoint:** `GET /tenants/:tenantId/users`  
**Auth Required:** Yes  
**Accessible By:** Tenant members (own tenant), Super Admin (any tenant)

**Query Parameters:**

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 20, max: 100)
- `search` (string, optional): Search by name or email
- `role` (string, optional): Filter by role (user, admin)
- `status` (string, optional): Filter by status (active, inactive)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "4fde0b42-5966-4517-91d2-b02b1853ca45",
        "email": "alice@testcorp.com",
        "fullName": "Alice Johnson",
        "role": "user",
        "isActive": true,
        "createdAt": "2026-01-02T20:31:38.192Z"
      },
      {
        "id": "5e4e9da2-28c0-48f1-98e9-5c9bd32645ea",
        "email": "admin@testcorp.com",
        "fullName": "Test Admin",
        "role": "tenant_admin",
        "isActive": true,
        "createdAt": "2026-01-02T19:44:21.355Z"
      }
    ],
    "total": 2,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET "http://localhost:5000/api/tenants/e1505a35-0cc2-4797-8b37-20bed7e364ab/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

### 3.3 Update User

**Endpoint:** `PUT /users/:userId`  
**Auth Required:** Yes  
**Accessible By:** User (own profile), Tenant Admin, Super Admin

**Request Body (User updating self):**

```json
{
  "fullName": "Alice J. Johnson"
}
```

**Request Body (Admin updating others):**

```json
{
  "fullName": "Alice J. Johnson"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "4fde0b42-5966-4517-91d2-b02b1853ca45",
    "full_name": "Alice J. Johnson",
    "role": "user",
    "updated_at": "2026-01-02T20:35:48.981Z"
  }
}
```

**Error Responses:**

403 Forbidden - Insufficient permissions:

```json
{
  "error": "Forbidden: Cannot update other users without admin role"
}
```

400 Bad Request - Cannot change own role:

```json
{
  "error": "Cannot change your own role"
}
```

**Curl Example:**

```bash
curl -X PUT http://localhost:5000/api/users/4fde0b42-5966-4517-91d2-b02b1853ca45 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V...." \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice J. Johnson"
  }'
```

---

### 3.4 Delete User

**Endpoint:** `DELETE /users/:userId`  
**Auth Required:** Yes  
**Accessible By:** Tenant Admin (own tenant), Super Admin (any tenant)

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**

403 Forbidden - Cannot delete self:

```json
{
  "error": "Forbidden: Cannot delete yourself"
}
```

404 Not Found - User doesn't exist:

```json
{
  "error": "User not found"
}
```

**Curl Example:**

```bash
curl -X DELETE http://localhost:5000/api/users/4fde0b42-5966-4517-91d2-b02b1853ca45 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

## 4. Project Management Endpoints

### 4.1 Create Project

**Endpoint:** `POST /projects`  
**Auth Required:** Yes  
**Accessible By:** Any authenticated user in tenant

**Request Body:**

```json
{
  "name": "Fitness Tracker App",
  "description": "Building a cross-platform mobile application for health tracking",
  "status": "active"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "bb4512b2-9439-40d1-b4f9-5ce75231a4dc",
    "tenantId": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
    "name": "Fitness Tracker App",
    "description": "Building a cross-platform mobile application for health tracking",
    "status": "active",
    "createdBy": "5e4e9da2-28c0-48f1-98e9-5c9bd32645ea",
    "createdAt": "2026-01-02T20:39:13.754Z"
  }
}
```

**Error Responses:**

409 Conflict - Project limit exceeded:

```json
{
  "error": "Subscription limit exceeded: Maximum 15 projects allowed"
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fitness Tracker App",
    "description": "Building a cross-platform mobile application for health tracking",
    "status": "active"
  }'
```

---

### 4.2 List Projects

**Endpoint:** `GET /projects`  
**Auth Required:** Yes

**Query Parameters:**

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 10)
- `search` (string, optional): Search by project name
- `status` (string, optional): Filter by status (active, archived)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "bb4512b2-9439-40d1-b4f9-5ce75231a4dc",
        "name": "Fitness Tracker App",
        "description": "Building a cross-platform mobile application for health tracking",
        "status": "active",
        "createdBy": {
          "id": "5e4e9da2-28c0-48f1-98e9-5c9bd32645ea",
          "fullName": "Test Admin"
        },
        "taskCount": 0,
        "completedTaskCount": 0,
        "createdAt": "2026-01-02T20:39:13.754Z"
      }
    ],
    "total": 1,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 20
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET "http://localhost:5000/api/projects?tenantId=e1505a35-0cc2-4797-8b37-20bed7e364ab" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

### 4.3 Update Project

**Endpoint:** `PUT /projects/:projectId`  
**Auth Required:** Yes  
**Accessible By:** Project creator, Tenant Admin

**Request Body:**

```json
{
  "description": "Developing a Flutter-based mobile app for iOS and Android health tracking."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "bb4512b2-9439-40d1-b4f9-5ce75231a4dc",
    "name": "Fitness Tracker App",
    "description": "Developing a Flutter-based mobile app for iOS and Android health tracking.",
    "status": "active",
    "updated_at": "2026-01-02T20:41:47.438Z"
  }
}
```

**Curl Example:**

```bash
curl -X PUT http://localhost:5000/api/projects/bb4512b2-9439-40d1-b4f9-5ce75231a4dc \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V...." \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Developing a Flutter-based mobile app for iOS and Android health tracking."
  }'
```

---

### 4.4 Delete Project

**Endpoint:** `DELETE /projects/:projectId`  
**Auth Required:** Yes  
**Accessible By:** Project creator, Tenant Admin

**Success Response (200):**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Note:** Cascading delete removes all associated tasks

**Curl Example:**

```bash
curl -X DELETE http://localhost:5000/api/projects/bb4512b2-9439-40d1-b4f9-5ce75231a4dc \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V....."
```

---

## 5. Task Management Endpoints

### 5.1 Create Task

**Endpoint:** `POST /projects/:projectId/tasks`  
**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "Configure Firewall Rules",
  "description": "Update inbound rules for the staging environment",
  "priority": "high",
  "status": "todo"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "f98eebc9-de45-41a6-9e11-45724ea65e12",
    "projectId": "6f253142-691b-4ad4-8e4d-8ff88ee2fea9",
    "tenantId": "e1505a35-0cc2-4797-8b37-20bed7e364ab",
    "title": "Configure Firewall Rules",
    "description": "Update inbound rules for the staging environment",
    "status": "todo",
    "priority": "high",
    "assignedTo": null,
    "dueDate": null,
    "createdAt": "2026-01-02T20:47:55.779Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:5000/api/projects/6f253142-691b-4ad4-8e4d-8ff88ee2fea9/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V...." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Configure Firewall Rules",
    "description": "Update inbound rules for the staging environment",
    "priority": "high",
    "status": "todo"
  }'
```

---

### 5.2 List Project Tasks

**Endpoint:** `GET /projects/:projectId/tasks`  
**Auth Required:** Yes

**Query Parameters:**

- `status` (string, optional): Filter by status (todo, in_progress, completed)
- `priority` (string, optional): Filter by priority (high, medium, low)
- `assignedTo` (UUID, optional): Filter by assignee
- `search` (string, optional): Search by title

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "f98eebc9-de45-41a6-9e11-45724ea65e12",
        "title": "Configure Firewall Rules",
        "description": "Update inbound rules for the staging environment",
        "status": "todo",
        "priority": "high",
        "assignedTo": null,
        "dueDate": null,
        "createdAt": "2026-01-02T20:47:55.779Z"
      }
    ],
    "total": 1,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET http://localhost:5000/api/projects/6f253142-691b-4ad4-8e4d-8ff88ee2fea9/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V...."
```

---

### 5.3 Update Task Status

**Endpoint:** `PATCH /tasks/:taskId/status`  
**Auth Required:** Yes

**Request Body:**

```json
{
  "status": "in_progress"
}
```

**Allowed Status Values:** todo, in_progress, completed

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "f98eebc9-de45-41a6-9e11-45724ea65e12",
    "title": "Configure Firewall Rules",
    "description": "Update inbound rules for the staging environment",
    "status": "in_progress",
    "priority": "high",
    "assignedTo": null,
    "dueDate": null,
    "updatedAt": "2026-01-02T20:52:28.525Z"
  }
}
```

**Curl Example:**

```bash
curl -X PUT http://localhost:5000/api/tasks/f98eebc9-de45-41a6-9e11-45724ea65e12 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V...." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }''
```

---

### 5.4 Update Task

**Endpoint:** `PUT /tasks/:taskId`  
**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "Design Homepage - Updated",
  "description": "Updated description",
  "priority": "medium",
  "status": "completed",
  "assignedTo": "770e8400-e29b-41d4-a716-446655440222",
  "dueDate": "2024-02-05"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440444",
    "title": "Design Homepage - Updated",
    "status": "completed",
    "priority": "medium",
    "updatedAt": "2024-01-16T10:15:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X DELETE http://localhost:5000/api/tasks/f98eebc9-de45-41a6-9e11-45724ea65e12 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2V...."
```

---

## 6. Health Check

### 6.1 Health Check Endpoint

**Endpoint:** `GET /health`  
**Auth Required:** No

**Success Response (200):**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T10:15:00Z",
  "database": "connected",
  "uptime": 3600
}
```

**Error Response (503):**

```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "message": "Database connection failed"
}
```

**Curl Example:**

```bash
curl http://localhost:5000/api/health
```

---


