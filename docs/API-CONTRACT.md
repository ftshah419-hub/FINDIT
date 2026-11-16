# FINDIT API Contract

Base URL prefix: /api/v1

## Authentication
POST /auth/register
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/login
POST /auth/verify-login-otp
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all
GET  /auth/me
POST /auth/forgot-password
POST /auth/verify-reset-otp
POST /auth/reset-password

## User
GET   /users/me
PATCH /users/me

## Items
GET    /items
GET    /items/:itemId
POST   /items
PATCH  /items/:itemId
DELETE /items/:itemId

## Claims
POST  /items/:itemId/claims
GET   /claims/me
GET   /claims/:claimId
PATCH /claims/:claimId/withdraw

## Notifications
GET   /notifications
PATCH /notifications/:notificationId/read
PATCH /notifications/read-all

## Search
GET /search/items

## Admin
GET   /admin/dashboard
GET   /admin/users
PATCH /admin/users/:userId/status
GET   /admin/items
PATCH /admin/items/:itemId/review
GET   /admin/claims
PATCH /admin/claims/:claimId/review
GET   /admin/reports
PATCH /admin/reports/:reportId/review
GET   /admin/categories
POST  /admin/categories
PATCH /admin/categories/:categoryId
GET   /admin/ai-matches
GET   /admin/activity-logs
GET   /admin/settings
PATCH /admin/settings/:key

All endpoint names are proposed contracts. Confirm them with the team before implementation; do not assume they already exist.
