-- Ensure all existing users have subscription entries
INSERT INTO public.subscriptions (email, is_active, subscribed_at)
SELECT 
  email, 
  true, 
  created_at
FROM public.profiles 
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;