# NU Housing Management System Client

Frontend repository for the NU Housing Management System. This client provides the browser interface for students, housing staff, and administrators to manage dormitory applications, document uploads, payment status, user access, and operational dashboards.

The actual Next.js application is located in [`my-app`](./my-app).

## Project Purpose

This frontend is designed for a university housing workflow with three main user groups:

- **Students** can register or sign in, submit a housing application, upload required documents, view application status, and proceed to payment when eligible.
- **Housing staff** can review housing applications, monitor occupancy information, search students, manage dorm residents, open or close the application period, and send notifications to rejected applicants.
- **Administrators** can view system-level statistics, inspect logs, manage users, and review diagnostic information.

## Technology Stack

- **Framework:** Next.js 16 with the App Router
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, lucide-react icons
- **Authentication:** Token-based frontend session storage with optional Google OAuth support
- **API communication:** Fetch-based helpers in `my-app/lib`
- **Environment management:** dotenvx

## Repository Structure

```text
.
└── my-app/
    ├── app/                  # Next.js routes and pages
    │   ├── auth/             # Login and signup pages
    │   └── dashboard/        # Student, housing, and admin dashboards
    ├── components/           # Reusable UI and dashboard components
    ├── hooks/                # Client-side auth guard
    ├── lib/                  # API, auth, config, documents, payments helpers
    ├── package.json          # Scripts and dependencies
    └── .env.example          # Example frontend environment variables
```

## Main Routes

- `/auth/login` - login page
- `/auth/signup` - student registration page
- `/dashboard/student` - student portal
- `/dashboard/student/payment` - payment page for approved applications
- `/dashboard/housing` - housing staff dashboard
- `/dashboard/admin` - administrator dashboard
- `/dashboard/admin/users` - user management
- `/dashboard/admin/logs` - audit logs
- `/dashboard/admin/diagnostics` - diagnostics page

The root page `/` currently renders the login page.

## Local Setup

Install dependencies from the application folder:

```bash
cd my-app
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` for the backend server and authentication settings. The default backend URL is:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

## Environment Variables

The frontend reads these public environment variables:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_MODE=token
NEXT_PUBLIC_OAUTH_PROVIDERS=google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_DOCUMENT_UPLOAD_MODE=proxy
NEXT_PUBLIC_DOCUMENT_DOWNLOAD_PATH_TEMPLATE=/documents/{id}/download
```

Optional document upload and download variables are also supported in `my-app/lib/config.ts` for presigned object-storage workflows.

## Available Scripts

Run these from `my-app`:

```bash
npm run dev      # Start local development server
npm run build    # Build production bundle using .env.production
npm run start    # Start the built production app
npm run lint     # Run ESLint
```

## Backend Integration

This repository is the frontend client only. It expects a backend API to be running separately, usually at `http://localhost:8080`.

The frontend calls API endpoints for:

- Authentication: `/auth/login`, `/auth/register`, `/auth/google`
- Student applications: `/applications/my`
- Housing applications: `/housing/applications`
- Housing settings and notifications
- Document upload and download: `/documents/...`
- Payments: `/payments/application/...`
- Admin stats, logs, diagnostics, and user management

The exact backend behavior should be checked against the backend repository or API documentation.

## Notes for Reviewers

- The app uses client-side auth guards to redirect users based on stored session data and role.
- User role determines the dashboard destination: `student`, `housing`, or `admin`.
- Session data is stored in browser `localStorage` under `token` and `user`.
- Most pages are client components because they depend on authentication state, browser storage, and live API calls.
- The current inner `my-app/README.md` is the default Next.js README; this root README is the project-specific guide.

## Verification

Before presenting or grading, run:

```bash
cd my-app
npm run lint
npm run build
```

Both commands require dependencies to be installed and the relevant environment files to be configured.
