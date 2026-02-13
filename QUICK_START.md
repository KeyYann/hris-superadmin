# Quick Start Guide

## Login Credentials

### Super Admin (Full Access)
```
Email: sarah.s@abbeconsult.com
Password: admin123
```
OR
```
Email: alex.p@abbe.com
Password: admin123
```

### Admin (No Admin Management Access)
```
Email: victoria.h@abbeconsult.com
Password: admin123
```

## What's Different?

### Super Admin Can:
✅ Manage other admins (create, edit, delete)
✅ Manage roles
✅ Manage users and departments
✅ Manage time-off requests and events
✅ Access all features

### Admin Can:
✅ Manage users and departments
✅ Manage time-off requests and events
✅ Access most features
❌ Cannot manage other admins or roles

## How to Test

1. **Start the app** (already running at http://localhost:3000)

2. **Login as Super Admin**
   - Use Sarah's credentials
   - Notice "Admin Management" in the sidebar
   - Try creating a new admin

3. **Logout and Login as Admin**
   - Use Victoria's credentials
   - Notice "Admin Management" is hidden
   - Try accessing other features

## Notes

- The reCAPTCHA checkbox is simulated (just click it)
- Sessions persist in localStorage
- All admin roles (except Admin HR) are available in the system
- Admin HR users have been removed as requested
- Only Admin and Super Admin accounts can login
