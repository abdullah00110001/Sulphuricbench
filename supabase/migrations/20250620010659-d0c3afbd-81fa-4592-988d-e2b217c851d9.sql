
-- Add verification codes table for email verification
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  code_type TEXT NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add course categories table
CREATE TABLE IF NOT EXISTS public.course_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add course ratings table
CREATE TABLE IF NOT EXISTS public.course_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Add blog upvotes table
CREATE TABLE IF NOT EXISTS public.blog_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blog_id, user_id)
);

-- Add teacher applications table
CREATE TABLE IF NOT EXISTS public.teacher_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  qualifications TEXT NOT NULL,
  experience TEXT NOT NULL,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update courses table to add missing columns
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.course_categories(id);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS preview_video_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0;

-- Update profiles table to add missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Insert default course categories
INSERT INTO public.course_categories (name, description, color) VALUES 
  ('Programming', 'Software development and coding courses', '#10B981'),
  ('Robotics', 'Robotics and automation courses', '#F59E0B'),
  ('AI & Machine Learning', 'Artificial intelligence and ML courses', '#8B5CF6'),
  ('Web Development', 'Frontend and backend web development', '#EF4444'),
  ('Mobile Development', 'iOS and Android app development', '#06B6D4'),
  ('Data Science', 'Data analysis and visualization', '#EC4899'),
  ('Cybersecurity', 'Information security and ethical hacking', '#6366F1'),
  ('Design', 'UI/UX and graphic design courses', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS for new tables
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for verification codes
CREATE POLICY "Anyone can insert verification codes" ON public.verification_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Only system can manage verification codes" ON public.verification_codes FOR ALL USING (false);

-- RLS policies for course categories
CREATE POLICY "Anyone can view course categories" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Only super admins can manage categories" ON public.course_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- RLS policies for course ratings
CREATE POLICY "Anyone can view course ratings" ON public.course_ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage their own ratings" ON public.course_ratings FOR ALL USING (auth.uid() = user_id);

-- RLS policies for blog upvotes
CREATE POLICY "Anyone can view blog upvotes" ON public.blog_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own upvotes" ON public.blog_upvotes FOR ALL USING (auth.uid() = user_id);

-- RLS policies for teacher applications
CREATE POLICY "Users can view their own applications" ON public.teacher_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own applications" ON public.teacher_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can view all applications" ON public.teacher_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Super admins can update applications" ON public.teacher_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Functions for verification codes
CREATE OR REPLACE FUNCTION public.generate_verification_code(email_param TEXT, code_type_param TEXT DEFAULT 'email_verification')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate 6-digit code
  code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Delete existing unused codes for this email and type
  DELETE FROM public.verification_codes 
  WHERE email = email_param 
  AND code_type = code_type_param 
  AND used_at IS NULL;
  
  -- Insert new code
  INSERT INTO public.verification_codes (email, code, code_type)
  VALUES (email_param, code, code_type_param);
  
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_email_code(email_param TEXT, code_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record public.verification_codes;
BEGIN
  -- Find the code
  SELECT * INTO code_record
  FROM public.verification_codes
  WHERE email = email_param 
  AND code = code_param 
  AND code_type = 'email_verification'
  AND used_at IS NULL
  AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If code not found or expired
  IF code_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Mark code as used
  UPDATE public.verification_codes
  SET used_at = now()
  WHERE id = code_record.id;
  
  RETURN TRUE;
END;
$$;

-- Function to get course analytics with ratings
CREATE OR REPLACE FUNCTION public.get_course_with_ratings(course_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  course_id UUID,
  title TEXT,
  instructor_name TEXT,
  thumbnail_url TEXT,
  price NUMERIC,
  average_rating NUMERIC,
  total_ratings BIGINT,
  total_students BIGINT,
  category_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    c.id as course_id,
    c.title,
    p.full_name as instructor_name,
    c.thumbnail_url,
    c.price,
    ROUND(AVG(cr.rating)::numeric, 1) as average_rating,
    COUNT(cr.rating) as total_ratings,
    COUNT(DISTINCT e.student_id) as total_students,
    cc.name as category_name
  FROM public.courses c
  LEFT JOIN public.profiles p ON c.instructor_id = p.id
  LEFT JOIN public.course_ratings cr ON c.id = cr.course_id
  LEFT JOIN public.enrollments e ON c.id = e.course_id
  LEFT JOIN public.course_categories cc ON c.category_id = cc.id
  WHERE c.is_published = true
  AND (course_id_param IS NULL OR c.id = course_id_param)
  GROUP BY c.id, c.title, p.full_name, c.thumbnail_url, c.price, cc.name
  ORDER BY average_rating DESC NULLS LAST, total_students DESC;
$$;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  points INTEGER,
  level INTEGER,
  total_blogs BIGINT,
  total_upvotes BIGINT,
  completed_courses BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.points,
    p.level,
    COUNT(DISTINCT b.id) as total_blogs,
    COUNT(DISTINCT bu.id) as total_upvotes,
    COUNT(DISTINCT e.id) FILTER (WHERE e.progress_percentage = 100) as completed_courses
  FROM public.profiles p
  LEFT JOIN public.blogs b ON p.id = b.author_id AND b.is_published = true
  LEFT JOIN public.blog_upvotes bu ON b.id = bu.blog_id
  LEFT JOIN public.enrollments e ON p.id = e.student_id
  WHERE p.role IN ('student', 'teacher')
  GROUP BY p.id, p.full_name, p.avatar_url, p.points, p.level
  ORDER BY p.points DESC, total_upvotes DESC
  LIMIT limit_count;
$$;

-- Enable realtime for new tables
ALTER TABLE public.course_ratings REPLICA IDENTITY FULL;
ALTER TABLE public.blog_upvotes REPLICA IDENTITY FULL;
ALTER TABLE public.teacher_applications REPLICA IDENTITY FULL;

ALTER publication supabase_realtime ADD TABLE public.course_ratings;
ALTER publication supabase_realtime ADD TABLE public.blog_upvotes;
ALTER publication supabase_realtime ADD TABLE public.teacher_applications;

-- Update triggers
CREATE TRIGGER update_teacher_applications_updated_at BEFORE UPDATE ON public.teacher_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
