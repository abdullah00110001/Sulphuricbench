-- Fix security vulnerability in teacher application tables
-- Remove ALL existing RLS policies and implement proper access control

-- Drop ALL existing policies for teacher_applications
DROP POLICY IF EXISTS "Users can view their own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "teacher_applications_select_policy" ON public.teacher_applications;
DROP POLICY IF EXISTS "Anyone can create teacher applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "teacher_applications_insert_policy" ON public.teacher_applications;
DROP POLICY IF EXISTS "Super admins can update applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Super admins can view all applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "teacher_applications_update_policy" ON public.teacher_applications;

-- Drop ALL existing policies for teacher_registrations  
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Anyone can create teacher registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Users can create their own teacher registration" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Super admins can update registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Super admins can view all registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Super admins can update teacher registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Super admins can view all teacher registrations" ON public.teacher_registrations;

-- Drop ALL existing policies for teacher_applications_v2
DROP POLICY IF EXISTS "Users can view own applications" ON public.teacher_applications_v2;
DROP POLICY IF EXISTS "Users can create own applications" ON public.teacher_applications_v2;
DROP POLICY IF EXISTS "Super admins have full access to teacher_applications_v2" ON public.teacher_applications_v2;

-- Create secure policies for teacher_applications
CREATE POLICY "Secure: Users create own applications" 
ON public.teacher_applications 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Secure: Users view own applications" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Secure: Super admins manage applications" 
ON public.teacher_applications 
FOR ALL
TO authenticated
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Create secure policies for teacher_registrations
CREATE POLICY "Secure: Users create own registrations" 
ON public.teacher_registrations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Secure: Users view own registrations" 
ON public.teacher_registrations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Secure: Super admins manage registrations" 
ON public.teacher_registrations 
FOR ALL
TO authenticated
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Create secure policies for teacher_applications_v2
CREATE POLICY "Secure: Users create own applications v2" 
ON public.teacher_applications_v2 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Secure: Users view own applications v2" 
ON public.teacher_applications_v2 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Secure: Super admins manage applications v2" 
ON public.teacher_applications_v2 
FOR ALL
TO authenticated
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());