
-- Create coupons table to store coupon data in database
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_percentage INTEGER DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER NOT NULL DEFAULT 1,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_courses TEXT[] DEFAULT ARRAY[]::TEXT[],
  minimum_amount NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create coupon_usage table to track which students used which coupons
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  discount_applied NUMERIC NOT NULL,
  UNIQUE(coupon_id, user_id, course_id)
);

-- Enable RLS on both tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons table
-- Super admins can manage all coupons
CREATE POLICY "Super admins have full access to coupons" ON public.coupons
  FOR ALL USING (is_current_user_super_admin_enhanced());

-- Students can view active coupons
CREATE POLICY "Students can view active coupons" ON public.coupons
  FOR SELECT USING (
    is_active = true AND 
    valid_from <= now() AND 
    valid_until >= now()
  );

-- RLS policies for coupon_usage table
-- Super admins can view all usage
CREATE POLICY "Super admins can view all coupon usage" ON public.coupon_usage
  FOR SELECT USING (is_current_user_super_admin_enhanced());

-- Users can view their own coupon usage
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

-- System can create coupon usage records
CREATE POLICY "System can create coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active_dates ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX idx_coupon_usage_user ON public.coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);

-- Create updated_at trigger for coupons
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coupons_updated_at_trigger
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();
