-- Waitlist table for landing page signups
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  corridor text,
  problem text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can sign up
CREATE POLICY "Public can insert into waitlist" ON waitlist
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only service role can read
CREATE POLICY "Service role reads waitlist" ON waitlist
  FOR SELECT TO service_role USING (true);
