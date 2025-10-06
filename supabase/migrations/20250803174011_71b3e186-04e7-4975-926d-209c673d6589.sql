-- Remove duplicate email subscriptions, keeping the oldest one
DELETE FROM public.subscriptions
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM public.subscriptions
  ORDER BY email, subscribed_at ASC
);

-- Now add the unique constraint
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_email_key UNIQUE (email);

-- Create newsletters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletters
CREATE POLICY "Super admins can manage newsletters" 
ON public.newsletters 
FOR ALL 
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Auto-subscribe all existing users to newsletter
INSERT INTO public.subscriptions (email, is_active, subscribed_at)
SELECT p.email, true, now()
FROM public.profiles p
WHERE p.email NOT IN (SELECT email FROM public.subscriptions)
ON CONFLICT (email) DO NOTHING;

-- Create trigger to auto-subscribe new users
CREATE OR REPLACE FUNCTION auto_subscribe_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (email, is_active, subscribed_at)
  VALUES (NEW.email, true, now())
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_subscribe_trigger ON public.profiles;

-- Create trigger
CREATE TRIGGER auto_subscribe_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_subscribe_new_user();