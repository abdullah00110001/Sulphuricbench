
-- Fix RLS policies for teachers table to allow proper CRUD operations
DROP POLICY IF EXISTS "Anyone can view teachers" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated users can create teachers" ON public.teachers;
DROP POLICY IF EXISTS "Super admins can manage all teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can update teacher records" ON public.teachers;

-- Create new, more permissive policies
CREATE POLICY "Public can read active teachers" ON public.teachers
FOR SELECT TO public 
USING (is_active = true);

CREATE POLICY "Authenticated users can create teachers" ON public.teachers
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update teachers" ON public.teachers
FOR UPDATE TO authenticated 
USING (true) 
WITH CHECK (true);

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

-- Allow authenticated users to delete teachers (for CRUD)
CREATE POLICY "Authenticated users can delete teachers" ON public.teachers
FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
