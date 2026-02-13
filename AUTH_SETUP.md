# Role-Based Authentication System

## Overview
This application now has a complete role-based access control (RBAC) system with authentication.

## User Accounts

### Super Admin Accounts
Super Admins have full access to all features including Admin Management.

1. **Sarah Smith**
   - Email: `sarah.s@abbeconsult.com`
   - Password: `admin123`
   - Role: Super Admin

2. **Alexander Pierce**
   - Email: `alex.p@abbe.com`
   - Password: `admin123`
   - Role: Super Admin

### Admin Account
Admins have access to most features except Admin Management (which is Super Admin only).

3. **Victoria Hand**
   - Email: `victoria.h@abbeconsult.com`
   - Password: `admin123`
   - Role: Admin

## Role Permissions

### Super Admin
- Full access to all features
- Can manage admins (create, edit, delete)
- Can manage roles
- Can manage users and departments
- Can manage time-off requests
- Can manage events
- Access to notifications, history, and trash

### Admin (Generic)
- Access to most features except Admin Management
- Can manage users and departments
- Can manage time-off requests
- Can manage events
- Access to notifications, history, and trash
- Cannot create or manage other admins

## Features

### Authentication
- Login page with email/password authentication
- reCAPTCHA verification (simulated)
- Session persistence using localStorage
- Automatic redirect to dashboard after login
- Logout functionality

### Route Protection
- Unauthenticated users are redirected to login
- Role-based menu visibility
- Super Admin-only routes (Admin Management)
- Admin-only routes (User Management, Time Off, Events, etc.)

### Menu Visibility
The sidebar menu dynamically shows/hides items based on user role:
- Dashboard: All admin users
- Time Off: Admin and Super Admin
- Events: Admin and Super Admin
- User Management: Admin and Super Admin
- Admin Management: Super Admin only
- Notifications: Admin and Super Admin
- History: Admin and Super Admin
- Trash: Admin and Super Admin
- Profile & Settings: All admin users

## Changes Made

### New Files
1. `src/context/AuthContext.tsx` - Authentication context and logic
2. `src/components/ProtectedRoute.tsx` - Route protection component
3. `AUTH_SETUP.md` - This documentation file

### Modified Files
1. `src/app/layout.tsx` - Added AuthProvider wrapper
2. `src/app/login/page.tsx` - Integrated authentication logic
3. `src/components/SidebarLayout.tsx` - Added authentication check
4. `src/components/Navbar.tsx` - Added role-based menu visibility and logout
5. `src/context/NotificationContext.tsx` - Removed Admin HR users, kept only Admin and Super Admin

## Testing

### Test Super Admin Access
1. Login with `sarah.s@abbeconsult.com` / `admin123`
2. Verify you can see all menu items including "Admin Management"
3. Navigate to Admin Management and verify you can manage admins

### Test Admin Access
1. Login with `victoria.h@abbeconsult.com` / `admin123`
2. Verify you can see most menu items but NOT "Admin Management"
3. Try to access `/admin-management` directly - you should be redirected to dashboard

## Security Notes

⚠️ **Important**: This is a frontend-only authentication system for demonstration purposes.

In a production environment, you should:
- Implement proper backend authentication with JWT or session tokens
- Store passwords securely with hashing (bcrypt, argon2)
- Validate permissions on the backend for every API call
- Use HTTPS for all communications
- Implement proper CSRF protection
- Add rate limiting for login attempts
- Use secure session management
- Never store sensitive data in localStorage (use httpOnly cookies)

## Next Steps

To make this production-ready:
1. Set up a backend API for authentication
2. Implement proper password hashing
3. Add JWT token management
4. Create API middleware for role verification
5. Add refresh token logic
6. Implement password reset functionality
7. Add two-factor authentication (2FA)
8. Set up proper session management
9. Add audit logging for security events
