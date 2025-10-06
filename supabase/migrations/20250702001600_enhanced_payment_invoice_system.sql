
-- Create enhanced payments table if not exists
CREATE TABLE IF NOT EXISTS public.payments_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  transaction_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  payment_method payment_method DEFAULT 'sslcommerz',
  payment_status payment_status DEFAULT 'pending',
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  batch TEXT,
  institution TEXT,
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced invoices table if not exists
CREATE TABLE IF NOT EXISTS public.invoices_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id TEXT UNIQUE NOT NULL,
  payment_id UUID REFERENCES payments_enhanced(id),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  access_code TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  batch TEXT,
  institution TEXT,
  amount DECIMAL(10,2) NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices_enhanced ENABLE ROW LEVEL SECURITY;

-- Create policies for payments_enhanced
CREATE POLICY "Users can view own payments" ON payments_enhanced
FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "Super admins can manage all payments" ON payments_enhanced
FOR ALL USING (is_super_admin());

CREATE POLICY "System can create payments" ON payments_enhanced
FOR INSERT WITH CHECK (true);

-- Create policies for invoices_enhanced
CREATE POLICY "Users can view own invoices" ON invoices_enhanced
FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "Super admins can manage all invoices" ON invoices_enhanced
FOR ALL USING (is_super_admin());

CREATE POLICY "System can create invoices" ON invoices_enhanced
FOR INSERT WITH CHECK (true);
