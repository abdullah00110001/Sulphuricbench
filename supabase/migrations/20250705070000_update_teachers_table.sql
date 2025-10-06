
-- Update teachers table structure
ALTER TABLE public.teachers 
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS phone,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies to fix the security issues
DROP POLICY IF EXISTS "Allow public read access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow authenticated users to manage teachers" ON public.teachers;

-- Create new policies that don't cause recursion
CREATE POLICY "Public can read active teachers" ON public.teachers
FOR SELECT TO public 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage teachers" ON public.teachers
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow super admins to manage all teachers
CREATE POLICY "Super admins can manage all teachers" ON public.teachers
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
