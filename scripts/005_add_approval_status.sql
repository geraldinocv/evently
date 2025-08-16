-- Add approval status to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Update existing users to approved status
UPDATE public.users SET approval_status = 'approved', approved_at = NOW() WHERE approval_status IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);
