
-- Fix the migration by properly dropping existing policies first
DROP POLICY IF EXISTS "Users can create own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Super admins can manage all payments" ON payments;

-- Drop existing enrollment policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can enroll in courses" ON enrollments;
DROP POLICY IF EXISTS "Students can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments in their courses" ON enrollments;
DROP POLICY IF EXISTS "Teachers can view course enrollments" ON enrollments;
DROP POLICY IF EXISTS "Super admins can view all enrollments" ON enrollments;

-- Create security definer functions to avoid recursion (if they don't exist)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Now create the payments policies
CREATE POLICY "Users can view own payments" ON payments
FOR SELECT USING (auth.uid() = user_id OR public.is_super_admin());

CREATE POLICY "Users can create own payments" ON payments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all payments" ON payments
FOR ALL USING (public.is_super_admin());

-- Create enrollment policies
CREATE POLICY "Students can view own enrollments" ON enrollments
FOR SELECT USING (auth.uid() = student_id OR public.is_super_admin());

CREATE POLICY "Students can create enrollments" ON enrollments
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view course enrollments" ON enrollments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()) 
  OR public.is_super_admin()
);

CREATE POLICY "Super admins can manage all enrollments" ON enrollments
FOR ALL USING (public.is_super_admin());

-- Create teacher applications table
CREATE TABLE IF NOT EXISTS teacher_applications_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  experience TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  portfolio_url TEXT,
  bio TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on teacher applications
ALTER TABLE teacher_applications_v2 ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher applications
DROP POLICY IF EXISTS "Users can create own applications" ON teacher_applications_v2;
DROP POLICY IF EXISTS "Users can view own applications" ON teacher_applications_v2;
DROP POLICY IF EXISTS "Super admins can manage all applications" ON teacher_applications_v2;

CREATE POLICY "Users can create own applications" ON teacher_applications_v2
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own applications" ON teacher_applications_v2
FOR SELECT USING (auth.uid() = user_id OR public.is_super_admin());

CREATE POLICY "Super admins can manage all applications" ON teacher_applications_v2
FOR ALL USING (public.is_super_admin());

-- Update dashboard stats function
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
  total_users bigint, 
  total_students bigint, 
  total_teachers bigint, 
  pending_teachers bigint, 
  total_courses bigint, 
  today_signups bigint
) 
LANGUAGE sql 
STABLE SECURITY DEFINER
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher' AND approval_status = 'approved') as total_teachers,
    (SELECT COUNT(*) FROM public.teacher_applications_v2 WHERE status = 'pending') + 
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher' AND approval_status = 'pending') as pending_teachers,
    (SELECT COUNT(*) FROM public.courses WHERE is_published = true) as total_courses,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE) as today_signups;
$$;
