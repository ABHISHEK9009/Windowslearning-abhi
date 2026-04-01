-- =====================================================
-- SECURITY & ARCHITECTURE FIXES MIGRATION
-- Addresses: RLS gaps, payment escrow, soft deletes, search, availability
-- =====================================================

-- =====================================================
-- 1. ADD MISSING RLS POLICIES (CRITICAL SECURITY FIX)
-- =====================================================

-- Requirements: Learners manage own, public can view open ones
CREATE POLICY "Requirements: Learners manage own"
  ON requirements FOR ALL
  USING (learner_id IN (
    SELECT id FROM learner_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Requirements: Public can view open"
  ON requirements FOR SELECT
  USING (status = 'OPEN' AND visibility = 'PUBLIC');

CREATE POLICY "Requirements: Mentors can view for proposals"
  ON requirements FOR SELECT
  USING (status = 'OPEN');

-- Proposals: Mentors manage own, learners can view on their requirements
CREATE POLICY "Proposals: Mentors manage own"
  ON proposals FOR ALL
  USING (mentor_id IN (
    SELECT id FROM mentor_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Proposals: Learners can view on their requirements"
  ON proposals FOR SELECT
  USING (
    requirement_id IN (
      SELECT id FROM requirements 
      WHERE learner_id IN (SELECT id FROM learner_profiles WHERE id = auth.uid())
    )
  );

-- Reviews: Participants can create, public can view
CREATE POLICY "Reviews: Session participants can create"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    session_id IN (
      SELECT id FROM sessions 
      WHERE learner_id = auth.uid() OR mentor_id = auth.uid()
    )
  );

CREATE POLICY "Reviews: Public can view"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Reviews: Reviewers can update own"
  ON reviews FOR UPDATE
  USING (reviewer_id = auth.uid());

-- Conversations: Participants only
CREATE POLICY "Conversations: Participants only"
  ON conversations FOR ALL
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Session materials: Session participants
CREATE POLICY "Session materials: Session participants"
  ON session_materials FOR ALL
  USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE learner_id = auth.uid() OR mentor_id = auth.uid()
    )
  );

-- Wallet transactions: Owner only
CREATE POLICY "Wallet transactions: Owner only"
  ON wallet_transactions FOR SELECT
  USING (wallet_id IN (
    SELECT id FROM wallets WHERE user_id = auth.uid()
  ));

-- Payment methods: Owner only
CREATE POLICY "Payment methods: Owner only"
  ON payment_methods FOR ALL
  USING (user_id = auth.uid());

-- Categories: Public read only
CREATE POLICY "Categories: Public read"
  ON categories FOR SELECT USING (true);

-- Skills: Public read only
CREATE POLICY "Skills: Public read"
  ON skills FOR SELECT USING (true);

-- Mentor skills: Public read, mentor can manage own
CREATE POLICY "Mentor skills: Public read"
  ON mentor_skills FOR SELECT USING (true);

CREATE POLICY "Mentor skills: Mentors manage own"
  ON mentor_skills FOR ALL
  USING (mentor_id IN (
    SELECT id FROM mentor_profiles WHERE id = auth.uid()
  ));

-- Activity logs: Users view own, admins view all
CREATE POLICY "Activity logs: Users view own"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- Platform settings: Public read
CREATE POLICY "Platform settings: Public read"
  ON platform_settings FOR SELECT USING (true);

-- User presence: Participants can view
CREATE POLICY "User presence: Participants can view"
  ON user_presence FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM conversations 
    WHERE (participant_1 = auth.uid() AND participant_2 = user_presence.user_id)
       OR (participant_2 = auth.uid() AND participant_1 = user_presence.user_id)
  ));

CREATE POLICY "User presence: Users update own"
  ON user_presence FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- 2. ADD INSERT POLICIES FOR KEY TABLES
-- =====================================================

-- Profiles: Users can insert own profile
CREATE POLICY "Profiles: Users can insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Mentor profiles: Users can insert own
CREATE POLICY "Mentor profiles: Users can insert own"
  ON mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Learner profiles: Users can insert own
CREATE POLICY "Learner profiles: Users can insert own"
  ON learner_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sessions: Participants can create
CREATE POLICY "Sessions: Learners can create"
  ON sessions FOR INSERT
  WITH CHECK (
    learner_id IN (SELECT id FROM learner_profiles WHERE id = auth.uid())
  );

-- Wallets: Auto-created by trigger, but allow admin insert
CREATE POLICY "Wallets: Admin can insert"
  ON wallets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Wallet transactions: System managed, but log access
CREATE POLICY "Wallet transactions: System can insert"
  ON wallet_transactions FOR INSERT
  WITH CHECK (true);

-- Messages: Participants can send
CREATE POLICY "Messages: Conversation participants can send"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Conversations: System creates via function
CREATE POLICY "Conversations: System can insert"
  ON conversations FOR INSERT
  WITH CHECK (true);

-- Requirements: Learners can create
CREATE POLICY "Requirements: Learners can insert"
  ON requirements FOR INSERT
  WITH CHECK (
    learner_id IN (SELECT id FROM learner_profiles WHERE id = auth.uid())
  );

-- Proposals: Mentors can create
CREATE POLICY "Proposals: Mentors can insert"
  ON proposals FOR INSERT
  WITH CHECK (
    mentor_id IN (SELECT id FROM mentor_profiles WHERE id = auth.uid())
  );

-- Reviews: Participants can create
CREATE POLICY "Reviews: Participants can insert"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    session_id IN (
      SELECT id FROM sessions 
      WHERE learner_id = auth.uid() OR mentor_id = auth.uid()
    )
  );

-- Notifications: System creates
CREATE POLICY "Notifications: System can insert"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 3. ADD SOFT DELETE COLUMNS (AUDIT & COMPLIANCE)
-- =====================================================

-- Add is_deleted and deleted_at to critical tables
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE requirements ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create function for soft delete
CREATE OR REPLACE FUNCTION soft_delete_record(
  table_name TEXT,
  record_id UUID,
  deleted_by_id UUID
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = $1 WHERE id = $2',
    table_name
  ) USING deleted_by_id, record_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. ADD PAYMENT ESCROW SYSTEM (TRUST LAYER)
-- =====================================================

-- Add payment status to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_status TEXT 
  DEFAULT 'PENDING' 
  CHECK (payment_status IN ('PENDING', 'PAID', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED'));

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- Add transaction reference to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES wallet_transactions(id);

-- Create payment status change log
CREATE TABLE IF NOT EXISTS payment_status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on payment logs
ALTER TABLE payment_status_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment logs: Session participants can view"
  ON payment_status_logs FOR SELECT
  USING (session_id IN (
    SELECT id FROM sessions 
    WHERE learner_id = auth.uid() OR mentor_id = auth.uid()
  ));

-- Function to update payment status with logging
CREATE OR REPLACE FUNCTION update_payment_status(
  p_session_id UUID,
  p_new_status TEXT,
  p_changed_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  -- Get current status
  SELECT payment_status INTO v_old_status
  FROM sessions WHERE id = p_session_id;
  
  -- Update session
  UPDATE sessions SET 
    payment_status = p_new_status,
    paid_at = CASE WHEN p_new_status = 'PAID' THEN NOW() ELSE paid_at END,
    released_at = CASE WHEN p_new_status = 'RELEASED' THEN NOW() ELSE released_at END,
    refunded_at = CASE WHEN p_new_status = 'REFUNDED' THEN NOW() ELSE refunded_at END
  WHERE id = p_session_id;
  
  -- Log the change
  INSERT INTO payment_status_logs (session_id, previous_status, new_status, changed_by, reason)
  VALUES (p_session_id, v_old_status, p_new_status, p_changed_by, p_reason);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FIX RATING SYSTEM (ACCURATE CALCULATIONS)
-- =====================================================

-- Add sum and count columns
ALTER TABLE mentor_profiles ADD COLUMN IF NOT EXISTS rating_sum INTEGER DEFAULT 0;
-- Keep rating_count, it's already there

-- Create function to update rating properly
CREATE OR REPLACE FUNCTION update_mentor_rating_v2()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mentor_profiles
  SET 
    rating_sum = COALESCE((
      SELECT SUM(rating)
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id 
      AND role = 'MENTOR'
      AND is_deleted = FALSE
    ), 0),
    rating_count = COALESCE((
      SELECT COUNT(*) 
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id 
      AND role = 'MENTOR'
      AND is_deleted = FALSE
    ), 0),
    rating_average = CASE 
      WHEN COALESCE((
        SELECT COUNT(*) 
        FROM reviews 
        WHERE reviewee_id = NEW.reviewee_id 
        AND role = 'MENTOR'
        AND is_deleted = FALSE
      ), 0) > 0 
      THEN (
        SELECT SUM(rating)::DECIMAL(10,2) / COUNT(*) 
        FROM reviews 
        WHERE reviewee_id = NEW.reviewee_id 
        AND role = 'MENTOR'
        AND is_deleted = FALSE
      )
      ELSE 0 
    END
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace old trigger with new one
DROP TRIGGER IF EXISTS update_mentor_rating_after_review ON reviews;
CREATE TRIGGER update_mentor_rating_after_review_v2
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_mentor_rating_v2();

-- =====================================================
-- 6. CREATE GET-OR-CREATE CONVERSATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_or_create_conversation(user1 UUID, user2 UUID)
RETURNS UUID AS $$
DECLARE 
  convo_id UUID;
  ordered_user1 UUID;
  ordered_user2 UUID;
BEGIN
  -- Ensure consistent ordering
  ordered_user1 := LEAST(user1, user2);
  ordered_user2 := GREATEST(user1, user2);
  
  -- Try to find existing conversation
  SELECT id INTO convo_id
  FROM conversations
  WHERE participant_1 = ordered_user1 AND participant_2 = ordered_user2
  AND is_deleted = FALSE
  LIMIT 1;

  -- If not found, create new one
  IF convo_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (ordered_user1, ordered_user2)
    RETURNING id INTO convo_id;
  END IF;

  RETURN convo_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. STRUCTURED AVAILABILITY TABLE (SCALABILITY)
-- =====================================================

CREATE TABLE IF NOT EXISTS mentor_availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  specific_date DATE, -- For one-off availability
  is_blocked BOOLEAN DEFAULT FALSE, -- TRUE = unavailable during this slot
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Enable RLS
ALTER TABLE mentor_availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability: Public can view"
  ON mentor_availability_slots FOR SELECT USING (true);

CREATE POLICY "Availability: Mentors manage own"
  ON mentor_availability_slots FOR ALL
  USING (mentor_id IN (
    SELECT id FROM mentor_profiles WHERE id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON mentor_availability_slots 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_availability_mentor_day 
  ON mentor_availability_slots(mentor_id, day_of_week);

-- =====================================================
-- 8. FULL-TEXT SEARCH (DISCOVERY ENGINE)
-- =====================================================

-- Add search vector to mentor profiles
ALTER TABLE mentor_profiles 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_mentor_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.headline, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.expertise, ' '), '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.skills, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER mentor_search_vector_update
  BEFORE INSERT OR UPDATE ON mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_mentor_search_vector();

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS idx_mentor_search_vector 
  ON mentor_profiles USING GIN(search_vector);

-- Add search vector to requirements
ALTER TABLE requirements 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_requirement_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.required_skills, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requirement_search_vector_update
  BEFORE INSERT OR UPDATE ON requirements
  FOR EACH ROW EXECUTE FUNCTION update_requirement_search_vector();

CREATE INDEX IF NOT EXISTS idx_requirement_search_vector 
  ON requirements USING GIN(search_vector);

-- Create search function
CREATE OR REPLACE FUNCTION search_mentors(search_query TEXT)
RETURNS SETOF mentor_profiles AS $$
BEGIN
  RETURN QUERY
  SELECT mp.*
  FROM mentor_profiles mp
  WHERE mp.search_vector @@ plainto_tsquery('simple', search_query)
  AND mp.verification_status = 'VERIFIED'
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = mp.id AND p.is_active = TRUE)
  ORDER BY ts_rank(mp.search_vector, plainto_tsquery('simple', search_query)) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. FEATURE FLAGS TABLE (ROLLOUT CONTROL)
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  enabled_for_roles TEXT[] DEFAULT '{}', -- e.g., ['ADMIN', 'BETA']
  enabled_for_users UUID[] DEFAULT '{}', -- Specific user IDs
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can view, only admins can modify
CREATE POLICY "Feature flags: Public read"
  ON feature_flags FOR SELECT USING (true);

CREATE POLICY "Feature flags: Admin manage"
  ON feature_flags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed some default flags
INSERT INTO feature_flags (key, name, description, enabled, created_by) VALUES
('realtime_chat', 'Real-time Chat', 'Enable WebSocket-based real-time messaging', true, NULL),
('video_calls', 'Video Calls', 'Enable video calling in sessions', false, NULL),
('session_recording', 'Session Recording', 'Allow recording of mentorship sessions', true, NULL),
('advanced_matching', 'Advanced Matching', 'AI-powered mentor-learner matching', false, NULL),
('group_sessions', 'Group Sessions', 'Enable group mentorship sessions', false, NULL),
('payments_escrow', 'Payments Escrow', 'Enable full payment escrow system', true, NULL),
('dark_mode', 'Dark Mode', 'Enable dark mode UI', true, NULL)
ON CONFLICT (key) DO NOTHING;

-- Function to check if feature is enabled for user
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_feature_key TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_flag feature_flags%ROWTYPE;
  v_user_role TEXT;
BEGIN
  SELECT * INTO v_flag FROM feature_flags WHERE key = p_feature_key;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Globally enabled
  IF v_flag.enabled THEN
    RETURN TRUE;
  END IF;
  
  -- Check user-specific enable
  IF p_user_id IS NOT NULL THEN
    -- Check if user is in enabled list
    IF p_user_id = ANY(v_flag.enabled_for_users) THEN
      RETURN TRUE;
    END IF;
    
    -- Check role-based enable
    SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
    IF v_user_role = ANY(v_flag.enabled_for_roles) THEN
      RETURN TRUE;
    END IF;
    
    -- Check percentage rollout (based on user ID hash)
    IF v_flag.rollout_percentage > 0 THEN
      RETURN (abs(hashtextextended(p_user_id::text, 0)) % 100) < v_flag.rollout_percentage;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. RATE LIMITING TABLE (ANTI-SPAM)
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'PROPOSAL', 'MESSAGE', 'REQUIREMENT'
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  window_duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action 
  ON rate_limit_tracking(user_id, action_type, window_start);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count actions in window
  SELECT COALESCE(SUM(action_count), 0) INTO v_count
  FROM rate_limit_tracking
  WHERE user_id = p_user_id
  AND action_type = p_action_type
  AND window_start >= v_window_start;
  
  -- Increment counter
  INSERT INTO rate_limit_tracking (user_id, action_type, action_count, window_duration_minutes)
  VALUES (p_user_id, p_action_type, 1, p_window_minutes);
  
  -- Return true if under limit
  RETURN v_count < p_max_requests;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FINAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Soft delete indexes
CREATE INDEX IF NOT EXISTS idx_sessions_is_deleted ON sessions(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_requirements_is_deleted ON requirements(is_deleted) WHERE is_deleted = FALSE;

-- Payment status index
CREATE INDEX IF NOT EXISTS idx_sessions_payment_status ON sessions(payment_status);

-- Notification priority index
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(user_id, priority, created_at);

-- Activity log cleanup index
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- ENABLE REALTIME FOR NEW TABLES
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE mentor_availability_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_status_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE feature_flags;

-- =====================================================
-- VERIFICATION QUERIES (RUN AFTER MIGRATION)
-- =====================================================

-- Check all tables have RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'mentor_profiles', 'learner_profiles', 'requirements', 'proposals', 'sessions', 'messages', 'conversations', 'reviews', 'wallets', 'notifications');

-- Count policies per table
SELECT tablename, count(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename;
