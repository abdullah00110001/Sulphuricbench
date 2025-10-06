
-- Create invoice_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('valid', 'invalid', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sequence for invoice numbers if not exists
CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'SB' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_sequence')::TEXT, 6, '0');
  RETURN new_number;
END;
$$;

-- Create function to generate access code
CREATE OR REPLACE FUNCTION generate_access_code(batch_param TEXT, user_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  access_code TEXT;
  clean_name TEXT;
BEGIN
  -- Clean the user name (remove spaces, take first part)
  clean_name := UPPER(REGEXP_REPLACE(SPLIT_PART(user_name, ' ', 1), '[^a-zA-Z]', '', 'g'));
  
  -- Generate code: SB<batch>D<date>M<month>Y<year>N<name>
  access_code := 'SB' || COALESCE(batch_param, '') || 
                 'D' || EXTRACT(DAY FROM NOW()) ||
                 'M' || EXTRACT(MONTH FROM NOW()) ||
                 'Y' || EXTRACT(YEAR FROM NOW()) ||
                 'N' || clean_name;
  
  RETURN access_code;
END;
$$;
