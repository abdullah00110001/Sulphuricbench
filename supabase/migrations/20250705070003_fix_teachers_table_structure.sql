
-- Ensure teachers table has all required columns
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Make sure the table structure is correct
DO $$ 
BEGIN
    -- Check if we need to add any missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teachers' AND column_name = 'image_url') THEN
        ALTER TABLE public.teachers ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teachers' AND column_name = 'institution') THEN
        ALTER TABLE public.teachers ADD COLUMN institution TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teachers' AND column_name = 'is_active') THEN
        ALTER TABLE public.teachers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teachers' AND column_name = 'experience_years') THEN
        ALTER TABLE public.teachers ADD COLUMN experience_years INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teachers' AND column_name = 'bio') THEN
        ALTER TABLE public.teachers ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
