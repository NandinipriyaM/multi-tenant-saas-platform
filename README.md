# multi-tenant-saas-platform

A comprehensive, production-ready SaaS platform with tenant management, user management, project tracking, and task management capabilities. Complete with REST APIs, responsive React UI, PostgreSQL database, and Docker containerization.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

## ✨ Key Features

###  Multi-Tenancy

- Complete data isolation between organizations
- Row-level security with tenant_id enforcement
- Scalable from 10 to 1,000,000+ tenants
- Support for multiple subscription plans

###  User Management

- Role-based access control (Super Admin, Tenant Admin, User)
- Tenant user management with permission levels
- Password hashing with bcryptjs (10 rounds)
- JWT-based stateless authentication (24-hour tokens)

###  Project Management

- Create, read, update, delete projects
- Project status tracking (active/archived)
- Real-time task statistics
- Subscription-based project limits

###  Task Management

- Task creation with priority levels (high/medium/low)
- Status workflow (todo → in_progress → completed)
- User assignment and due date tracking
- Advanced filtering and sorting

###  Security & Compliance

- Password hashing with bcryptjs
- JWT authentication with automatic token expiry
- Parameterized SQL queries (SQL injection protection)
- Comprehensive audit logging
- CORS enforcement
- Input validation on all endpoints

###  Dashboard & Analytics

- Organization statistics dashboard
- Task completion tracking
- Project progress visualization
- User activity monitoring

###  Responsive UI

- Mobile-first responsive design with Tailwind CSS
- Single-page application (SPA) with React Router
- Real-time form validation
- Loading states and error handling
- Role-based UI rendering

###  DevOps Ready

- Docker containerization
- Docker Compose orchestration
- Health checks and automatic recovery
- Production-grade configuration

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose 
- OR: Node.js 18+ and PostgreSQL 15+

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/NandinipriyaM/multi-tenant-saas-platform
cd multi-tenant-saas-platform

# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: localhost:5432
```

### Using Demo Credentials

Login with pre-populated test account:

- **Subdomain:** demo
- **Email:** admin@demo.com
- **Password:** Demo@123



## 📚 Documentation

### Core Documentation

- [API Documentation](docs/API.md) 
- [Architecture](docs/architecture.md)
- [Product Requirements](docs/PRD.md) 
- [Technical Specification](docs/technical-spec.md) 
- [Research Document](docs/research.md) 



## 🔌 API Endpoints

### Authentication (4 APIs)

```
POST   /api/auth/register-tenant     Register new organization
POST   /api/auth/login                User login
GET    /api/auth/me                   Get current user
POST   /api/auth/logout               Logout
```

### Tenant Management (3 APIs)

```
GET    /api/tenants/:tenantId         Get tenant details
PUT    /api/tenants/:tenantId         Update tenant
GET    /api/tenants                   List all tenants (admin)
```

### User Management (4 APIs)

```
POST   /api/tenants/:tenantId/users   Add user to tenant
GET    /api/tenants/:tenantId/users   List tenant users
PUT    /api/users/:userId             Update user
DELETE /api/users/:userId             Delete user
```

### Project Management (4 APIs)

```
POST   /api/projects                  Create project
GET    /api/projects                  List projects
PUT    /api/projects/:projectId       Update project
DELETE /api/projects/:projectId       Delete project
```

### Task Management (4 APIs)

```
POST   /api/projects/:projectId/tasks Create task
GET    /api/projects/:projectId/tasks List project tasks
PATCH  /api/tasks/:taskId/status      Update task status
PUT    /api/tasks/:taskId             Update task details
```

### Health Check (1 API)

```
GET    /api/health                    System health check
```

**Total: 19 RESTful API endpoints**

### API Response Format

**Success (200-201):**

```json
{
  "success": true,
  "data": {
    /* Response data */
  }
}
```

**Error (400-500):**

```json
{
  "error": "Error message",
  "details": [
    /* Validation errors */
  ]
}
```

## 📊 Database Schema

### Core Tables

**tenants** - Organizations using the platform

- id (UUID, PK)
- name, subdomain (UNIQUE)
- status (active/suspended/deleted)
- subscription_plan (starter/pro/enterprise)
- max_users, max_projects

**users** - Team members with login credentials

- id (UUID, PK)
- tenant_id (FK)
- email (UNIQUE per tenant), password_hash
- role (super_admin/tenant_admin/user)
- is_active, created_at

**projects** - Organizational projects

- id (UUID, PK)
- tenant_id (FK), name, description
- status (active/archived)
- created_by (FK to users)

**tasks** - Project tasks with status tracking

- id (UUID, PK)
- project_id, tenant_id (FK)
- title, description, status (todo/in_progress/completed)
- priority (high/medium/low)
- assigned_to (FK), due_date

**audit_logs** - Compliance and security logging

- id (UUID, PK)
- tenant_id, user_id (FK)
- action, entity_type, entity_id, ip_address, created_at

### Key Features

- Composite indexes on (tenant_id, status)
- Foreign key constraints with CASCADE DELETE
- UUID primary keys for security
- Timestamp tracking (created_at, updated_at)

See [Database Schema](docs/technical-spec.md#5-database-schema) for complete details.

