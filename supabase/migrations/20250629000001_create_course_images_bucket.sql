
-- Create course-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS for course-images bucket
CREATE POLICY "Allow public read access to course images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');

CREATE POLICY "Allow authenticated users to upload course images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Allow users to update their own course images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-images');

CREATE POLICY "Allow users to delete their own course images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-images');
