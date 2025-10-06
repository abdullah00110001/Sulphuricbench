
-- First, let's create the course categories table with the three main categories
CREATE TABLE IF NOT EXISTS public.course_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#00CFFF',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert the three main categories
INSERT INTO public.course_categories (name, description, color) 
VALUES 
  ('SSC', 'Secondary School Certificate courses', '#00CFFF'),
  ('HSC', 'Higher Secondary Certificate courses', '#00CFFF'),
  ('Admission', 'University admission preparation courses', '#00CFFF')
ON CONFLICT (name) DO NOTHING;

-- Create teachers table for teacher profiles
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text UNIQUE,
  phone text,
  bio text,
  avatar_url text,
  qualifications text,
  experience_years integer DEFAULT 0,
  specializations text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Update courses table to include category_id and teacher assignments
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.course_categories(id),
ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.teachers(id),
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Create course_teachers junction table for multiple teacher assignments
CREATE TABLE IF NOT EXISTS public.course_teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  role text DEFAULT 'instructor',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(course_id, teacher_id)
);

-- Add RLS policies for new tables
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_teachers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and teachers
CREATE POLICY "Allow public read access to course categories" ON public.course_categories FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to teachers" ON public.teachers FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to course teachers" ON public.course_teachers FOR SELECT TO public USING (true);

-- Allow authenticated users to manage these tables
CREATE POLICY "Allow authenticated users to manage course categories" ON public.course_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage teachers" ON public.teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage course teachers" ON public.course_teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
