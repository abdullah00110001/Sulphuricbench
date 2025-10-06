
-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-images', 'course-images', true);

-- Create policy to allow authenticated users to upload course images
CREATE POLICY "Allow authenticated users to upload course images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow public access to view course images
CREATE POLICY "Allow public access to course images" ON storage.objects
FOR SELECT USING (bucket_id = 'course-images');

-- Create policy to allow course owners to update their course images
CREATE POLICY "Allow users to update their course images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow course owners to delete their course images
CREATE POLICY "Allow users to delete their course images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-images' AND 
  auth.role() = 'authenticated'
);
