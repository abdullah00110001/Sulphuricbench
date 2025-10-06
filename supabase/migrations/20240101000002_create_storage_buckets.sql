
-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('uploads', 'uploads', true),
  ('profile-pictures', 'profile-pictures', true),
  ('course-videos', 'course-videos', true),
  ('course-materials', 'course-materials', true),
  ('blog-images', 'blog-images', true),
  ('blog-attachments', 'blog-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Users can update their own uploads" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own uploads" ON storage.objects FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for profile-pictures bucket
CREATE POLICY "Anyone can view profile pictures" ON storage.objects FOR SELECT USING (bucket_id = 'profile-pictures');
CREATE POLICY "Authenticated users can upload profile pictures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-pictures');
CREATE POLICY "Users can update their own profile pictures" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for course-videos bucket
CREATE POLICY "Anyone can view course videos" ON storage.objects FOR SELECT USING (bucket_id = 'course-videos');
CREATE POLICY "Teachers can upload course videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'course-videos' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'super_admin'))
);
CREATE POLICY "Teachers can manage their course videos" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'course-videos' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'super_admin'))
);
CREATE POLICY "Teachers can delete their course videos" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'course-videos' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'super_admin'))
);

-- Set up storage policies for course-materials bucket
CREATE POLICY "Enrolled students can view course materials" ON storage.objects FOR SELECT USING (
  bucket_id = 'course-materials' AND (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'super_admin')) OR
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = auth.uid() AND (storage.foldername(name))[2] = c.id::text
    )
  )
);
CREATE POLICY "Teachers can upload course materials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'course-materials' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'super_admin'))
);

-- Set up storage policies for blog images and attachments
CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can view blog attachments" ON storage.objects FOR SELECT USING (bucket_id = 'blog-attachments');
CREATE POLICY "Authenticated users can upload blog attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-attachments');
