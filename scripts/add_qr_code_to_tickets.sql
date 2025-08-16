-- Add QR code column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;

-- Create index for QR code lookups
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);

-- Update existing tickets with QR codes if they don't have them
UPDATE tickets 
SET qr_code = 'EVENTLY-' || event_id || '-' || user_id || '-' || EXTRACT(EPOCH FROM created_at) || '-' || substr(md5(random()::text), 1, 9)
WHERE qr_code IS NULL;
