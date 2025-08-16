-- Add currency support to events and ticket_types tables
ALTER TABLE evently.events 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

ALTER TABLE evently.ticket_types 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR';

-- Update existing records to have EUR as default currency
UPDATE evently.events 
SET currency = 'EUR' 
WHERE currency IS NULL;

UPDATE evently.ticket_types 
SET currency = 'EUR' 
WHERE currency IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN evently.events.currency IS 'Currency code for event pricing (ISO 4217)';
COMMENT ON COLUMN eventy.ticket_types.currency IS 'Currency code for ticket pricing (ISO 4217)';
