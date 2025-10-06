-- Create legal_content table for managing terms, privacy policy, etc.
CREATE TABLE IF NOT EXISTS public.legal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('terms', 'privacy', 'about')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(type, is_active) -- Only one active version per type
);

-- Enable RLS
ALTER TABLE public.legal_content ENABLE ROW LEVEL SECURITY;

-- Create policies for legal_content
CREATE POLICY "Anyone can view active legal content" 
ON public.legal_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage legal content" 
ON public.legal_content 
FOR ALL 
USING (is_current_user_super_admin_enhanced())
WITH CHECK (is_current_user_super_admin_enhanced());

-- Create trigger for updated_at
CREATE TRIGGER update_legal_content_updated_at
BEFORE UPDATE ON public.legal_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default legal content
INSERT INTO public.legal_content (type, title, content, version, is_active) VALUES
('terms', 'Terms of Service', '
<h1>Terms of Service</h1>
<h2>1. Acceptance of Terms</h2>
<p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>2. User Accounts</h2>
<p>To access certain features of the service, you must register for an account. You are responsible for maintaining the confidentiality of your account information.</p>

<h2>3. Course Content</h2>
<p>All course content is protected by copyright and other intellectual property rights. You may not reproduce, distribute, or modify any content without permission.</p>

<h2>4. Payment Terms</h2>
<p>Course fees are payable in advance. Refunds are available within 30 days of purchase if you have completed less than 30% of the course.</p>

<h2>5. Prohibited Uses</h2>
<p>You may not use our service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction.</p>

<h2>6. Limitation of Liability</h2>
<p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
', '1.0', true),

('privacy', 'Privacy Policy', '
<h1>Privacy Policy</h1>
<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us for support.</p>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>

<h2>3. Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>5. Cookies</h2>
<p>We use cookies to enhance your experience on our website. You can choose to disable cookies in your browser settings.</p>

<h2>6. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at privacy@example.com</p>
', '1.0', true),

('about', 'About Us', '
<h1>About Sulphuric Bench</h1>
<p>Sulphuric Bench is a cutting-edge online learning platform dedicated to providing high-quality educational content to students and professionals worldwide.</p>

<h2>Our Mission</h2>
<p>To democratize education by making quality learning accessible to everyone, anywhere, at any time.</p>

<h2>What We Offer</h2>
<ul>
  <li>Expert-led courses in various subjects</li>
  <li>Interactive learning experiences</li>
  <li>Certificates of completion</li>
  <li>Community-driven learning</li>
  <li>24/7 support</li>
</ul>

<h2>Our Team</h2>
<p>We are a team of passionate educators, technologists, and designers working together to create the best learning experience possible.</p>

<h2>Contact Information</h2>
<p>Email: info@example.com<br>
Phone: +1 (555) 123-4567<br>
Address: 123 Learning Street, Education City, EC 12345</p>
', '1.0', true);