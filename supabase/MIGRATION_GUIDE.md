# Supabase Migration Guide

## 🚀 Getting Started

This guide will walk you through setting up your Windows Learning platform database in Supabase.

---

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Project Created**: Create a new project in Supabase dashboard
3. **Environment Variables**: Note your Supabase URL and Anon Key

---

## 🔐 Environment Setup

Add these to your frontend `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

And to your backend `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Keep secret!
```

---

## 📦 Migration Files

We have 3 SQL migration files that must be run **in order**:

1. **`schema.sql`** - Core database schema (tables, indexes, basic RLS)
2. **`security_migration.sql`** - Security hardening (40+ RLS policies, soft deletes, escrow)
3. **`final_hardening.sql`** - State machines, audit logs, rate limiting, conflict prevention

---

## 🏃 Execution Steps

### Step 1: Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run Schema (File 1)

1. Open `supabase/schema.sql` from this repository
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **"Run"** (or Ctrl+Enter)
5. Wait for completion (you'll see green checkmarks)

**Expected time**: ~2 minutes  
**Creates**: 15 tables, 40+ indexes, seed data, basic RLS

### Step 3: Run Security Migration (File 2)

1. Open `supabase/security_migration.sql`
2. Copy the entire contents
3. Paste into a **new query** in SQL Editor
4. Click **"Run"**
5. Wait for completion

**Expected time**: ~1 minute  
**Creates**: 40+ RLS policies, payment escrow, soft delete columns, full-text search

### Step 4: Run Final Hardening (File 3)

1. Open `supabase/final_hardening.sql`
2. Copy the entire contents
3. Paste into a **new query** in SQL Editor
4. Click **"Run"**
5. Wait for completion

**Expected time**: ~1 minute  
**Creates**: State machines, booking locks, audit logs, rate limiting v2

---

## ✅ Verification Steps

After running all migrations, execute these verification queries in SQL Editor:

### Check Tables Created
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected**: 15+ tables including `profiles`, `mentor_profiles`, `sessions`, `messages`, etc.

### Check RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Expected**: All user tables show `true` for rowsecurity

### Check Policies Count
```sql
SELECT tablename, count(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;
```

**Expected**: 
- `sessions`: 4+ policies
- `messages`: 3+ policies  
- `requirements`: 4+ policies
- `proposals`: 3+ policies

### Check Realtime Enabled
```sql
SELECT pubname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Expected**: 10+ tables including `messages`, `sessions`, `notifications`

### Check Seed Data
```sql
SELECT * FROM categories;
```

**Expected**: 10 rows (Technology, Design, Business, Marketing, etc.)

```sql
SELECT * FROM skills LIMIT 5;
```

**Expected**: 5+ rows (JavaScript, React, Python, etc.)

---

## 🔧 Post-Migration Setup

### Enable Extensions (if not auto-enabled)

In SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Configure Authentication

1. Go to **Authentication → Settings** in Supabase dashboard
2. Enable Email provider
3. Configure SMTP (optional, for production)
4. Set Site URL to your frontend URL (e.g., `http://localhost:3000`)
5. Add Redirect URLs:
   - `http://localhost:3000/**`
   - `https://your-production-domain.com/**`

### Configure Storage (for file uploads)

1. Go to **Storage** in Supabase dashboard
2. Create buckets:
   - `avatars` - Profile pictures
   - `session-materials` - Session files
   - `verification-docs` - Mentor verification documents
3. Set public access policy for `avatars` bucket

---

## 🧪 Testing the Database

### Create Test Users

Use the Supabase Auth UI or API to create test users, then run:

```sql
-- Make first user an admin (run after user registers)
UPDATE profiles 
SET role = 'ADMIN' 
WHERE email = 'your-admin-email@example.com';
```

### Test Key Features

1. **Sign up a learner** → Should auto-create wallet
2. **Sign up a mentor** → Should create mentor_profile pending verification
3. **Create requirement** → Should work with RLS
4. **Send message** → Should trigger realtime
5. **Create session** → Should lock availability slot

---

## 🚨 Troubleshooting

### Issue: "Permission denied" errors

**Fix**: Check RLS policies are applied:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Issue: Realtime not working

**Fix**: Verify table is in realtime publication:
```sql
SELECT * FROM pg_publication_tables WHERE tablename = 'messages';
```

If missing:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Issue: Search not working

**Fix**: Check pg_trgm extension:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
```

### Issue: Duplicate key errors on conversation creation

**Fix**: Use the get_or_create_conversation function:
```sql
SELECT get_or_create_conversation('user1-uuid', 'user2-uuid');
```

---

## 📚 Next Steps

After migration is complete:

1. **Connect Frontend** - Your frontend will automatically connect using env vars
2. **Test Authentication** - Sign up, sign in, reset password
3. **Create Test Data** - Mentors, learners, sessions
4. **Enable Realtime** - Test live messaging
5. **Deploy Backend** - If using separate backend, deploy and test API

---

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgREST Documentation](https://postgrest.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## ⚡ Quick Commands

```bash
# Test connection from frontend
cd frontend
npm run dev
# Then sign up a test user in the UI

# Check Supabase logs
# Go to: Database → Logs (in Supabase dashboard)
```

---

**Migration complete! Your Windows Learning platform database is ready.** 🎉
