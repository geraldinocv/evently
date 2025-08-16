-- Script to create test users
-- Run this after the main setup script

-- Note: These users need to be created through Supabase Auth API
-- This script shows the SQL that would be executed after user registration

-- Example of what happens when a user registers:
-- 1. User registers with email/password through Supabase Auth
-- 2. Trigger automatically creates profile entry
-- 3. User can then login and use the application

-- Test user data that will be created automatically via trigger:
-- Email: admin@evently.cv, Password: admin123
-- Email: organizer@evently.cv, Password: organizer123
-- Email: user@evently.cv, Password: user123

-- You can create these users by:
-- 1. Going to /auth/register
-- 2. Registering with the above credentials
-- 3. The profile will be created automatically

SELECT 'Test users should be created through the registration form at /auth/register' as instruction;
