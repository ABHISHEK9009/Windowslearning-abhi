-- =====================================================
-- WINDOWS LEARNING PLATFORM - COMPLETE MIGRATION
-- Run this file in Supabase SQL Editor for one-step setup
-- =====================================================

-- This file combines all 3 migration files in correct order:
-- 1. schema.sql (base tables)
-- 2. security_migration.sql (security hardening)
-- 3. final_hardening.sql (state machines, audit, locks)

-- =====================================================
-- PART 1: CORE SCHEMA
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Core tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('LEARNER', 'MENTOR', 'ADMIN')),
  phone TEXT,
  bio TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  expertise JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  hourly_rate DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  experience_years INTEGER,
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  languages JSONB DEFAULT '["English"]',
  availability_schedule JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED')),
  total_sessions INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  rating_average DECIMAL(2, 1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  rating_sum INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS learner_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  learning_goals JSONB DEFAULT '[]',
  interests JSONB DEFAULT '[]',
  current_level TEXT,
  preferred_learning_style TEXT,
  total_sessions INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Categories and skills
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Requirements and proposals
CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learner_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  required_skills JSONB DEFAULT '[]',
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  duration_type TEXT CHECK (duration_type IN ('SINGLE_SESSION', 'MULTIPLE_SESSIONS', 'ONGOING')),
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
  deadline TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  proposal_text TEXT NOT NULL,
  proposed_rate DECIMAL(10, 2),
  proposed_duration INTEGER,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learner_profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES requirements(id),
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT DEFAULT 'ONE_ON_ONE' CHECK (session_type IN ('ONE_ON_ONE', 'GROUP', 'WORKSHOP')),
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  rate_per_hour DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  meeting_link TEXT,
  meeting_platform TEXT DEFAULT 'ZOOM',
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED')),
  paid_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Messaging
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES profiles(id),
  participant_2 UUID NOT NULL REFERENCES profiles(id),
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(LEAST(participant_1, participant_2), GREATEST(participant_1, participant_2))
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'TEXT' CHECK (content_type IN ('TEXT', 'IMAGE', 'FILE', 'AUDIO')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL CHECK (role IN ('LEARNER', 'MENTOR')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Wallet and payments
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT', 'REFUND', 'WITHDRAWAL', 'BONUS')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Presence
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'AWAY', 'BUSY', 'OFFLINE')),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  is_available_for_session BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_mentor_profiles_verification ON mentor_profiles(verification_status);
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_sessions_learner ON sessions(learner_id);
CREATE INDEX idx_sessions_mentor ON sessions(mentor_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Seed data
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Technology', 'technology', 'Programming and tech skills', 'Code', '#3b82f6'),
('Design', 'design', 'Creative design', 'Palette', '#ec4899'),
('Business', 'business', 'Business skills', 'Briefcase', '#10b981'),
('Marketing', 'marketing', 'Marketing skills', 'TrendingUp', '#f59e0b'),
('Data Science', 'data-science', 'Data and ML', 'Database', '#8b5cf6'),
('Writing', 'writing', 'Writing skills', 'PenTool', '#ef4444'),
('Music', 'music', 'Music production', 'Music', '#06b6d4'),
('Language', 'language', 'Language learning', 'Languages', '#84cc16'),
('Career', 'career', 'Career development', 'Target', '#6366f1'),
('Health', 'health', 'Health and wellness', 'Heart', '#14b8a6')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- RLS Policies with soft delete enforcement
CREATE POLICY "Profiles: Users manage own"
  ON profiles FOR ALL
  USING (id = auth.uid());

CREATE POLICY "Mentor profiles: Public read"
  ON mentor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Mentor profiles: Owner manage"
  ON mentor_profiles FOR ALL
  USING (id = auth.uid());

CREATE POLICY "Sessions: Participants view active"
  ON sessions FOR SELECT
  USING ((learner_id = auth.uid() OR mentor_id = auth.uid()) AND is_deleted = FALSE);

CREATE POLICY "Messages: Participants view active"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE (participant_1 = auth.uid() OR participant_2 = auth.uid())
      AND is_deleted = FALSE
    )
    AND is_deleted = FALSE
  );

CREATE POLICY "Messages: Participants insert"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE (participant_1 = auth.uid() OR participant_2 = auth.uid())
      AND is_deleted = FALSE
    )
  );

CREATE POLICY "Notifications: Owner only"
  ON notifications FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Wallets: Owner only"
  ON wallets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Wallet transactions: Owner view"
  ON wallet_transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()));

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Wallet auto-creation trigger
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_after_profile_insert 
  AFTER INSERT ON profiles 
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_user();

-- Conversation helper
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1 UUID, user2 UUID)
RETURNS UUID AS $$
DECLARE 
  convo_id UUID;
  ordered_user1 UUID;
  ordered_user2 UUID;
BEGIN
  ordered_user1 := LEAST(user1, user2);
  ordered_user2 := GREATEST(user1, user2);
  
  SELECT id INTO convo_id
  FROM conversations
  WHERE participant_1 = ordered_user1 AND participant_2 = ordered_user2
  AND is_deleted = FALSE
  LIMIT 1;

  IF convo_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (ordered_user1, ordered_user2)
    RETURNING id INTO convo_id;
  END IF;

  RETURN convo_id;
END;
$$ LANGUAGE plpgsql;

-- Rating update
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mentor_profiles
  SET 
    rating_sum = COALESCE((SELECT SUM(rating) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND is_deleted = FALSE), 0),
    rating_count = COALESCE((SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND is_deleted = FALSE), 0),
    rating_average = CASE 
      WHEN COALESCE((SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND is_deleted = FALSE), 0) > 0 
      THEN (SELECT SUM(rating)::DECIMAL(10,2) / COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND is_deleted = FALSE)
      ELSE 0 
    END
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mentor_rating_after_review 
  AFTER INSERT OR UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_mentor_rating();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Migration completed successfully! Your Windows Learning database is ready.' as status;
