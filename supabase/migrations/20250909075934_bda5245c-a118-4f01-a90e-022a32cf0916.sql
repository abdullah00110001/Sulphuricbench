-- Fix search path security issues for the functions
CREATE OR REPLACE FUNCTION public.approve_manual_payment(payment_id uuid, course_id uuid, user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Simple authentication check - just check if it's a super admin email
  DECLARE
    current_email text;
    is_super_admin boolean := false;
  BEGIN
    -- Get current user email from profiles
    SELECT email INTO current_email FROM public.profiles WHERE id = auth.uid();
    
    -- Check if it's a super admin email
    IF current_email IN ('abdullahusimin1@gmail.com', 'stv7168@gmail.com', 'abdullahabeer003@gmail.com') THEN
      is_super_admin := true;
    END IF;
    
    -- Always allow service role
    IF current_setting('role') = 'service_role' THEN
      is_super_admin := true;
    END IF;
    
    -- If no email found but auth.uid() exists, still allow (for mock sessions)
    IF current_email IS NULL AND auth.uid() IS NOT NULL THEN
      is_super_admin := true;
    END IF;
    
    IF NOT is_super_admin THEN
      RAISE EXCEPTION 'Access denied. Super admin access required.';
    END IF;
  END;

  -- Update payment status - no foreign key constraints
  UPDATE public.manual_payments 
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = payment_id;

  -- Create enrollment record
  INSERT INTO public.enrollments_v2 (
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
  FROM public.manual_payments mp
  LEFT JOIN public.profiles p ON mp.user_id = p.id
  WHERE mp.id = payment_id
  ON CONFLICT (user_id, course_id) DO NOTHING;

  -- Create invoice
  INSERT INTO public.invoices (
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
    public.generate_invoice_number(),
    public.generate_access_code('', mp.full_name)
  FROM public.manual_payments mp
  WHERE mp.id = payment_id;
END;
$function$;

-- Update the reject_manual_payment function with proper search path
CREATE OR REPLACE FUNCTION public.reject_manual_payment(payment_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Simple authentication check - just check if it's a super admin email
  DECLARE
    current_email text;
    is_super_admin boolean := false;
  BEGIN
    -- Get current user email from profiles
    SELECT email INTO current_email FROM public.profiles WHERE id = auth.uid();
    
    -- Check if it's a super admin email
    IF current_email IN ('abdullahusimin1@gmail.com', 'stv7168@gmail.com', 'abdullahabeer003@gmail.com') THEN
      is_super_admin := true;
    END IF;
    
    -- Always allow service role
    IF current_setting('role') = 'service_role' THEN
      is_super_admin := true;
    END IF;
    
    -- If no email found but auth.uid() exists, still allow (for mock sessions)
    IF current_email IS NULL AND auth.uid() IS NOT NULL THEN
      is_super_admin := true;
    END IF;
    
    IF NOT is_super_admin THEN
      RAISE EXCEPTION 'Access denied. Super admin access required.';
    END IF;
  END;

  -- Update payment status - no foreign key constraints
  UPDATE public.manual_payments 
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = payment_id;
END;
$function$;