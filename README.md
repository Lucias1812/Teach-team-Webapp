# Teach Team

A full-stack web application for hiring teaching staff. **Candidates** apply to tutor or lab-assistant roles for courses, **lecturers** review and rank applicants for the courses they teach, and an **admin dashboard** manages courses, assignments and candidate availability.

Built as a pair project with Nima Dehghanpour using **Next.js, React, TypeScript, Express, TypeORM and MySQL**, plus a separate **GraphQL + Apollo** admin service.

---

## What it does

| Role | Capabilities |
|---|---|
| **Candidate** | Sign up, sign in, view profile, browse courses, apply as Tutor and/or Lab Assistant with availability, skills and credentials |
| **Lecturer** | See only the courses they teach, view applicants per course, filter by name / skill / role / availability, select and rank candidates, add comments, see a selection chart |
| **Admin** | Manage courses, assign lecturers, block / unblock candidates, view reports (GraphQL dashboard) |

---

## Architecture

```
┌──────────────────────────┐        REST + session cookie        ┌──────────────────────────┐
│  Next.js / React app     │ ──────────────────────────────────► │  Express API  :3001      │
│  (candidate + lecturer)  │ ◄────────────────────────────────── │  TypeORM  ─►  MySQL      │
│  src/                    │                                     │  backend/                │
└──────────────────────────┘                                     └──────────────────────────┘

┌──────────────────────────┐          GraphQL (HTTP / WS)        ┌──────────────────────────┐
│  React admin dashboard   │ ──────────────────────────────────► │  Apollo Server :4001     │
│  (Apollo Client)         │ ◄────────────────────────────────── │  TypeORM  ─►  MySQL      │
│  admin-dashboard/        │                                     │  admin-dashboard/        │
│    admin-react           │                                     │    admin-graphql         │
└──────────────────────────┘                                     └──────────────────────────┘
```

### Repository layout

```
.
├── src/                          # Next.js front end
│   ├── pages/
│   │   ├── index.tsx             # App shell, view switching, session restore
│   │   ├── SignIn.tsx / SignUp.tsx
│   │   ├── Tutors.tsx            # Candidate application form
│   │   ├── Lecturers.tsx         # Lecturer dashboard (filter, rank, chart)
│   │   └── profile.tsx
│   └── lib/api.ts                # fetch helpers for auth
├── backend/                      # Express + TypeORM API
│   └── src/
│       ├── index.ts              # Server bootstrap, sessions, course seeding
│       ├── data-source.ts        # MySQL connection (env-driven)
│       ├── entities/             # User, Course, Application, LecturerCourse
│       ├── routes/               # auth, course, application, lecturer
│       └── __test__/             # Jest entity tests
└── admin-dashboard/
    ├── admin-graphql/            # Apollo Server + TypeORM
    └── admin-react/              # React admin UI (Apollo Client)
```

---

## Features in detail

### Authentication and sessions
- Passwords hashed with **bcrypt** (10 rounds).
- Server-side sessions through `express-session`, sent as a cookie to the browser (`credentials: "include"`).
- The front end restores the session on page load by calling `/auth/profile`.
- Role-based UI: lecturers and candidates see different dashboards after sign-in.

### Candidate applications
- A candidate picks a course, one or both roles (Tutor, Lab Assistant), availability (Full-time / Part-time), skills and academic credentials.
- Inputs are validated on the client and again on the server with **express-validator**.
- Selecting both roles submits **one application per role** in parallel.

### Lecturer dashboard
- Lecturers can only see the courses assigned to them, and the API refuses requests for any other course (403).
- Filters (name, skill, role, availability) are pushed down into the SQL query rather than filtered in the browser.
- Selected candidates can be re-ordered with up / down controls and annotated with comments (300-character limit with live counter).
- A bar chart (Recharts) summarises selections.

### Admin dashboard (GraphQL)
- Queries for courses, lecturers and candidate reports (per course, over-assigned, unassigned).
- Mutations for adding, editing and deleting courses, assigning lecturers and blocking candidates.

---

## API overview (REST, port 3001)

| Method | Route | Purpose | Access |
|---|---|---|---|
| POST | `/auth/signup` | Create candidate or lecturer account | Public |
| POST | `/auth/login` | Start session | Public |
| GET | `/auth/logout` | End session | Session |
| GET | `/auth/profile` | Current user, role, join date | Session |
| GET | `/courses` | List courses | Public |
| POST | `/courses` | Add course (rejects duplicate codes) | Public |
| POST | `/applications` | Submit an application | Candidate |
| GET | `/applications/me` | My applications | Candidate |
| GET | `/lecturers/courses` | Courses I teach | Lecturer |
| GET | `/lecturers/applications/:courseId` | Filtered applicants for a course | Lecturer, own course only |

---

## Data model

```
User ──< Application >── Course
  │                        │
  └──< LecturerCourse >────┘
```

| Entity | Key fields |
|---|---|
| `User` | username (unique), passwordHash, role (`candidate` / `lecturer` / `admin`), joinDate, isBlocked |
| `Course` | code (unique), name, semester |
| `Application` | candidate, course, roleApplied (`TUTORIAL` / `LAB`), availability, skillSet, academicCredentials |
| `LecturerCourse` | lecturer, course (many-to-many join) |

---

## Code highlights

### 1. Server-side authorisation for lecturers

A router-level middleware guards every lecturer route, and each request is additionally checked against the courses that lecturer actually teaches:

```ts
// backend/src/routes/lecturer.router.ts
router.use(async (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) { res.status(401).json({ error: 'Not logged in' }); return; }

  const me = await userRepo.findOneBy({ id: sessionUser.id });
  if (!me || me.role !== 'lecturer') {
    res.status(403).json({ error: 'Forbidden: not a lecturer' });
    return;
  }
  next();
});
```

### 2. Filters built into the SQL query

Optional filters are appended with parameter binding, and enum filters are only applied when the value is valid:

```ts
// backend/src/routes/lecturer.router.ts
const qb = appRepo
  .createQueryBuilder('app')
  .innerJoinAndSelect('app.candidate', 'cand')
  .where('app.courseId = :courseId', { courseId });

if (name)  qb.andWhere('cand.username LIKE :name', { name: `%${name}%` });
if (roleApplied && Object.values(SessionType).includes(roleApplied as SessionType)) {
  qb.andWhere('app.roleApplied = :roleApplied', { roleApplied });
}
if (skillSet) qb.andWhere('app.skillSet LIKE :skillSet', { skillSet: `%${skillSet}%` });
```

### 3. Declarative request validation

```ts
// backend/src/routes/application.router.ts
body('role')
  .exists().withMessage('role is required')
  .isIn(Object.values(SessionType))
  .withMessage(`role must be one of ${Object.values(SessionType).join(', ')}`),
body('availability')
  .isIn(Object.values(AvailabilityType)),
```

### 4. Typed sessions

The session shape is declared once so `req.session.user` is type-checked across all routes:

```ts
// backend/src/routes/auth.router.ts
declare module 'express-session' {
  interface SessionData {
    user: { id: number; username: string; role: UserRole };
  }
}
```

### 5. Entities with enums and relations

```ts
// backend/src/entities/Application.ts
@Entity()
export class Application {
  @ManyToOne(() => User, user => user.applications, { eager: true })
  candidate!: User;

  @Column({ type: 'enum', enum: SessionType })
  roleApplied!: SessionType;

  @Column({ type: 'enum', enum: AvailabilityType })
  availability!: AvailabilityType;
}
```

### 6. Submitting several roles at once

```tsx
// src/pages/Tutors.tsx
await Promise.all(
  roles.map(role =>
    axios.post('http://localhost:3001/applications',
      { courseId: selectedCourseId, role, availability, skillSet: skills, academicCredentials },
      { withCredentials: true })
  )
);
```

---

## Running it locally

**Requirements:** Node.js 18+, MySQL 8.

### 1. Database
Create an empty MySQL database (for example `teach_team`). Tables are created automatically on first start (`synchronize: true`).

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in your MySQL details
npm install
npm run dev                 # http://localhost:3001
```
On first start the API seeds four sample courses.

### 3. Front end
```bash
# from the repository root
npm install
npm run dev                 # http://localhost:3000
```

### 4. Admin dashboard (optional, in progress)
```bash
cd admin-dashboard/admin-graphql
export DB_HOST=localhost DB_PORT=3306 DB_USERNAME=... DB_PASSWORD=... DB_DATABASE=...
npm install && npm start    # http://localhost:4001

cd ../admin-react
npm install && npm start
```

### Tests
```bash
cd backend && npm test
```

---

## Testing

Jest unit tests cover the entities and related logic: `User`, `Course`, `Application`, `Lecturer`, `LecturerCourse`. They check enum values, field assignment and relation shapes without needing a database.

---

## Known limitations and next steps

Being upfront about where this stands:

- **Admin dashboard is a prototype.** The React client and the GraphQL server were developed in parallel and their schemas are not fully aligned (for example, some queries and mutations differ in name or shape), and there are two overlapping resolver and schema sets. It needs reconciling before it works end to end.
- **Admin sign-in is a placeholder** with fixed credentials and a hard-coded JWT secret. It should use real accounts and an environment-supplied secret.
- **Role checks on some REST routes are missing.** `POST /courses` is public and `/applications` only checks that the user is logged in, so both should be restricted by role.
- **Lecturer selections and comments are held in the browser only** and are not persisted yet.
- **Password strength is validated in the browser** (8+ characters, mixed case, number, symbol) but not enforced again on the server.
- **Lecturers are auto-assigned to courses** by sign-up order (first four lecturers → first four courses) as a stand-in for a real assignment flow.
- **`synchronize: true`** is convenient in development but should be replaced with migrations for anything real.
- **API URLs are hard-coded to `localhost`** in the front end and should come from environment config.
- Planned: persist rankings, add an admin role to the main API, add API-level integration tests, and containerise the stack.

---

## Authors

**Ishaan Vikas** and **Nima Dehghanpour**
