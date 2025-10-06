-- Fix search path for functions to address security warnings
DROP FUNCTION IF EXISTS public.generate_verification_code(uuid, text);
DROP FUNCTION IF EXISTS public.set_course_instructor();
DROP FUNCTION IF EXISTS public.assign_default_thumbnail();
DROP FUNCTION IF EXISTS public.assign_default_teacher_image();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_verification_code(user_id_param uuid, code_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
BEGIN
  -- Generate 6-digit code
  code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Store code (you might want to create a verification_codes table for this)
  -- For now, we'll return the code directly
  RETURN code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_course_instructor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- If instructor_id is not set, set it to the current authenticated user
  IF NEW.instructor_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.instructor_id := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.assign_default_thumbnail()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- If no thumbnail_url provided, assign a default based on category or use generic
  IF NEW.thumbnail_url IS NULL OR NEW.thumbnail_url = '' THEN
    NEW.thumbnail_url := 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.assign_default_teacher_image()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- If no image_url provided, assign a default
  IF NEW.image_url IS NULL OR NEW.image_url = '' THEN
    NEW.image_url := 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
  END IF;
  
  RETURN NEW;
END;
$function$;