
-- Add course_validity field to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_validity TEXT DEFAULT 'lifetime' CHECK (course_validity IN ('lifetime', '1year', '6months', '3months', '1month'));

-- Add secret_group_link field to courses table  
ALTER TABLE courses ADD COLUMN IF NOT EXISTS secret_group_link TEXT;
