-- Ensure super admin profiles exist in the database for RLS policies
-- Using the existing email_to_uuid function to generate deterministic UUIDs

-- Insert or update super admin profiles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  approval_status,
  email_verified,
  created_at,
  updated_at
) VALUES 
  (
    email_to_uuid('abdullahusimin1@gmail.com'),
    'abdullahusimin1@gmail.com',
    'Abdullah Usimin',
    'super_admin',
    'approved',
    true,
    now(),
    now()
  ),
  (
    email_to_uuid('stv7168@gmail.com'),
    'stv7168@gmail.com',
    'STV Admin',
    'super_admin',
    'approved',
    true,
    now(),
    now()
  ),
  (
    email_to_uuid('abdullahabeer003@gmail.com'),
    'abdullahabeer003@gmail.com',
    'Abdullah Abeer',
    'super_admin',
    'approved',
    true,
    now(),
    now()
  )
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  approval_status = 'approved',
  email_verified = true,
  full_name = EXCLUDED.full_name,
  updated_at = now();