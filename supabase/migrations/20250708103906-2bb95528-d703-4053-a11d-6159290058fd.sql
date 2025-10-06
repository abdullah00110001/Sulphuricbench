
-- Fix RLS policies for courses table to allow creation
DROP POLICY IF EXISTS "Service role and super admins have full access" ON public.courses;
DROP POLICY IF EXISTS "Course owners can manage their courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;

-- Create new, more permissive policies for courses
CREATE POLICY "Public can view published courses" ON public.courses
FOR SELECT TO public
USING (is_published = true);

CREATE POLICY "Authenticated users can create courses" ON public.courses
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Course owners can manage own courses" ON public.courses
FOR ALL TO authenticated
USING (instructor_id = auth.uid() OR is_super_admin())
WITH CHECK (instructor_id = auth.uid() OR is_super_admin());

CREATE POLICY "Super admins can manage all courses" ON public.courses
FOR ALL TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Fix RLS policies for teachers table to allow creation
DROP POLICY IF EXISTS "Anyone can view teachers" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated users can create teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can update teacher records" ON public.teachers;
DROP POLICY IF EXISTS "Super admins can manage all teachers" ON public.teachers;
DROP POLICY IF EXISTS "Super admins can delete teachers" ON public.teachers;

-- Create new, more permissive policies for teachers
CREATE POLICY "Public can view active teachers" ON public.teachers
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
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can delete teachers" ON public.teachers
FOR DELETE TO authenticated
USING (is_super_admin());
