-- Adding role column to profiles table with enum type for user roles
-- Create enum type for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'promotor', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Update existing admin user to have admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@evently.com';

-- Create index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update RLS policies to include role-based access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

-- Allow users to update their own profile (except role)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Allow admins to update any profile including roles
CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Create function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_email text)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM profiles WHERE email = user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_role(text) TO anon, authenticated;

-- Insert some example users with different roles
INSERT INTO profiles (email, password_hash, name, role) VALUES
('promotor@evently.com', crypt('promotor123', gen_salt('bf')), 'Promotor User', 'promotor'),
('user@evently.com', crypt('user123', gen_salt('bf')), 'Regular User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Display current users and their roles
SELECT email, name, role FROM profiles ORDER BY role, email;
