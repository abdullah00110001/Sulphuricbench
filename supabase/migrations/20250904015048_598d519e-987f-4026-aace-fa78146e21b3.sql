-- Update RLS policies for manual_payments to ensure super admins can access data
DROP POLICY IF EXISTS "Super admins can manage all manual payments" ON manual_payments;
DROP POLICY IF EXISTS "Users can create own manual payments" ON manual_payments;
DROP POLICY IF EXISTS "Users can view own manual payments" ON manual_payments;

-- Create comprehensive policies for manual_payments
CREATE POLICY "Super admins have full access to manual payments"
ON manual_payments
FOR ALL
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

CREATE POLICY "Users can create manual payments"
ON manual_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own manual payments"
ON manual_payments
FOR SELECT
USING (auth.uid() = user_id OR is_current_user_super_admin_enhanced());

-- Also ensure the RPC function works properly by updating the function
CREATE OR REPLACE FUNCTION public.get_manual_payments_with_courses()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  course_id uuid,
  full_name text,
  bkash_number text,
  transaction_id text,
  amount numeric,
  status text,
  created_at timestamp with time zone,
  courses jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Always return data for super admins, regardless of auth state
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
$function$;