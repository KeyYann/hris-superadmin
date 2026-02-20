-- Fix roles structure in Supabase
-- Run this in Supabase SQL Editor

-- Step 1: First, set role_id to NULL for users with Developer, Designer, QA, or Employee roles
UPDATE users 
SET role_id = NULL 
WHERE role_id IN (
  SELECT id FROM roles 
  WHERE name IN ('Developer', 'Designer', 'QA', 'Employee')
);

-- Step 2: Now delete the unwanted roles (Developer, Designer, QA, Employee)
DELETE FROM roles WHERE name IN ('Developer', 'Designer', 'QA', 'Employee');

-- Step 3: Verify only admin roles remain
SELECT * FROM roles ORDER BY name;

-- Expected roles after cleanup:
-- Admin Engineering
-- Admin Marketing  
-- Super Admin
-- Admin Sales
-- Admin Finance
-- Admin Managers
-- Admin Timesheet
-- Admin NetSuite
-- Admin New Cluster

-- Step 4: Verify the structure
SELECT 
  u.name,
  u.email,
  r.name as role,
  d.name as department
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN departments d ON u.department_id = d.id
ORDER BY r.name NULLS LAST, u.name;
