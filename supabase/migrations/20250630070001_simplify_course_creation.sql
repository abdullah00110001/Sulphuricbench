
-- First, drop all existing RLS policies on courses table
DROP POLICY IF EXISTS "Everyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Teachers can manage own courses" ON courses;
DROP POLICY IF EXISTS "Super admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "Super admins and teachers can create courses" ON courses;
DROP POLICY IF EXISTS "Super admins can create courses" ON courses;

-- Disable RLS temporarily to allow simple operations
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simple policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Simple policy: Everyone can view published courses
CREATE POLICY "Anyone can view published courses" ON courses
FOR SELECT USING (is_published = true);

-- Simple policy: Allow all authenticated users to create courses
CREATE POLICY "Authenticated users can create courses" ON courses
FOR INSERT WITH CHECK (true);

-- Simple policy: Allow all authenticated users to update courses
CREATE POLICY "Authenticated users can update courses" ON courses
FOR UPDATE USING (true);

-- Simple policy: Allow all authenticated users to delete courses
CREATE POLICY "Authenticated users can delete courses" ON courses
FOR DELETE USING (true);
