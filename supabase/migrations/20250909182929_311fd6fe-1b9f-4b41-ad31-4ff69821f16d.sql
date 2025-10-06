-- Ensure super admin profiles exist in the database for RLS policies
-- This will create or update super admin profiles with deterministic UUIDs

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
    '00000000-0000-0000-0000-abdullahusim',
    'abdullahusimin1@gmail.com',
    'Abdullah Usimin',
    'super_admin',
    'approved',
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-stv7168gmail',
    'stv7168@gmail.com',
    'STV Admin',
    'super_admin',
    'approved',
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-abdullahabee',
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