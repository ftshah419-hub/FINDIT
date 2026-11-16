# FINDIT Architecture

## Architecture style
- Frontend: React feature-based architecture.
- Backend: MVC + Service Layer.
- Request flow: React -> Express routes -> middleware -> controllers -> services -> models -> MongoDB.
- External providers are accessed through dedicated services.

## Main frontend features
- Authentication: registration, email OTP, password + OTP login, password reset.
- User: profile, browse/search items, lost/found reports, claims, notifications.
- Admin: dashboard, user management, item moderation, claim review, complaints, categories, AI match review, activity logs and settings.

## Backend modules
Authentication, users, admin, items, search, claims, notifications, AI matching, uploads, reports, categories, activity logs and system settings.

## Shared architecture rules
- One Express application and one MongoDB connection.
- One Users collection for USER and ADMIN.
- AuthTokens handles EMAIL_VERIFICATION, LOGIN, PASSWORD_RESET and PASSWORD_RESET_GRANT.
- Sessions stores refresh-token hashes and session metadata.
- Controllers handle HTTP only; services contain business logic; models define persistence.
- Frontend components call feature API services, not the backend directly.
- Backend authorization is mandatory; frontend route guards are not a security boundary.

## Database collections
Users, AuthTokens, Sessions, Items, Claims, Notifications, AIMatches, ActivityLogs, Reports, Categories, SystemSettings.

## API convention
Base path: /api/v1

Success:
{ "success": true, "message": "...", "data": {} }

Error:
{ "success": false, "message": "...", "errorCode": "..." }

## Team ownership
- Authentication teammate: User, AuthToken, Session models; auth routes/controllers/services; shared auth middleware.
- Admin teammate: admin operations, reports, categories, settings and moderation.
- User teammate: item reports, claims, profile, browsing and notifications.
- Shared model or API contract changes must be agreed before merging.

## Important
This is the target structure. Inspect existing files before implementation. Reuse working files and do not overwrite or duplicate them.
