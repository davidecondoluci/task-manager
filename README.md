# Task Manager

A production-ready Task Management web application built with Next.js 14+, TypeScript, TailwindCSS, and PostgreSQL.

## Features

- **Landing Page**: Clean introduction with navigation to dashboard
- **Task Dashboard**: View all tasks ordered by status (In Progress → To Do → Done)
- **Task Management**: Create, edit, and delete tasks
- **Task Details**: Dedicated page for each task with full information
- **Responsive Design**: Works on mobile and desktop (default + md breakpoints)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with `pg` library
- **Environment**: Node.js

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── tasks/         # Task CRUD endpoints
│   ├── dashboard/         # Task dashboard page
│   ├── tasks/[id]/        # Task detail page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── tasks/             # Task-specific components
│   └── ui/                # Reusable UI components
├── lib/                   # Server-side utilities
│   ├── db.ts              # Database connection pool
│   ├── tasks.ts           # Task repository (data access)
│   └── validation.ts      # Input validation
└── types/                 # TypeScript type definitions
    └── task.ts            # Task interfaces and types
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### 1. Clone and Install

```bash
cd task-manager
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb task_manager
```

Run the schema migration:

```bash
psql -d task_manager -f scripts/schema.sql
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/task_manager
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Method | Endpoint          | Description                        |
| ------ | ----------------- | ---------------------------------- |
| GET    | `/api/tasks`      | List all tasks (ordered by status) |
| POST   | `/api/tasks`      | Create a new task                  |
| GET    | `/api/tasks/[id]` | Get a task by ID                   |
| PUT    | `/api/tasks/[id]` | Update a task                      |
| DELETE | `/api/tasks/[id]` | Delete a task                      |

### Request/Response Examples

**Create Task (POST /api/tasks)**

```json
{
  "title": "Complete documentation",
  "description": "Write README and API docs",
  "status": "todo",
  "time_estimation": 2
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete documentation",
    "description": "Write README and API docs",
    "status": "todo",
    "time_estimation": 2,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

## Architecture Decisions

### Database Connection Pooling

The application uses a connection pool (max 10 connections) for efficient database access. The pool is created lazily and cached in module scope to survive across API requests.

### Repository Pattern

Data access is centralized in `lib/tasks.ts`, separating database queries from API route handlers. This improves testability and maintains single responsibility.

### Validation Layer

Input validation is handled separately from business logic in `lib/validation.ts`. This provides consistent error messages and makes validation rules reusable.

### Component Architecture

- **UI Components** (`components/ui/`): Generic, reusable components (Button, Input, Modal)
- **Task Components** (`components/tasks/`): Domain-specific components (TaskCard, TaskForm)

### Status Ordering

Tasks are ordered by status priority in the database query itself:

1. In Progress (active work)
2. To Do (pending)
3. Done (completed)

This ensures consistent ordering without client-side sorting.

## Error Handling

- All API endpoints return consistent error responses
- Validation errors include field-specific messages
- Database errors are caught and return user-friendly messages
- 404 responses for non-existent resources

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Comments for complex logic

## License

MIT
