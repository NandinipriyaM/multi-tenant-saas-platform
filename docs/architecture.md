## System Architecture
![System Architecture Diagram](./images/system-architecture.png)

## Database Schema (ERD)
![Database ERD](./images/database-erd.png)

##  API Endpoint Architecture

### REST API Design

**Base URL:** `http://localhost:5000/api`

**Authentication:** JWT Bearer Token in Authorization header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

###  Endpoint Organization

```
POST   /auth/register-tenant        Register new organization
POST   /auth/login                  User login
GET    /auth/me                     Get current user
POST   /auth/logout                 Logout

GET    /tenants/:tenantId           Get tenant details
PUT    /tenants/:tenantId           Update tenant
GET    /tenants                     List all tenants (super_admin)

POST   /tenants/:tenantId/users     Add user to tenant
GET    /tenants/:tenantId/users     List tenant users
PUT    /users/:userId               Update user
DELETE /users/:userId               Delete user

POST   /projects                    Create project
GET    /projects                    List projects
PUT    /projects/:projectId         Update project
DELETE /projects/:projectId         Delete project

POST   /projects/:projectId/tasks   Create task
GET    /projects/:projectId/tasks   List tasks in project
PATCH  /tasks/:taskId/status        Update task status
PUT    /tasks/:taskId               Update task details

GET    /health                      Health check (no auth required)
```