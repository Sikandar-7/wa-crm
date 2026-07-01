-- ============================================================
-- SUBSCRIPTION REQUESTS & PLAN ENHANCEMENTS
-- ============================================================

-- Add expires_at to subscriptions if not present
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'manual';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update plans table with PKR price
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_pkr NUMERIC(10,2) DEFAULT 0;

-- Subscription Requests table (users request a plan, admin approves)
CREATE TABLE IF NOT EXISTS subscription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own requests" ON subscription_requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON subscription_requests;

CREATE POLICY "Users can manage own requests" ON subscription_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" ON subscription_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS set_updated_at ON subscription_requests;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscription_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update Free Trial plan with PKR price
UPDATE plans SET price_pkr = 0 WHERE name = 'Free Trial';

-- Insert starter and pro plans if they don't exist
INSERT INTO plans (name, description, price, price_pkr, limits)
VALUES (
  'Starter',
  'For small businesses getting started',
  25.00,
  2500,
  '{"max_contacts": 500, "max_messages": 5000}'::jsonb
) ON CONFLICT DO NOTHING;

INSERT INTO plans (name, description, price, price_pkr, limits)
VALUES (
  'Professional',
  'For growing businesses with advanced needs',
  40.00,
  4000,
  '{"max_contacts": 5000, "max_messages": 50000}'::jsonb
) ON CONFLICT DO NOTHING;
