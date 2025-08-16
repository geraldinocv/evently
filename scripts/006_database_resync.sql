-- Database Resync Script for Evently Platform
-- This script consolidates tables and adds missing fields

-- Add missing currency fields to events and ticket_types
ALTER TABLE evently.events 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

ALTER TABLE evently.ticket_types 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

-- Add missing fields to tickets table
ALTER TABLE evently.tickets 
ADD COLUMN IF NOT EXISTS unique_link VARCHAR(255),
ADD COLUMN IF NOT EXISTS link_expires_at TIMESTAMP WITH TIME ZONE;

-- Update tickets with unique links for existing records
UPDATE evently.tickets 
SET unique_link = CONCAT('ticket_', id, '_', EXTRACT(epoch FROM created_at)::text)
WHERE unique_link IS NULL;

-- Consolidate user data from public.users to evently.users
-- First, add missing columns to evently.users
ALTER TABLE evently.users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'organizer',
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Migrate data from public.users to evently.users (if not already exists)
INSERT INTO evently.users (
    id, name, email, password_hash, role, approval_status, 
    email_verified, verification_token, verification_expires_at,
    approved_by, approved_at, created_at, updated_at, user_type
)
SELECT 
    id::text, name, email, password_hash, role, approval_status,
    email_verified, verification_token, verification_expires_at,
    approved_by::text, approved_at, created_at, updated_at,
    COALESCE(role, 'organizer')
FROM public.users 
WHERE NOT EXISTS (
    SELECT 1 FROM evently.users eu WHERE eu.email = public.users.email
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON evently.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON evently.events(date);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON evently.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_unique_link ON evently.tickets(unique_link);
CREATE INDEX IF NOT EXISTS idx_users_email ON evently.users(email);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON evently.users(approval_status);

-- Update existing events with default currency
UPDATE evently.events SET currency = 'CVE' WHERE currency IS NULL;
UPDATE evently.ticket_types SET currency = 'CVE' WHERE currency IS NULL;

-- Clean up: Remove duplicate or test data if needed
-- (Uncomment if you want to clean test data)
-- DELETE FROM evently.users WHERE email LIKE '%test%' OR email LIKE '%example%';
