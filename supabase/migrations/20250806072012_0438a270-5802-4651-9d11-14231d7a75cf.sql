
-- Add new payment methods and update existing tables
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bkash_manual';

-- Create a new table for manual payment submissions
CREATE TABLE IF NOT EXISTS manual_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bkash_number TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'bkash_manual',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS on manual_payments table
ALTER TABLE manual_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for manual_payments
CREATE POLICY "Users can view own manual payments" 
ON manual_payments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own manual payments" 
ON manual_payments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all manual payments" 
ON manual_payments FOR ALL 
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Add payment settings to site_settings if not exists
INSERT INTO site_settings (key, value, description) 
VALUES 
  ('sslcommerz_enabled', 'true', 'Enable/disable SSLCommerz payment method'),
  ('bkash_manual_enabled', 'true', 'Enable/disable bKash manual payment method'),
  ('bkash_merchant_number', '01309878503', 'bKash merchant number for manual payments')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_manual_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manual_payments_updated_at
BEFORE UPDATE ON manual_payments
FOR EACH ROW
EXECUTE FUNCTION update_manual_payments_updated_at();
