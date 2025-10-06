-- Fix RLS policies for teachers table to allow authenticated users to insert
DROP POLICY IF EXISTS "Enable teacher creation for authenticated users" ON public.teachers;

-- Create new policy that allows super admins to insert teachers
CREATE POLICY "Super admins can manage teachers" 
ON public.teachers 
FOR ALL 
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Also allow service role to bypass RLS completely
CREATE POLICY "Service role can manage teachers" 
ON public.teachers 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- Update course_categories to have SSC, HSC, Admission options
DELETE FROM public.course_categories;
INSERT INTO public.course_categories (name, description, color) VALUES
('SSC', 'Secondary School Certificate courses', '#3B82F6'),
('HSC', 'Higher Secondary Certificate courses', '#10B981'),
('Admission', 'Admission test preparation courses', '#F59E0B');

-- Create teacher-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('teacher-images', 'teacher-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for teacher images
CREATE POLICY "Anyone can view teacher images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'teacher-images');

CREATE POLICY "Authenticated users can upload teacher images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'teacher-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update teacher images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'teacher-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete teacher images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'teacher-images' AND auth.uid() IS NOT NULL);