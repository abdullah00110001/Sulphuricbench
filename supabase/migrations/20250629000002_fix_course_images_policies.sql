
-- Fix course-images storage bucket policies
-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to course images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload course images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own course images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own course images" ON storage.objects;

-- Create new permissive policies for course images
CREATE POLICY "Public read access to course images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');

CREATE POLICY "Allow uploads to course images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Allow updates to course images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'course-images');

CREATE POLICY "Allow deletes from course images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'course-images');
