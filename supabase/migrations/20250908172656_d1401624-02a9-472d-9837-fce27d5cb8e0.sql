-- Create reviews table without fake foreign keys
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  user_name text NOT NULL,
  user_role text,
  user_company text,
  user_avatar text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
FOR SELECT USING (is_approved = true OR auth.uid()::text = user_id::text OR is_current_user_super_admin_enhanced());

CREATE POLICY "Users can create reviews" ON public.reviews  
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can update own reviews" ON public.reviews
FOR UPDATE USING (auth.uid()::text = user_id::text OR is_current_user_super_admin_enhanced());

CREATE POLICY "Super admins can manage all reviews" ON public.reviews
FOR ALL USING (is_current_user_super_admin_enhanced());

-- Insert sample reviews without foreign key constraints
INSERT INTO public.reviews (user_id, rating, review_text, user_name, user_role, user_company, is_approved)
VALUES 
  (NULL, 5, 'Excellent courses! I learned so much and was able to apply the knowledge immediately in my work.', 'Ahmed Hassan', 'Software Developer', 'TechCorp', true),
  (NULL, 5, 'The instructors are very knowledgeable and the content is up-to-date with industry standards.', 'Fatima Khan', 'UI/UX Designer', 'Creative Solutions', true)
ON CONFLICT DO NOTHING;