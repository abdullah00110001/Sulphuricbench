
-- Add missing columns to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[],
ADD COLUMN IF NOT EXISTS about_course TEXT,
ADD COLUMN IF NOT EXISTS instructor_bio TEXT;

-- Update existing courses to have some default learning outcomes if none exist
UPDATE public.courses 
SET learning_outcomes = ARRAY[
  'How to improve your English communication skills.',
  'How to talk to others eloquently and effectively.',
  'How to maintain your body language during interviews and presentations.',
  'How to communicate via SMS, chat and Email, maintaining proper etiquettes.',
  'How to overcome nervousness and improve confidence.'
]
WHERE learning_outcomes IS NULL OR array_length(learning_outcomes, 1) IS NULL;

-- Update existing courses to have default about_course content if none exists
UPDATE public.courses 
SET about_course = 'Are you having trouble networking due to the lack of proper communication skills? Do you often struggle to start a conversation when you meet someone for the first time?

Communication skill is currently one of the most important soft skills to have, because it has a huge impact on your career. The better you can communicate with others, the faster you can connect with them. But we often hesitate or feel nervous while trying to communicate with others. We sometimes end up losing valuable opportunities for not being able to approach others properly.

To help you overcome your fear of communication so that you never have to miss out on another opportunity, Ten Minute School brings to you the "Communication Hacks" course. From this free course, you will be able to learn how to improve your communication skills, how to criticize someone without offending them, how to turn a negative thought into an optimistic one, how to overcome your fear of presentation, how to control your anger, proper etiquettes to maintain while introducing yourself, tricks to make others like you, and much more! So hurry up and enroll in this course to communicate better!'
WHERE about_course IS NULL OR about_course = '';

-- Update instructor bio for existing profiles
UPDATE public.profiles 
SET bio = 'Educational Content Creator; Digital Media Strategist; Author.'
WHERE role = 'teacher' AND (bio IS NULL OR bio = '');
