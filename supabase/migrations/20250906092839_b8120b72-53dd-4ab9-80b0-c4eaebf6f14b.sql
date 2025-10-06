-- Fix super admin authentication issue
-- Ensure super admin profiles exist and have proper authentication
UPDATE profiles 
SET role = 'super_admin', 
    approval_status = 'approved'
WHERE email IN ('abdullahusimin1@gmail.com', 'stv7168@gmail.com', 'abdullahabeer003@gmail.com');

-- Create profiles if they don't exist for demo super admin emails
INSERT INTO profiles (id, email, full_name, role, approval_status, email_verified)
SELECT 
  email_to_uuid(email),
  email,
  CASE 
    WHEN email = 'abdullahusimin1@gmail.com' THEN 'Abdullah Usimin'
    WHEN email = 'stv7168@gmail.com' THEN 'STV Admin'
    WHEN email = 'abdullahabeer003@gmail.com' THEN 'Abdullah Abeer'
    ELSE 'Super Admin'
  END,
  'super_admin'::user_role,
  'approved'::approval_status,
  true
FROM (VALUES 
  ('abdullahusimin1@gmail.com'),
  ('stv7168@gmail.com'),
  ('abdullahabeer003@gmail.com')
) AS emails(email)
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.email = emails.email
);