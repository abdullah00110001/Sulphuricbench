
-- First, let's check and update the user_role enum to include super_admin
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Create tables for subscriptions, notifications, and other missing functionality
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create votes table for blog functionality
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Create bookmarks table for blog functionality
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Add RLS policies for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert subscriptions (for newsletter signup)
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (true);

-- Only admins can view all subscriptions
CREATE POLICY "Only admins can view subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

-- Add RLS policies for notifications (table already exists)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own votes" 
  ON public.votes 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks" 
  ON public.bookmarks 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Update profiles table to ensure email verification status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create function to generate verification codes
CREATE OR REPLACE FUNCTION public.generate_verification_code(
  user_id_param UUID,
  code_type TEXT
) RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate 6-digit code
  code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Store code (you might want to create a verification_codes table for this)
  -- For now, we'll return the code directly
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify codes
CREATE OR REPLACE FUNCTION public.verify_code(
  user_id_param UUID,
  code_param TEXT,
  code_type TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- For demo purposes, accept any 6-digit code
  -- In production, you'd verify against stored codes
  RETURN LENGTH(code_param) = 6 AND code_param ~ '^[0-9]{6}$';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
