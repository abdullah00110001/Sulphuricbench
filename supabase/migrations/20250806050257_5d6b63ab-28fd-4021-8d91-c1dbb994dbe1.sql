-- Ensure auto-subscribe function is secure and has proper search_path
CREATE OR REPLACE FUNCTION public.auto_subscribe_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.subscriptions (email, is_active, subscribed_at)
  VALUES (NEW.email, true, now())
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-create profile on new auth user (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile'
  ) THEN
    CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Create trigger to auto-subscribe new users to newsletter
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_subscribe'
  ) THEN
    CREATE TRIGGER on_auth_user_created_subscribe
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_subscribe_new_user();
  END IF;
END
$$;

-- RLS: Allow super admins to manage announcements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'announcements' 
      AND policyname = 'Super admins can manage announcements'
  ) THEN
    CREATE POLICY "Super admins can manage announcements"
    ON public.announcements
    FOR ALL
    USING (is_current_user_super_admin_enhanced())
    WITH CHECK (is_current_user_super_admin_enhanced());
  END IF;
END
$$;

-- RLS: Allow super admins to view subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'subscriptions' 
      AND policyname = 'Super admins can view subscriptions'
  ) THEN
    CREATE POLICY "Super admins can view subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (is_current_user_super_admin_enhanced());
  END IF;
END
$$;

-- Backfill profiles for existing auth users if missing (omit non-existent columns)
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, approval_status, created_at, updated_at, email_verified)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url',
  'student'::user_role,
  'approved'::approval_status,
  now(),
  now(),
  true
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Ensure the 3 super admin profiles exist and are marked correctly
SELECT public.ensure_super_admin_profile('abdullahusimin1@gmail.com', 'Abdullah Usimin');
SELECT public.ensure_super_admin_profile('stv7168@gmail.com', 'STV Admin');
SELECT public.ensure_super_admin_profile('abdullahabeer003@gmail.com', 'Abdullah Abeer');

-- Backfill subscriptions for all existing auth users (idempotent)
INSERT INTO public.subscriptions (email, is_active, subscribed_at)
SELECT u.email, true, now()
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (email) DO NOTHING;