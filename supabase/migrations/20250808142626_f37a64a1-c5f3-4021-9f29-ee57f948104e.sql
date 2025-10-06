-- Create missing manual_payments table
CREATE TABLE IF NOT EXISTS public.manual_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bkash_number TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bkash_manual',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on manual_payments table
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for manual_payments
CREATE POLICY "Users can create own manual payments" 
ON public.manual_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own manual payments" 
ON public.manual_payments 
FOR SELECT 
USING (auth.uid() = user_id OR is_current_user_super_admin_enhanced());

CREATE POLICY "Super admins can manage all manual payments" 
ON public.manual_payments 
FOR ALL 
USING (is_current_user_super_admin_enhanced());

-- Fix profiles table RLS policy for teacher creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id OR is_current_user_super_admin_enhanced());

-- Allow users to update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id OR is_current_user_super_admin_enhanced());

-- Add trigger for updated_at on manual_payments
CREATE TRIGGER update_manual_payments_updated_at
BEFORE UPDATE ON public.manual_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();