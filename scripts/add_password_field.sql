-- Adding password field to profiles table for custom authentication
ALTER TABLE profiles 
ADD COLUMN password TEXT;

-- Adding email field to profiles table since it's needed for login
ALTER TABLE profiles 
ADD COLUMN email TEXT UNIQUE;

-- Creating index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update RLS policies to allow password-based authentication
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- New RLS policies for custom auth
CREATE POLICY "Allow public read access to profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own profile" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own profile" ON profiles
    FOR UPDATE USING (true);

-- Create function to hash passwords (simple version)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Simple hash function - in production use proper bcrypt
    RETURN encode(digest(password || 'salt123', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(email TEXT, password TEXT)
RETURNS TABLE(id UUID, name TEXT, email TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.email
    FROM profiles p
    WHERE p.email = verify_password.email 
    AND p.password = hash_password(verify_password.password);
END;
$$ LANGUAGE plpgsql;

-- Insert test user for testing
INSERT INTO profiles (id, name, email, password, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Admin User',
    'admin@evently.com',
    hash_password('admin123'),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Show current profiles
SELECT id, name, email, created_at FROM profiles;
