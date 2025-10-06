
-- Ensure teacher-images storage bucket exists and is properly configured
DO $$
BEGIN
    -- Insert bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'teacher-images', 
        'teacher-images', 
        true, 
        5242880, -- 5MB limit
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Bucket creation handled: %', SQLERRM;
END $$;

-- Ensure RLS policies exist for the teacher-images bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public can view teacher images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload teacher images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update teacher images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete teacher images" ON storage.objects;

    -- Create new policies
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
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Policy creation handled: %', SQLERRM;
END $$;
