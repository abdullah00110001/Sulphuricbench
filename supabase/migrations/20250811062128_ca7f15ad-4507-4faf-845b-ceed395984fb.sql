-- Create payment_settings table
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sslcommerz_enabled BOOLEAN NOT NULL DEFAULT true,
  bkash_enabled BOOLEAN NOT NULL DEFAULT true,
  sslcommerz_store_id TEXT,
  sslcommerz_store_password TEXT,
  bkash_instructions TEXT DEFAULT 'Please send money to our bKash merchant number and submit your transaction details below.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for super admins only
CREATE POLICY "Super admins can manage payment settings" 
ON public.payment_settings 
FOR ALL 
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Insert default settings
INSERT INTO public.payment_settings (sslcommerz_enabled, bkash_enabled)
VALUES (true, true)
ON CONFLICT DO NOTHING;