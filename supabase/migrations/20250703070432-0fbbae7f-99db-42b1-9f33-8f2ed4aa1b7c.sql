
-- Create enrollments_v2 table for course enrollment details
CREATE TABLE IF NOT EXISTS public.enrollments_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT,
  batch TEXT,
  enrollment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments_v2 table for SSLCommerz payments
CREATE TABLE IF NOT EXISTS public.payments_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments_v2(id),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  payment_method payment_method DEFAULT 'sslcommerz',
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  val_id TEXT, -- SSLCommerz validation ID
  gateway_response JSONB, -- Store full SSLCommerz response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  payment_id UUID REFERENCES payments_v2(id),
  enrollment_id UUID REFERENCES enrollments_v2(id),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID NOT NULL,
  status invoice_status DEFAULT 'pending',
  access_code TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for enrollments_v2
ALTER TABLE public.enrollments_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own enrollments" ON enrollments_v2
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own enrollments" ON enrollments_v2
FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "Super admins can manage all enrollments" ON enrollments_v2
FOR ALL USING (is_super_admin());

-- Create RLS policies for payments_v2
ALTER TABLE public.payments_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own payments" ON payments_v2
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own payments" ON payments_v2
FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "Super admins can manage all payments" ON payments_v2
FOR ALL USING (is_super_admin());

-- Create RLS policies for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON invoices
FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "System can create invoices" ON invoices
FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admins can manage all invoices" ON invoices
FOR ALL USING (is_super_admin());
