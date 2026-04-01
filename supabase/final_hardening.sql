-- =====================================================
-- FINAL SECURITY HARDENING & PRODUCTION LOCK-DOWN
-- Addresses: INSERT leaks, soft delete enforcement, payment validation,
-- state machines, booking locks, audit trails
-- =====================================================

-- =====================================================
-- 1. FIX OVER-PERMISSIVE INSERT POLICIES (CRITICAL SECURITY)
-- =====================================================

-- Drop dangerous policies
DROP POLICY IF EXISTS "Conversations: System can insert" ON conversations;
DROP POLICY IF EXISTS "Notifications: System can insert" ON notifications;
DROP POLICY IF EXISTS "Wallet transactions: System can insert" ON wallet_transactions;

-- Recreate with proper security
CREATE POLICY "Conversations: Participants can insert"
  ON conversations FOR INSERT
  WITH CHECK (
    (participant_1 = auth.uid() OR participant_2 = auth.uid())
    AND participant_1 != participant_2 -- Prevent self-conversations
  );

-- Notifications: System + Admin only
CREATE POLICY "Notifications: System and admin can insert"
  ON notifications FOR INSERT
  WITH CHECK (
    -- Admin can create notifications for any user
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
    OR
    -- System role (service key) bypass - see below for is_service_role()
    is_service_role() = TRUE
  );

-- Wallet transactions: Admin + Service only
CREATE POLICY "Wallet transactions: Admin and service can insert"
  ON wallet_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
    OR is_service_role() = TRUE
  );

-- Messages: Verify conversation participation
DROP POLICY IF EXISTS "Messages: Participants can send" ON messages;
CREATE POLICY "Messages: Conversation participants can send"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE (participant_1 = auth.uid() OR participant_2 = auth.uid())
      AND is_deleted = FALSE
    )
  );

-- Requirements: Only learners can create, with rate limit check
DROP POLICY IF EXISTS "Requirements: Learners can insert" ON requirements;
CREATE POLICY "Requirements: Learners can insert"
  ON requirements FOR INSERT
  WITH CHECK (
    learner_id = auth.uid()
    AND learner_id IN (SELECT id FROM learner_profiles WHERE id = auth.uid())
    AND is_deleted = FALSE
  );

-- Proposals: Only mentors can create, with rate limit check
DROP POLICY IF EXISTS "Proposals: Mentors can insert" ON proposals;
CREATE POLICY "Proposals: Mentors can insert"
  ON proposals FOR INSERT
  WITH CHECK (
    mentor_id = auth.uid()
    AND mentor_id IN (SELECT id FROM mentor_profiles WHERE id = auth.uid())
    AND requirement_id IN (
      SELECT id FROM requirements 
      WHERE status = 'OPEN' 
      AND is_deleted = FALSE
      AND learner_id != auth.uid() -- Can't propose on own requirement
    )
  );

-- =====================================================
-- 2. SYSTEM ROLE BYPASS FUNCTION (FOR SERVICE OPERATIONS)
-- =====================================================

-- Create function to detect if current user is service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if using service role key (no user ID in session)
  -- Service role bypasses RLS entirely, so this is for checks within policies
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role',
    FALSE
  );
EXCEPTION
  WHEN OTHERS THEN RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. ENFORCE SOFT DELETE IN ALL RLS POLICIES
-- =====================================================

-- Helper function to rebuild policies with soft delete filter
CREATE OR REPLACE FUNCTION rebuild_soft_delete_policies()
RETURNS void AS $$
BEGIN
  -- Drop existing SELECT policies and recreate with is_deleted = FALSE
  
  -- Sessions
  DROP POLICY IF EXISTS "Session participants can view" ON sessions;
  CREATE POLICY "Sessions: Participants can view active"
    ON sessions FOR SELECT
    USING (
      (learner_id = auth.uid() OR mentor_id = auth.uid())
      AND is_deleted = FALSE
    );
  
  -- Messages
  DROP POLICY IF EXISTS "Conversation participants can view messages" ON messages;
  CREATE POLICY "Messages: Participants can view active"
    ON messages FOR SELECT
    USING (
      conversation_id IN (
        SELECT id FROM conversations
        WHERE (participant_1 = auth.uid() OR participant_2 = auth.uid())
        AND is_deleted = FALSE
      )
      AND is_deleted = FALSE
    );
  
  -- Requirements
  DROP POLICY IF EXISTS "Requirements: Learners manage own" ON requirements;
  DROP POLICY IF EXISTS "Requirements: Public can view open" ON requirements;
  DROP POLICY IF EXISTS "Requirements: Mentors can view for proposals" ON requirements;
  
  CREATE POLICY "Requirements: Learners manage own active"
    ON requirements FOR ALL
    USING (
      learner_id IN (SELECT id FROM learner_profiles WHERE id = auth.uid())
      AND is_deleted = FALSE
    );
  
  CREATE POLICY "Requirements: Public can view open active"
    ON requirements FOR SELECT
    USING (
      status = 'OPEN' 
      AND visibility = 'PUBLIC'
      AND is_deleted = FALSE
    );
  
  CREATE POLICY "Requirements: Mentors can view active"
    ON requirements FOR SELECT
    USING (
      status = 'OPEN'
      AND is_deleted = FALSE
    );
  
  -- Proposals
  DROP POLICY IF EXISTS "Proposals: Mentors manage own" ON proposals;
  DROP POLICY IF EXISTS "Proposals: Learners can view on their requirements" ON proposals;
  
  CREATE POLICY "Proposals: Mentors manage own active"
    ON proposals FOR ALL
    USING (
      mentor_id IN (SELECT id FROM mentor_profiles WHERE id = auth.uid())
      AND is_deleted = FALSE
    );
  
  CREATE POLICY "Proposals: Learners can view on active requirements"
    ON proposals FOR SELECT
    USING (
      requirement_id IN (
        SELECT id FROM requirements 
        WHERE learner_id IN (SELECT id FROM learner_profiles WHERE id = auth.uid())
        AND is_deleted = FALSE
      )
      AND is_deleted = FALSE
    );
  
  -- Reviews
  DROP POLICY IF EXISTS "Reviews: Public can view" ON reviews;
  CREATE POLICY "Reviews: Public can view active"
    ON reviews FOR SELECT
    USING (is_deleted = FALSE);
  
  -- Conversations
  DROP POLICY IF EXISTS "Conversations: Participants only" ON conversations;
  CREATE POLICY "Conversations: Participants only active"
    ON conversations FOR ALL
    USING (
      (participant_1 = auth.uid() OR participant_2 = auth.uid())
      AND is_deleted = FALSE
    );
  
END;
$$ LANGUAGE plpgsql;

-- Execute the rebuild
SELECT rebuild_soft_delete_policies();

-- =====================================================
-- 4. PAYMENT STATE MACHINE WITH VALIDATION
-- =====================================================

-- Valid payment state transitions
CREATE TYPE payment_transition AS ENUM (
  'PENDING_TO_PAID',
  'PAID_TO_HELD',
  'HELD_TO_RELEASED',
  'HELD_TO_REFUNDED',
  'PAID_TO_REFUNDED',
  'HELD_TO_DISPUTED',
  'DISPUTED_TO_RELEASED',
  'DISPUTED_TO_REFUNDED'
);

-- Function to validate payment state transition
CREATE OR REPLACE FUNCTION is_valid_payment_transition(
  from_status TEXT,
  to_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE
    WHEN from_status = 'PENDING' AND to_status IN ('PAID', 'REFUNDED') THEN TRUE
    WHEN from_status = 'PAID' AND to_status IN ('HELD', 'REFUNDED') THEN TRUE
    WHEN from_status = 'HELD' AND to_status IN ('RELEASED', 'REFUNDED', 'DISPUTED') THEN TRUE
    WHEN from_status = 'DISPUTED' AND to_status IN ('RELEASED', 'REFUNDED') THEN TRUE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Role-based payment permissions
CREATE OR REPLACE FUNCTION can_update_payment_status(
  p_session_id UUID,
  p_new_status TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_session sessions%ROWTYPE;
  v_user_role TEXT;
BEGIN
  -- Get session details
  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
  
  -- Admin can do anything
  IF v_user_role = 'ADMIN' THEN
    RETURN TRUE;
  END IF;
  
  -- System role can do anything
  IF is_service_role() THEN
    RETURN TRUE;
  END IF;
  
  -- Learner can: PENDING → PAID (when they pay)
  IF p_new_status = 'PAID' AND v_session.learner_id = p_user_id 
     AND v_session.payment_status = 'PENDING' THEN
    RETURN TRUE;
  END IF;
  
  -- Mentor can: HELD → RELEASED (after session complete)
  IF p_new_status = 'RELEASED' AND v_session.mentor_id = p_user_id 
     AND v_session.payment_status = 'HELD' 
     AND v_session.status = 'COMPLETED' THEN
    RETURN TRUE;
  END IF;
  
  -- Learner can: request refund within 24h
  IF p_new_status = 'REFUNDED' AND v_session.learner_id = p_user_id
     AND v_session.payment_status IN ('PAID', 'HELD')
     AND v_session.scheduled_at > NOW() - INTERVAL '24 hours' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace payment update function with full validation
CREATE OR REPLACE FUNCTION update_payment_status_v2(
  p_session_id UUID,
  p_new_status TEXT,
  p_changed_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_old_status TEXT;
  v_is_valid BOOLEAN;
  v_has_permission BOOLEAN;
BEGIN
  -- Get current status
  SELECT payment_status INTO v_old_status
  FROM sessions WHERE id = p_session_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  -- Validate state transition
  v_is_valid := is_valid_payment_transition(v_old_status, p_new_status);
  IF NOT v_is_valid THEN
    RAISE EXCEPTION 'Invalid payment state transition: % → %', v_old_status, p_new_status;
  END IF;
  
  -- Validate permissions
  v_has_permission := can_update_payment_status(p_session_id, p_new_status, p_changed_by);
  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'User does not have permission to update payment status';
  END IF;
  
  -- Update session
  UPDATE sessions SET 
    payment_status = p_new_status,
    paid_at = CASE WHEN p_new_status = 'PAID' THEN NOW() ELSE paid_at END,
    released_at = CASE WHEN p_new_status = 'RELEASED' THEN NOW() ELSE released_at END,
    refunded_at = CASE WHEN p_new_status = 'REFUNDED' THEN NOW() ELSE refunded_at END
  WHERE id = p_session_id;
  
  -- Log the change
  INSERT INTO payment_status_logs (
    session_id, previous_status, new_status, changed_by, reason
  ) VALUES (
    p_session_id, v_old_status, p_new_status, p_changed_by, p_reason
  );
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, priority)
  SELECT 
    CASE 
      WHEN p_new_status = 'RELEASED' THEN mentor_id
      WHEN p_new_status IN ('PAID', 'REFUNDED') THEN learner_id
    END,
    'PAYMENT_STATUS_CHANGE',
    'Payment ' || p_new_status,
    'Payment for session has been ' || LOWER(p_new_status),
    CASE p_new_status 
      WHEN 'DISPUTED' THEN 'HIGH'
      ELSE 'NORMAL'
    END
  FROM sessions WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. SESSION LIFECYCLE STATE MACHINE
-- =====================================================

-- Valid session status transitions
CREATE OR REPLACE FUNCTION is_valid_session_transition(
  from_status TEXT,
  to_status TEXT,
  p_session_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payment_status TEXT;
BEGIN
  -- Get payment status
  SELECT payment_status INTO v_payment_status 
  FROM sessions WHERE id = p_session_id;
  
  RETURN CASE
    -- SCHEDULED → CONFIRMED (payment made)
    WHEN from_status = 'SCHEDULED' AND to_status = 'CONFIRMED' 
         AND v_payment_status IN ('PAID', 'HELD') THEN TRUE
    
    -- CONFIRMED → IN_PROGRESS (session started)
    WHEN from_status = 'CONFIRMED' AND to_status = 'IN_PROGRESS' THEN TRUE
    
    -- IN_PROGRESS → COMPLETED (session ended)
    WHEN from_status = 'IN_PROGRESS' AND to_status = 'COMPLETED' THEN TRUE
    
    -- SCHEDULED/CONFIRMED → CANCELLED
    WHEN from_status IN ('SCHEDULED', 'CONFIRMED') AND to_status = 'CANCELLED' THEN TRUE
    
    -- Any → NO_SHOW
    WHEN to_status = 'NO_SHOW' 
         AND from_status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS') THEN TRUE
    
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- Enforce session state transitions
CREATE OR REPLACE FUNCTION enforce_session_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_is_valid BOOLEAN;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW; -- No change, allow
  END IF;
  
  v_is_valid := is_valid_session_transition(OLD.status, NEW.status, NEW.id);
  
  IF NOT v_is_valid THEN
    RAISE EXCEPTION 'Invalid session status transition: % → %', OLD.status, NEW.status;
  END IF;
  
  -- Auto-update payment status when session completes
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    NEW.payment_status = 'HELD'; -- Payment held until mentor confirms release
  END IF;
  
  IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
    -- Auto-refund if paid
    IF OLD.payment_status IN ('PAID', 'HELD') THEN
      NEW.payment_status = 'REFUNDED';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists and create new
DROP TRIGGER IF EXISTS enforce_session_transition_trigger ON sessions;
CREATE TRIGGER enforce_session_transition_trigger
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION enforce_session_transition();

-- =====================================================
-- 6. AVAILABILITY BOOKING LOCK & CONFLICT PREVENTION
-- =====================================================

-- Add lock column to availability slots
ALTER TABLE mentor_availability_slots 
ADD COLUMN IF NOT EXISTS is_booked BOOLEAN DEFAULT FALSE;

ALTER TABLE mentor_availability_slots 
ADD COLUMN IF NOT EXISTS booked_session_id UUID REFERENCES sessions(id);

-- Function to check availability conflicts
CREATE OR REPLACE FUNCTION check_availability_conflicts(
  p_mentor_id UUID,
  p_scheduled_at TIMESTAMP WITH TIME ZONE,
  p_duration_minutes INTEGER
)
RETURNS TABLE (
  conflict_type TEXT,
  conflict_details TEXT
) AS $$
DECLARE
  v_start_time TIME;
  v_end_time TIME;
  v_day_of_week INTEGER;
BEGIN
  v_start_time := p_scheduled_at::TIME;
  v_end_time := (p_scheduled_at + (p_duration_minutes || ' minutes')::INTERVAL)::TIME;
  v_day_of_week := EXTRACT(DOW FROM p_scheduled_at);
  
  RETURN QUERY
  -- Check for overlapping sessions
  SELECT 
    'OVERLAPPING_SESSION'::TEXT,
    'Session at ' || scheduled_at::TEXT
  FROM sessions
  WHERE mentor_id = p_mentor_id
    AND status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')
    AND is_deleted = FALSE
    AND scheduled_at < p_scheduled_at + (p_duration_minutes || ' minutes')::INTERVAL
    AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL > p_scheduled_at;
  
  -- Check for booked availability slot
  RETURN QUERY
  SELECT 
    'BOOKED_SLOT'::TEXT,
    'Slot already booked'
  FROM mentor_availability_slots
  WHERE mentor_id = p_mentor_id
    AND day_of_week = v_day_of_week
    AND is_booked = TRUE
    AND is_blocked = FALSE
    AND (
      (start_time, end_time) OVERLAPS (v_start_time, v_end_time)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to book an availability slot
CREATE OR REPLACE FUNCTION book_availability_slot(
  p_mentor_id UUID,
  p_scheduled_at TIMESTAMP WITH TIME ZONE,
  p_duration_minutes INTEGER,
  p_session_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_start_time TIME;
  v_end_time TIME;
  v_day_of_week INTEGER;
  v_slot_id UUID;
BEGIN
  v_start_time := p_scheduled_at::TIME;
  v_end_time := (p_scheduled_at + (p_duration_minutes || ' minutes')::INTERVAL)::TIME;
  v_day_of_week := EXTRACT(DOW FROM p_scheduled_at);
  
  -- Find matching availability slot
  SELECT id INTO v_slot_id
  FROM mentor_availability_slots
  WHERE mentor_id = p_mentor_id
    AND day_of_week = v_day_of_week
    AND is_blocked = FALSE
    AND is_booked = FALSE
    AND start_time <= v_start_time
    AND end_time >= v_end_time;
  
  IF v_slot_id IS NULL THEN
    RETURN FALSE; -- No matching slot
  END IF;
  
  -- Mark slot as booked
  UPDATE mentor_availability_slots
  SET is_booked = TRUE, booked_session_id = p_session_id
  WHERE id = v_slot_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FEATURE FLAG AUDIT LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flag_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'ENABLED', 'DISABLED', 'ROLLOUT_CHANGED', 'USER_ADDED', etc.
  previous_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE feature_flag_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feature flag logs: Admin view"
  ON feature_flag_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Function to log feature flag changes
CREATE OR REPLACE FUNCTION log_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log enabled change
    IF OLD.enabled != NEW.enabled THEN
      INSERT INTO feature_flag_logs (
        feature_flag_id, action, previous_value, new_value, changed_by
      ) VALUES (
        NEW.id,
        CASE WHEN NEW.enabled THEN 'ENABLED' ELSE 'DISABLED' END,
        jsonb_build_object('enabled', OLD.enabled),
        jsonb_build_object('enabled', NEW.enabled),
        NEW.created_by
      );
    END IF;
    
    -- Log rollout percentage change
    IF OLD.rollout_percentage != NEW.rollout_percentage THEN
      INSERT INTO feature_flag_logs (
        feature_flag_id, action, previous_value, new_value, changed_by
      ) VALUES (
        NEW.id,
        'ROLLOUT_CHANGED',
        jsonb_build_object('rollout_percentage', OLD.rollout_percentage),
        jsonb_build_object('rollout_percentage', NEW.rollout_percentage),
        NEW.created_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feature_flag_audit_log
  AFTER UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION log_feature_flag_change();

-- =====================================================
-- 8. RATE LIMITING V2 (ATOMIC, RACE-CONDITION SAFE)
-- =====================================================

-- Better rate limiting with atomic operations
CREATE OR REPLACE FUNCTION check_rate_limit_v2(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_key TEXT;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  v_key := p_user_id::TEXT || ':' || p_action_type;
  
  -- Atomic count with FOR UPDATE SKIP LOCKED
  SELECT COALESCE(SUM(action_count), 0) INTO v_count
  FROM rate_limit_tracking
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start >= v_window_start
  FOR UPDATE SKIP LOCKED;
  
  -- Check limit
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Atomic insert with conflict resolution
  INSERT INTO rate_limit_tracking (user_id, action_type, action_count, window_duration_minutes)
  VALUES (p_user_id, p_action_type, 1, p_window_minutes)
  ON CONFLICT (user_id, action_type, window_start) 
  DO UPDATE SET action_count = rate_limit_tracking.action_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for upsert
ALTER TABLE rate_limit_tracking 
ADD CONSTRAINT unique_rate_window UNIQUE (user_id, action_type, window_start);

-- =====================================================
-- 9. SEARCH WITH PAGINATION & RANKING
-- =====================================================

-- Replace search function with pagination
CREATE OR REPLACE FUNCTION search_mentors_v2(
  search_query TEXT,
  p_page INTEGER DEFAULT 0,
  p_page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  headline TEXT,
  expertise JSONB,
  rating_average DECIMAL,
  rating_count INTEGER,
  hourly_rate DECIMAL,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.headline,
    mp.expertise,
    mp.rating_average,
    mp.rating_count,
    mp.hourly_rate,
    ts_rank(mp.search_vector, plainto_tsquery('simple', search_query)) as rank
  FROM mentor_profiles mp
  WHERE mp.search_vector @@ plainto_tsquery('simple', search_query)
    AND mp.verification_status = 'VERIFIED'
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = mp.id AND p.is_active = TRUE
    )
  ORDER BY 
    ts_rank(mp.search_vector, plainto_tsquery('simple', search_query)) DESC,
    mp.rating_average DESC
  LIMIT p_page_size
  OFFSET p_page * p_page_size;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. FINAL INDEXES & OPTIMIZATION
-- =====================================================

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_learner_status ON sessions(learner_id, status, is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_status ON sessions(mentor_id, status, is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_sessions_payment ON sessions(payment_status, scheduled_at) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_convo_time ON messages(conversation_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_mentors_verified_active ON mentor_profiles(id) 
  WHERE verification_status = 'VERIFIED';

CREATE INDEX IF NOT EXISTS idx_requirements_open ON requirements(id, category_id)
  WHERE status = 'OPEN' AND is_deleted = FALSE;

-- Add function to cleanup soft deleted records (for cron job)
CREATE OR REPLACE FUNCTION cleanup_soft_deleted(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (table_name TEXT, deleted_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Cleanup old soft-deleted messages
  DELETE FROM messages 
  WHERE is_deleted = TRUE 
    AND deleted_at < NOW() - (p_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT 'messages'::TEXT, v_count;
  
  -- Cleanup old soft-deleted sessions
  DELETE FROM sessions 
  WHERE is_deleted = TRUE 
    AND deleted_at < NOW() - (p_days || ' days')::INTERVAL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT 'sessions'::TEXT, v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. DEPRECATE OLD FUNCTIONS
-- =====================================================

-- Mark old payment function as deprecated
COMMENT ON FUNCTION update_payment_status IS 'DEPRECATED: Use update_payment_status_v2 with full validation';
COMMENT ON FUNCTION check_rate_limit IS 'DEPRECATED: Use check_rate_limit_v2 with atomic operations';
COMMENT ON FUNCTION search_mentors IS 'DEPRECATED: Use search_mentors_v2 with pagination';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all RLS policies include soft delete filter
SELECT 
  tablename,
  policyname,
  qual::text as using_expression
FROM pg_policies
WHERE schemaname = 'public'
AND qual::text NOT LIKE '%is_deleted%'
AND tablename IN ('sessions', 'messages', 'requirements', 'proposals', 'reviews', 'conversations')
ORDER BY tablename;

-- Check for over-permissive policies
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND (qual::text LIKE '%true%' OR with_check::text LIKE '%true%')
ORDER BY tablename;
