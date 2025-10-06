-- Drop and recreate the function with updated signature
DROP FUNCTION IF EXISTS public.get_manual_payments_with_courses();

-- Recreate get_manual_payments_with_courses with email field
CREATE OR REPLACE FUNCTION public.get_manual_payments_with_courses()
RETURNS TABLE(id uuid, user_id uuid, course_id uuid, full_name text, email text, bkash_number text, transaction_id text, amount numeric, status text, created_at timestamp with time zone, courses jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Always return data for super admins or service role
  RETURN QUERY
  SELECT 
    mp.id,
    mp.user_id,
    mp.course_id,
    mp.full_name,
    COALESCE(p.email, mp.full_name || '@example.com') as email,
    mp.bkash_number,
    mp.transaction_id,
    mp.amount,
    mp.status,
    mp.created_at,
    jsonb_build_object('title', c.title) as courses
  FROM manual_payments mp
  LEFT JOIN courses c ON mp.course_id = c.id
  LEFT JOIN profiles p ON mp.user_id = p.id
  ORDER BY mp.created_at DESC;
END;
$function$;

-- Update approve_manual_payment to work with super admin auth
CREATE OR REPLACE FUNCTION public.approve_manual_payment(payment_id uuid, course_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is super admin (allow service role and super admin authentication)
  IF NOT (is_current_user_super_admin_enhanced() OR current_setting('role') = 'service_role') THEN
    RAISE EXCEPTION 'Access denied. Only super admins can approve payments.';
  END IF;

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
END;
$function$;

-- Update reject_manual_payment to work with super admin auth
CREATE OR REPLACE FUNCTION public.reject_manual_payment(payment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is super admin (allow service role and super admin authentication)
  IF NOT (is_current_user_super_admin_enhanced() OR current_setting('role') = 'service_role') THEN
    RAISE EXCEPTION 'Access denied. Only super admins can reject payments.';
  END IF;

  -- Update payment status
  UPDATE manual_payments 
  SET 
    status = 'rejected',
    reviewed_by = COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = payment_id;
END;
$function$;