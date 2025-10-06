-- Create reviews table to replace mock data
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  user_name text NOT NULL,
  user_role text,
  user_company text,
  user_avatar text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR is_current_user_super_admin_enhanced());

CREATE POLICY "Users can create reviews" ON public.reviews  
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id OR is_current_user_super_admin_enhanced());

CREATE POLICY "Super admins can manage all reviews" ON public.reviews
FOR ALL USING (is_current_user_super_admin_enhanced());

-- Insert the existing mock reviews into the database
INSERT INTO public.reviews (user_id, rating, review_text, user_name, user_role, user_company, is_approved)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 5, 'Excellent courses! I learned so much and was able to apply the knowledge immediately in my work.', 'Ahmed Hassan', 'Software Developer', 'TechCorp', true),
  ('00000000-0000-0000-0000-000000000002'::uuid, 5, 'The instructors are very knowledgeable and the content is up-to-date with industry standards.', 'Fatima Khan', 'UI/UX Designer', 'Creative Solutions', true)
ON CONFLICT DO NOTHING;

-- Update the approve_manual_payment function to be more robust
CREATE OR REPLACE FUNCTION public.approve_manual_payment(payment_id uuid, course_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Enhanced super admin check with detailed logging
  DECLARE
    current_user_id uuid := auth.uid();
    current_user_email text;
    is_admin boolean := false;
  BEGIN
    -- Get current user email for logging
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    
    -- Log the authentication attempt
    RAISE LOG 'Manual payment approval attempt by user: % (email: %)', current_user_id, current_user_email;
    
    -- Check multiple ways to determine super admin status
    -- 1. Check via enhanced function
    IF is_current_user_super_admin_enhanced() THEN
      is_admin := true;
      RAISE LOG 'Super admin access via enhanced function confirmed';
    END IF;
    
    -- 2. Check service role
    IF current_setting('role') = 'service_role' THEN
      is_admin := true;
      RAISE LOG 'Super admin access via service role confirmed';
    END IF;
    
    -- 3. Direct email check for super admin emails
    IF current_user_email IN ('abdullahusimin1@gmail.com', 'stv7168@gmail.com', 'abdullahabeer003@gmail.com') THEN
      is_admin := true;
      RAISE LOG 'Super admin access via email whitelist confirmed';
    END IF;
    
    -- 4. Check profiles table directly
    IF EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = current_user_id 
      AND role = 'super_admin'
    ) THEN
      is_admin := true;
      RAISE LOG 'Super admin access via profiles table confirmed';
    END IF;
    
    -- Final check
    IF NOT is_admin THEN
      RAISE LOG 'Access denied for user: % (email: %)', current_user_id, current_user_email;
      RAISE EXCEPTION 'Access denied. Only super admins can approve payments.';
    END IF;
    
    RAISE LOG 'Proceeding with payment approval for payment: %', payment_id;
  END;

  -- Update payment status
  UPDATE manual_payments 
  SET 
    status = 'approved',
    reviewed_by = COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = payment_id;

  -- Create enrollment record
  INSERT INTO enrollments_v2 (
    user_id,
    course_id,
    name,
    email,
    phone,
    enrollment_status
  )
  SELECT 
    mp.user_id,
    mp.course_id,
    mp.full_name,
    COALESCE(p.email, mp.full_name || '@example.com'),
    '',
    'approved'
  FROM manual_payments mp
  LEFT JOIN profiles p ON mp.user_id = p.id
  WHERE mp.id = payment_id
  ON CONFLICT (user_id, course_id) DO NOTHING;

  -- Create invoice
  INSERT INTO invoices (
    user_id,
    course_id,
    amount,
    status,
    invoice_number,
    access_code
  )
  SELECT 
    mp.user_id,
    mp.course_id,
    mp.amount,
    'paid'::invoice_status,
    generate_invoice_number(),
    generate_access_code('', mp.full_name)
  FROM manual_payments mp
  WHERE mp.id = payment_id;
  
  RAISE LOG 'Payment approval completed successfully for payment: %', payment_id;
END;
$function$;