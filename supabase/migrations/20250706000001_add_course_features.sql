
-- Add new columns to courses table for enhanced features
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS secret_group_link TEXT,
ADD COLUMN IF NOT EXISTS available_batches TEXT[],
ADD COLUMN IF NOT EXISTS instructors TEXT[];

-- Update existing courses to have empty arrays for new fields
UPDATE courses 
SET 
  available_batches = ARRAY[]::TEXT[],
  instructors = ARRAY[]::TEXT[]
WHERE 
  available_batches IS NULL 
  OR instructors IS NULL;
