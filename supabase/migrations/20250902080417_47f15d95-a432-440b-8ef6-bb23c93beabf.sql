-- Fix security vulnerability in teacher application tables
-- Remove overly permissive RLS policies and implement proper access control

-- Drop existing problematic policies for teacher_applications
DROP POLICY IF EXISTS "Users can view their own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "teacher_applications_select_policy" ON public.teacher_applications;
DROP POLICY IF EXISTS "Anyone can create teacher applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "teacher_applications_insert_policy" ON public.teacher_applications;

-- Drop existing problematic policies for teacher_registrations  
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Anyone can create teacher registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Users can create their own teacher registration" ON public.teacher_registrations;

-- Drop existing problematic policies for teacher_applications_v2
DROP POLICY IF EXISTS "Users can view own applications" ON public.teacher_applications_v2;
DROP POLICY IF EXISTS "Users can create own applications" ON public.teacher_applications_v2;

-- Create secure policies for teacher_applications
CREATE POLICY "Authenticated users can create teacher applications" 
ON public.teacher_applications 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own applications" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all teacher applications" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (is_current_user_super_admin_enhanced());

-- Create secure policies for teacher_registrations
CREATE POLICY "Authenticated users can create teacher registrations" 
ON public.teacher_registrations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own registrations" 
ON public.teacher_registrations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all teacher registrations" 
ON public.teacher_registrations 
FOR SELECT 
TO authenticated
USING (is_current_user_super_admin_enhanced());

-- Create secure policies for teacher_applications_v2
CREATE POLICY "Authenticated users can create teacher applications v2" 
ON public.teacher_applications_v2 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own applications v2" 
ON public.teacher_applications_v2 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all teacher applications v2" 
ON public.teacher_applications_v2 
FOR SELECT 
TO authenticated
USING (is_current_user_super_admin_enhanced());