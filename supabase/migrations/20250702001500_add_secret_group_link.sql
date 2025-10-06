
-- Add secret_group_link to courses table if it doesn't exist
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS secret_group_link TEXT;

-- Update existing courses with a placeholder if needed
UPDATE public.courses 
SET secret_group_link = NULL
WHERE secret_group_link IS NULL;
