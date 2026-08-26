# Payilagam User Manual

Welcome to the **Payilagam** application. For testing and development purposes, the database is pre-seeded with the following robust test accounts.

## Test Accounts

The following accounts are available. All accounts share the same default password.

**Default Password for all accounts:** `Payilagam@123`

| Role | Email | Description |
| :--- | :--- | :--- |
| **Admin** | `admin@mail.com` | Has full access to the system. Can manage users, view all courses, global analytics, and handle platform settings. |
| **Mentor** | `mentor@mail.com` | Primary test mentor. Owns pre-seeded courses and coding problems. Has access to the Mentor Dashboard. |
| **Mentor 2** | `mentor1@mail.com` | Secondary test mentor. Useful for testing multi-mentor course management. |
| **Student** | `student@mail.com` | Primary test student. Used for verifying enrollment, coding submissions, and dashboard progress. |
| **Student 2** | `student1@mail.com` | Secondary test student. |

## Getting Started
1. Run `npm run dev` in the `BackEnd` folder.
2. Run `npm run dev` in the `FrontEnd` folder.
3. Open your browser and navigate to the local frontend URL.
4. Go to `/login` and use one of the emails above with `Payilagam@123` to explore different role-based views.

*(Note: The system forces a password change upon first login for newly created users in production, but these seeded users can be used immediately.)*
