
-- Create RPC function to insert manual payments
CREATE OR REPLACE FUNCTION insert_manual_payment(
  user_id uuid,
  course_id uuid,
  full_name text,
  bkash_number text,
  transaction_id text,
  amount numeric,
  payment_method text DEFAULT 'bkash_manual'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO manual_payments (
    user_id,
    course_id,
    full_name,
    bkash_number,
    transaction_id,
    amount,
    payment_method,
    status
  ) VALUES (
    user_id,
    course_id,
    full_name,
    bkash_number,
    transaction_id,
    amount,
    payment_method,
    'pending'
  );
END;
$$;

-- Create RPC function to get manual payments with course information
CREATE OR REPLACE FUNCTION get_manual_payments_with_courses()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  course_id uuid,
  full_name text,
  bkash_number text,
  transaction_id text,
  amount numeric,
  status text,
  created_at timestamptz,
  courses jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT is_current_user_super_admin_enhanced() THEN
    RAISE EXCEPTION 'Access denied. Only super admins can view all manual payments.';
  END IF;

  RETURN QUERY
  SELECT 
    mp.id,
    mp.user_id,
    mp.course_id,
    mp.full_name,
    mp.bkash_number,
    mp.transaction_id,
    mp.amount,
    mp.status,
    mp.created_at,
    jsonb_build_object('title', c.title) as courses
  FROM manual_payments mp
  LEFT JOIN courses c ON mp.course_id = c.id
  ORDER BY mp.created_at DESC;
END;
$$;

-- Create RPC function to approve manual payment
CREATE OR REPLACE FUNCTION approve_manual_payment(
  payment_id uuid,
  course_id uuid,
  user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT is_current_user_super_admin_enhanced() THEN
    RAISE EXCEPTION 'Access denied. Only super admins can approve payments.';
  END IF;

  -- Update payment status
  UPDATE manual_payments 
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
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
    p.email,
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
$$;

-- Create RPC function to reject manual payment
CREATE OR REPLACE FUNCTION reject_manual_payment(
  payment_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT is_current_user_super_admin_enhanced() THEN
    RAISE EXCEPTION 'Access denied. Only super admins can reject payments.';
  END IF;

  -- Update payment status
  UPDATE manual_payments 
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = payment_id;
END;
$$;
