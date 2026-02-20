-- Clean up trash table in Supabase
-- Run this in Supabase SQL Editor

-- Option 1: Delete ALL trash records
DELETE FROM trash;

-- Option 2: Delete only trash records older than 30 days (if you want to keep recent ones)
-- DELETE FROM trash WHERE deleted_at < NOW() - INTERVAL '30 days';

-- Option 3: Delete trash records with invalid deleted_by references
-- DELETE FROM trash WHERE deleted_by IS NOT NULL AND deleted_by NOT IN (SELECT id FROM users);

-- Verify the cleanup
SELECT COUNT(*) as remaining_trash_count FROM trash;

-- Reset the sequence if needed (optional)
-- This ensures new trash records start with a clean ID sequence
-- ALTER SEQUENCE trash_id_seq RESTART WITH 1;
