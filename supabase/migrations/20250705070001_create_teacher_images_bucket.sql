
-- Create teacher-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('teacher-images', 'teacher-images', true)
ON CONFLICT DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public can view teacher images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'teacher-images');

CREATE POLICY "Authenticated users can upload teacher images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'teacher-images');

CREATE POLICY "Authenticated users can update teacher images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'teacher-images')
WITH CHECK (bucket_id = 'teacher-images');

CREATE POLICY "Authenticated users can delete teacher images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'teacher-images');
