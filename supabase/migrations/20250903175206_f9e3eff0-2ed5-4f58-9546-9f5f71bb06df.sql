-- Insert default payment settings if they don't exist
INSERT INTO site_settings (key, value, description) VALUES
('sslcommerz_enabled', 'true', 'Enable SSLCommerz online payments'),
('bkash_manual_enabled', 'true', 'Enable bKash manual payments'),  
('bkash_merchant_number', '01309878503', 'bKash merchant number for manual payments')
ON CONFLICT (key) DO NOTHING;