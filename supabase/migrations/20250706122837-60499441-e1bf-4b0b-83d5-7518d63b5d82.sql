
-- Fix teacher deletion policies
DROP POLICY IF EXISTS "Authenticated users can delete teachers" ON public.teachers;

-- Create proper delete policy for teachers
CREATE POLICY "Super admins can delete teachers" ON public.teachers
FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Ensure courses have proper CRUD policies
DROP POLICY IF EXISTS "Allow course deletion" ON public.courses;
DROP POLICY IF EXISTS "Super admins can manage all courses" ON public.courses;

-- Create comprehensive course CRUD policies
CREATE POLICY "Super admins can manage all courses" ON public.courses
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

CREATE POLICY "Course owners can manage own courses" ON public.courses
FOR ALL TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Anyone can view published courses" ON public.courses
FOR SELECT TO public
USING (is_published = true);
