-- Add test leave applications for January 2026
-- Run this in Supabase SQL Editor to test the dashboard chart

-- This will add 5 leave requests for January using existing users
-- The script automatically picks users from your database

-- Request 1 - Early January (Approved)
INSERT INTO time_off_requests (
  user_id,
  leave_type,
  leave_date,
  end_date,
  duration,
  is_half_day,
  status,
  message,
  submitted_at
) 
SELECT 
  id,
  'Vacation Leave',
  '2026-01-15',
  '2026-01-16',
  2,
  false,
  'Approved',
  'Family vacation',
  '2026-01-05 10:30:00'
FROM users 
WHERE role_id NOT IN (SELECT id FROM roles WHERE name IN ('Super Admin', 'Admin'))
LIMIT 1;

-- Request 2 - Mid January (Approved)
INSERT INTO time_off_requests (
  user_id,
  leave_type,
  leave_date,
  end_date,
  duration,
  is_half_day,
  status,
  message,
  submitted_at
) 
SELECT 
  id,
  'Sick Leave',
  '2026-01-20',
  NULL,
  0.5,
  true,
  'Approved',
  'Medical appointment',
  '2026-01-18 09:15:00'
FROM users 
WHERE role_id NOT IN (SELECT id FROM roles WHERE name IN ('Super Admin', 'Admin'))
LIMIT 1 OFFSET 1;

-- Request 3 - Late January (Pending)
INSERT INTO time_off_requests (
  user_id,
  leave_type,
  leave_date,
  end_date,
  duration,
  is_half_day,
  status,
  message,
  submitted_at
) 
SELECT 
  id,
  'Personal Leave',
  '2026-01-28',
  '2026-01-29',
  2,
  false,
  'Pending',
  'Personal matters',
  '2026-01-25 14:20:00'
FROM users 
WHERE role_id NOT IN (SELECT id FROM roles WHERE name IN ('Super Admin', 'Admin'))
LIMIT 1 OFFSET 2;

-- Request 4 - Early January (Approved)
INSERT INTO time_off_requests (
  user_id,
  leave_type,
  leave_date,
  end_date,
  duration,
  is_half_day,
  status,
  message,
  submitted_at
) 
SELECT 
  id,
  'Vacation Leave',
  '2026-01-10',
  '2026-01-12',
  3,
  false,
  'Approved',
  'Long weekend trip',
  '2026-01-03 11:45:00'
FROM users 
WHERE role_id NOT IN (SELECT id FROM roles WHERE name IN ('Super Admin', 'Admin'))
LIMIT 1 OFFSET 3;

-- Request 5 - Mid January (Declined)
INSERT INTO time_off_requests (
  user_id,
  leave_type,
  leave_date,
  end_date,
  duration,
  is_half_day,
  status,
  message,
  submitted_at
) 
SELECT 
  id,
  'Sick Leave',
  '2026-01-22',
  NULL,
  1,
  false,
  'Declined',
  'Not feeling well',
  '2026-01-21 08:30:00'
FROM users 
WHERE role_id NOT IN (SELECT id FROM roles WHERE name IN ('Super Admin', 'Admin'))
LIMIT 1 OFFSET 4;

-- Verify the data was inserted
SELECT 
  DATE_TRUNC('month', submitted_at) as month,
  COUNT(*) as request_count
FROM time_off_requests
WHERE submitted_at >= '2026-01-01' AND submitted_at < '2026-03-01'
GROUP BY DATE_TRUNC('month', submitted_at)
ORDER BY month;


-- Verify the data was inserted - Check monthly counts
SELECT 
  TO_CHAR(submitted_at, 'Month YYYY') as month,
  COUNT(*) as request_count
FROM time_off_requests
WHERE submitted_at >= '2026-01-01' AND submitted_at < '2026-03-01'
GROUP BY TO_CHAR(submitted_at, 'Month YYYY'), DATE_TRUNC('month', submitted_at)
ORDER BY DATE_TRUNC('month', submitted_at);

-- Expected result:
-- January 2026: 5 requests
-- February 2026: 3 requests
