-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active FAQs
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
USING (is_active = true OR is_current_user_super_admin_enhanced());

-- Super admins can manage FAQs
CREATE POLICY "Super admins can manage FAQs"
ON public.faqs
FOR ALL
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Create index for better performance
CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_faqs_display_order ON public.faqs(display_order);

-- Add trigger for updated_at
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();