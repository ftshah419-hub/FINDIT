# FINDIT Team Ownership

## Authentication teammate
Owns authentication workflows, shared User/AuthToken/Session models, OTP and Resend integration, JWT/session services, authenticate and authorize middleware.

## Admin teammate
Owns admin dashboard and admin-specific controllers, services, routes and UI. Reuses shared authentication and shared models.

## User teammate
Owns user-facing item reports, browsing, claims, profile and notifications. Reuses shared authentication and shared models.

## Shared-file rule
Coordinate changes to shared models, middleware, API response contracts and route registration before merging. Use feature branches and pull requests.
