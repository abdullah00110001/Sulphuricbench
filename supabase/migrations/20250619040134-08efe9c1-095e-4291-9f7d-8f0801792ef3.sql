
-- Create missing tables for super admin functionality
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_tags_relation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  UNIQUE(blog_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES 
  ('terms_of_service', '{"content": "Terms of Service content goes here..."}', 'Terms of Service content'),
  ('privacy_policy', '{"content": "Privacy Policy content goes here..."}', 'Privacy Policy content'),
  ('site_maintenance', '{"enabled": false, "message": "Site is under maintenance"}', 'Site maintenance mode'),
  ('registration_enabled', '{"enabled": true}', 'User registration toggle')
ON CONFLICT (key) DO NOTHING;

-- Add RLS policies for new tables
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags_relation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Blog tags policies
CREATE POLICY "Anyone can view blog tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage blog tags" ON public.blog_tags FOR ALL USING (auth.role() = 'authenticated');

-- Blog tags relation policies
CREATE POLICY "Anyone can view blog tag relations" ON public.blog_tags_relation FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage blog tag relations" ON public.blog_tags_relation FOR ALL USING (auth.role() = 'authenticated');

-- Course modules policies
CREATE POLICY "Anyone can view published course modules" ON public.course_modules FOR SELECT USING (is_published = true);
CREATE POLICY "Course owners can manage their modules" ON public.course_modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_modules.course_id 
    AND instructor_id = auth.uid()
  )
);
CREATE POLICY "Super admins can manage all modules" ON public.course_modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Course progress policies
CREATE POLICY "Users can view their own progress" ON public.course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.course_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all progress" ON public.course_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Only super admins can manage site settings" ON public.site_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Enable realtime for important tables
ALTER TABLE public.course_progress REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.course_progress;
ALTER publication supabase_realtime ADD TABLE public.announcements;

-- Add analytics functions
CREATE OR REPLACE FUNCTION public.get_user_analytics()
RETURNS TABLE (
  total_students BIGINT,
  total_teachers BIGINT,
  total_super_admins BIGINT,
  pending_teachers BIGINT,
  daily_signups BIGINT,
  active_courses BIGINT
) 
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher' AND approval_status = 'approved') as total_teachers,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'super_admin') as total_super_admins,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher' AND approval_status = 'pending') as pending_teachers,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE) as daily_signups,
    (SELECT COUNT(*) FROM public.courses WHERE is_published = true) as active_courses;
$$;

-- Add course analytics function
CREATE OR REPLACE FUNCTION public.get_course_analytics()
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  instructor_name TEXT,
  enrollment_count BIGINT,
  completion_rate NUMERIC,
  average_progress NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    c.id as course_id,
    c.title as course_title,
    p.full_name as instructor_name,
    COUNT(e.id) as enrollment_count,
    ROUND(
      (COUNT(CASE WHEN e.progress_percentage = 100 THEN 1 END) * 100.0 / NULLIF(COUNT(e.id), 0))::numeric, 2
    ) as completion_rate,
    ROUND(AVG(e.progress_percentage)::numeric, 2) as average_progress
  FROM public.courses c
  LEFT JOIN public.profiles p ON c.instructor_id = p.id
  LEFT JOIN public.enrollments e ON c.id = e.course_id
  WHERE c.is_published = true
  GROUP BY c.id, c.title, p.full_name
  ORDER BY enrollment_count DESC;
$$;

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON public.course_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
