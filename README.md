# CLUB Recruitment Portal

A single-page recruitment portal for a student tech club. Applicants can learn about the club's teams, read the FAQ, submit an application, and sign back in later to check their application status and download a confirmation slip.

Built with **Next.js (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS 4**.

## Features

- **Landing page** with About, Teams, Recruitment and FAQ sections, plus a mobile navigation drawer.
- **Team explorer**: clickable cards for *Web Development* and *Artificial Intelligence & ML* open a modal with the tech stack, current projects and what the team looks for in candidates, with a shortcut to apply for that team.
- **Application form** with:
  - Full name, email, year of study (1st–4th), team and branch/department
  - "Why CLUB?" statement (20–500 characters) with a live character counter and one-click prompt chips
  - Password with show/hide toggle, a strength meter and a confirm-password check
- **Member sign-in** to return to an existing application.
- **Applicant dashboard** after login: status timeline (Submitted → Under Review → Interview → Decision), application details, expandable statement, *Copy ID* and *Download Slip* (a `.txt` confirmation receipt).
- **Three themes**: Midnight Tech (dark), Cyber Violet and Minimal Studio (light). Your choice is saved in `localStorage`.
- **Backend health badge** in the top bar that shows connection status and latency, and can be clicked to re-ping the server.
- Toast notifications and client-side validation.

## Tech Stack

| Area      | Tools                                         |
| --------- | --------------------------------------------- |
| Framework | Next.js 16, React 19                          |
| Language  | TypeScript 5                                  |
| Styling   | Tailwind CSS 4, custom CSS in `app/globals.css` |
| Linting   | ESLint 9 with `eslint-config-next`            |
| Auth libs | `bcryptjs`, `jsonwebtoken`, `cookie-parser` (listed in `package.json`) |

## Project Structure

```
.
├── app/
│   ├── layout.tsx      # Root layout and page metadata
│   ├── page.tsx        # The entire portal UI (client component)
│   ├── globals.css     # Global styles and theme definitions
│   └── favicon.ico
├── public/             # Static assets
├── next.config.ts
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm (or yarn / pnpm / bun)
- A running backend API (see [Backend API](#backend-api))

### Installation

```bash
git clone https://github.com/nitianprasad547/Club_Recruitment_Portal.git
cd Club_Recruitment_Portal
npm install
```

### Configuration

Create a `.env.local` file in the project root to point the frontend at your API:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

If the variable is not set, the app defaults to `http://localhost:5001/api`. If a request to port `5001` fails, it automatically retries on port `5000`.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start the development server             |
| `npm run build` | Create an optimized production build     |
| `npm start`     | Run the production build                 |
| `npm run lint`  | Lint the project with ESLint             |

## Backend API

This repository contains the **frontend only**. It expects a separate REST API that returns JSON in the shape `{ success: boolean, message?: string, token?: string, student?: Student }` and exposes these endpoints under `NEXT_PUBLIC_API_URL`:

| Method | Endpoint         | Purpose                                             |
| ------ | ---------------- | --------------------------------------------------- |
| GET    | `/health`        | Health check used by the status badge               |
| POST   | `/auth/register` | Submit a new application and create the account     |
| POST   | `/auth/login`    | Sign in with email and password                     |
| GET    | `/auth/me`       | Fetch the currently signed-in applicant             |
| POST   | `/auth/logout`   | Sign out                                            |

**Register payload:** `name`, `email`, `branch`, `year`, `team` (`"Web Dev"` or `"AI/ML"`), `reason`, `password`, `confirmPassword`.
**Login payload:** `email`, `password`.

The returned `student` object has the fields `id`, `name`, `email`, `branch`, `year`, `team`, `reason` and optionally `createdAt`.

Authentication works with both a JWT (stored in `localStorage` as `club_token` and sent as a `Bearer` token) and cookies (requests are sent with `credentials: "include"`), so the backend must allow CORS with credentials from the frontend origin.

## Customizing

- **Teams, FAQ and branches:** edit the `teamData`, `faqItems` and `branches` constants at the top of `app/page.tsx`.
- **Contact email:** update the `mailto:` link and the text in the downloadable slip in `app/page.tsx`.
- **Themes and styling:** adjust the theme definitions in `app/globals.css`.
- **Page title and description:** edit the metadata in `app/layout.tsx`.

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com/new). Set `NEXT_PUBLIC_API_URL` in your project's environment variables to the URL of your deployed backend before building.

## License

No license has been specified for this project yet.
