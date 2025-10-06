
-- Ensure teacher-images bucket exists with proper configuration
DO $$
DECLARE
    bucket_exists boolean;
BEGIN
    -- Check if bucket exists
    SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'teacher-images') INTO bucket_exists;
    
    IF NOT bucket_exists THEN
        -- Create bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'teacher-images', 
            'teacher-images', 
            true, 
            5242880, -- 5MB limit
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        );
    ELSE
        -- Update existing bucket to ensure proper configuration
        UPDATE storage.buckets 
        SET 
            public = true,
            file_size_limit = 5242880,
            allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        WHERE id = 'teacher-images';
    END IF;
END $$;

-- Ensure RLS policies are correctly set up
DROP POLICY IF EXISTS "Public can view teacher images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload teacher images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update teacher images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete teacher images" ON storage.objects;

-- Create policies for the teacher-images bucket
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
