-- =====================================================
-- WINDOWS LEARNING PLATFORM - SUPABASE DATABASE SCHEMA
-- Comprehensive schema for mentorship platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- CORE USER MANAGEMENT
-- =====================================================

-- User profiles extending Supabase auth.users
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

-- Mentor profiles (extends profiles)
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  expertise JSONB DEFAULT '[]', -- Array of expertise areas
  skills JSONB DEFAULT '[]', -- Detailed skills
  hourly_rate DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  experience_years INTEGER,
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  languages JSONB DEFAULT '["English"]',
  availability_schedule JSONB DEFAULT '{}', -- Weekly schedule
  verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED')),
  verification_documents JSONB DEFAULT '[]',
  total_sessions INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  rating_average DECIMAL(2, 1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Learner profiles (extends profiles)
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

-- =====================================================
-- SKILLS & CATEGORIES
-- =====================================================

-- Categories for skills
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Skills database
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Mentor skills mapping
CREATE TABLE IF NOT EXISTS mentor_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level TEXT CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
  years_experience INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(mentor_id, skill_id)
);

-- =====================================================
-- REQUIREMENTS & PROPOSALS
-- =====================================================

-- Learner requirements/posts
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
  preferred_time JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Mentor proposals for requirements
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  proposal_text TEXT NOT NULL,
  proposed_rate DECIMAL(10, 2),
  proposed_duration INTEGER, -- in minutes
  proposed_schedule JSONB DEFAULT '[]',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  learner_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(requirement_id, mentor_id)
);

-- =====================================================
-- SESSIONS & BOOKINGS
-- =====================================================

-- Session bookings
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learner_profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES requirements(id),
  proposal_id UUID REFERENCES proposals(id),
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
  recording_url TEXT,
  learner_notes TEXT,
  mentor_notes TEXT,
  pre_session_questions JSONB DEFAULT '[]',
  post_session_feedback JSONB DEFAULT '{}',
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Session materials/resources
CREATE TABLE IF NOT EXISTS session_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  is_shared BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- MESSAGING & CHAT
-- =====================================================

-- Chat conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES profiles(id),
  participant_2 UUID NOT NULL REFERENCES profiles(id),
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(LEAST(participant_1, participant_2), GREATEST(participant_1, participant_2))
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'TEXT' CHECK (content_type IN ('TEXT', 'IMAGE', 'FILE', 'AUDIO')),
  attachment_url TEXT,
  attachment_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  reply_to UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- REVIEWS & RATINGS
-- =====================================================

-- Session reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL CHECK (role IN ('LEARNER', 'MENTOR')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  tags JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(session_id, reviewer_id)
);

-- =====================================================
-- PAYMENTS & WALLET
-- =====================================================

-- Wallet for users
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT', 'REFUND', 'WITHDRAWAL', 'BONUS')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  reference_type TEXT, -- SESSION, WITHDRAWAL, etc.
  reference_id UUID,
  status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('CARD', 'BANK_ACCOUNT', 'PAYPAL', 'CRYPTO')),
  provider TEXT NOT NULL,
  last_four TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- PLATFORM SETTINGS & ANALYTICS
-- =====================================================

-- Platform configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT, -- SESSION, REQUIREMENT, etc.
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- REALTIME SUPPORT
-- =====================================================

-- Presence tracking (online status)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'AWAY', 'BUSY', 'OFFLINE')),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  is_available_for_session BOOLEAN DEFAULT FALSE,
  current_session_id UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);

-- Mentor profiles indexes
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_verification_status ON mentor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_hourly_rate ON mentor_profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_rating ON mentor_profiles(rating_average);

-- Requirements indexes
CREATE INDEX IF NOT EXISTS idx_requirements_learner_id ON requirements(learner_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_category_id ON requirements(category_id);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_learner_id ON sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_requirements_title_trgm ON requirements USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_headline_trgm ON mentor_profiles USING gin(headline gin_trgm_ops);

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE mentor_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE learner_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
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

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Mentor profiles: Public read, mentor can update own
CREATE POLICY "Mentor profiles are viewable by everyone" 
  ON mentor_profiles FOR SELECT USING (true);

CREATE POLICY "Mentors can update own profile" 
  ON mentor_profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions: Participants can view and update
CREATE POLICY "Session participants can view" 
  ON sessions FOR SELECT USING (auth.uid() = learner_id OR auth.uid() = mentor_id);

CREATE POLICY "Session participants can update" 
  ON sessions FOR UPDATE USING (auth.uid() = learner_id OR auth.uid() = mentor_id);

-- Messages: Conversation participants
CREATE POLICY "Conversation participants can view messages" 
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages" 
  ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Wallets: Owner only
CREATE POLICY "Users can view own wallet" 
  ON wallets FOR SELECT USING (user_id = auth.uid());

-- Notifications: Owner only
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto-update timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_profiles_updated_at BEFORE UPDATE ON mentor_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learner_profiles_updated_at BEFORE UPDATE ON learner_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update mentor rating when review is added
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mentor_profiles
  SET 
    rating_average = (
      SELECT AVG(rating)::DECIMAL(2,1) 
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id AND role = 'MENTOR'
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id AND role = 'MENTOR'
    )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mentor_rating_after_review 
  AFTER INSERT OR UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_mentor_rating();

-- Function to create wallet for new user
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_wallet_after_profile_insert 
  AFTER INSERT ON profiles 
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_user();

-- Function to update conversation last_message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message 
  AFTER INSERT ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('Technology', 'technology', 'Programming, development, and tech skills', 'Code', '#3b82f6', 1),
('Design', 'design', 'UI/UX, graphic design, and creative skills', 'Palette', '#ec4899', 2),
('Business', 'business', 'Entrepreneurship, marketing, and management', 'Briefcase', '#10b981', 3),
('Marketing', 'marketing', 'Digital marketing, SEO, and growth', 'TrendingUp', '#f59e0b', 4),
('Data Science', 'data-science', 'Data analysis, ML, and AI', 'Database', '#8b5cf6', 5),
('Writing', 'writing', 'Content writing, copywriting, and storytelling', 'PenTool', '#ef4444', 6),
('Music', 'music', 'Music production, instruments, and theory', 'Music', '#06b6d4', 7),
('Language', 'language', 'Language learning and communication', 'Languages', '#84cc16', 8),
('Career', 'career', 'Career coaching and professional development', 'Target', '#6366f1', 9),
('Health', 'health', 'Fitness, wellness, and mental health', 'Heart', '#14b8a6', 10);

-- Insert default skills
INSERT INTO skills (name, slug, category_id, description) 
SELECT 'JavaScript', 'javascript', id, 'JavaScript programming language' 
FROM categories WHERE slug = 'technology';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'React', 'react', id, 'React.js frontend framework' 
FROM categories WHERE slug = 'technology';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'Python', 'python', id, 'Python programming language' 
FROM categories WHERE slug = 'technology';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'UI Design', 'ui-design', id, 'User interface design' 
FROM categories WHERE slug = 'design';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'UX Research', 'ux-research', id, 'User experience research' 
FROM categories WHERE slug = 'design';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'Digital Marketing', 'digital-marketing', id, 'Digital marketing strategies' 
FROM categories WHERE slug = 'marketing';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'Data Analysis', 'data-analysis', id, 'Data analysis and visualization' 
FROM categories WHERE slug = 'data-science';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'Public Speaking', 'public-speaking', id, 'Public speaking and presentation' 
FROM categories WHERE slug = 'career';

INSERT INTO skills (name, slug, category_id, description) 
SELECT 'Business Strategy', 'business-strategy', id, 'Strategic business planning' 
FROM categories WHERE slug = 'business';

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description) VALUES
('platform_fee_percentage', '{"value": 15}', 'Platform commission percentage on each session'),
('min_session_duration', '{"value": 30}', 'Minimum session duration in minutes'),
('max_session_duration', '{"value": 180}', 'Maximum session duration in minutes'),
('min_hourly_rate', '{"value": 10}', 'Minimum hourly rate for mentors'),
('max_hourly_rate', '{"value": 500}', 'Maximum hourly rate for mentors'),
('cancellation_policy_hours', '{"value": 24}', 'Hours before session for free cancellation'),
('auto_confirm_sessions', '{"value": true}', 'Automatically confirm scheduled sessions'),
('enable_realtime_chat', '{"value": true}', 'Enable real-time chat functionality'),
('enable_session_recording', '{"value": true}', 'Allow session recording'),
('support_email', '{"value": "support@windowslearning.com"}', 'Platform support email address');
