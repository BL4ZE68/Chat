-- Init migration for ForeverLink (Tables + RLS)
-- Apply in Supabase SQL editor or with psql connected to your Supabase DB

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (profile) - optional companion to auth.users
-- In Supabase it's recommended to use auth.users for auth and a profiles table for metadata.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  birthdate DATE,
  location_city TEXT,
  location_country TEXT,
  favorite_color TEXT,
  emotional_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships (Espace Duo)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id UUID NOT NULL,
  user_2_id UUID NOT NULL,
  pairing_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'active'
  met_since DATE,
  song_url TEXT,
  custom_theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user1 FOREIGN KEY (user_1_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user2 FOREIGN KEY (user_2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages & Capsules
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT,
  media_url TEXT,
  message_type TEXT DEFAULT 'text', -- 'text', 'audio', 'image', 'capsule'
  is_capsule BOOLEAN DEFAULT FALSE,
  unlock_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_friendship FOREIGN KEY (friendship_id) REFERENCES friendships(id) ON DELETE CASCADE,
  CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Journal d'amitié & Souvenirs (entries partagées)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title TEXT,
  content TEXT,
  location_name TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_journal_friendship FOREIGN KEY (friendship_id) REFERENCES friendships(id) ON DELETE CASCADE,
  CONSTRAINT fk_journal_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships (user_1_id, user_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_friendship ON messages (friendship_id);
CREATE INDEX IF NOT EXISTS idx_journal_friendship ON journal_entries (friendship_id);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Friendships: only members can SELECT/INSERT/UPDATE/DELETE
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendship_select_members_only" ON friendships
  FOR SELECT USING (
    auth.uid() = user_1_id OR auth.uid() = user_2_id
  );

CREATE POLICY "friendship_insert_members_only" ON friendships
  FOR INSERT WITH CHECK (
    auth.uid() = user_1_id OR auth.uid() = user_2_id
  );

CREATE POLICY "friendship_update_members_only" ON friendships
  FOR UPDATE USING (
    auth.uid() = user_1_id OR auth.uid() = user_2_id
  ) WITH CHECK (
    auth.uid() = user_1_id OR auth.uid() = user_2_id
  );

CREATE POLICY "friendship_delete_members_only" ON friendships
  FOR DELETE USING (
    auth.uid() = user_1_id OR auth.uid() = user_2_id
  );

-- Messages: only friendship members can INSERT/SELECT. UPDATE allowed only to sender, DELETE to members.
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_members" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.id = messages.friendship_id
        AND (auth.uid() = f.user_1_id OR auth.uid() = f.user_2_id)
        -- Capsules locked until unlock_at
        AND (messages.is_capsule = FALSE OR messages.unlock_at <= now())
    )
  );

CREATE POLICY "messages_insert_members" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.id = new.friendship_id
        AND (auth.uid() = f.user_1_id OR auth.uid() = f.user_2_id)
    )
  );

CREATE POLICY "messages_update_sender_only" ON messages
  FOR UPDATE USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_delete_members" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.id = messages.friendship_id
        AND (auth.uid() = f.user_1_id OR auth.uid() = f.user_2_id)
    )
  );

-- Journal entries: only friendship members can CRUD
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_select_members" ON journal_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.id = journal_entries.friendship_id
        AND (auth.uid() = f.user_1_id OR auth.uid() = f.user_2_id)
    )
  );

CREATE POLICY "journal_insert_members" ON journal_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.id = new.friendship_id
        AND (auth.uid() = f.user_1_id OR auth.uid() = f.user_2_id)
    )
  );

CREATE POLICY "journal_update_author_only" ON journal_entries
  FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "journal_delete_members" ON journal_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.id = journal_entries.friendship_id
        AND (auth.uid() = f.user_1_id OR auth.uid() = f.user_2_id)
    )
  );

-- Optional: limit SELECT on users table to self or via friendship
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_self_or_friend" ON users
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE (f.user_1_id = users.id AND f.user_2_id = auth.uid())
         OR (f.user_2_id = users.id AND f.user_1_id = auth.uid())
    )
  );

CREATE POLICY "users_update_self" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Notes for Supabase deployer:
-- 1) If you use Supabase Auth (recommended), consider using auth.users + a profiles table instead of creating a separate users table.
-- 2) Run this migration in the SQL editor of Supabase or via psql. Verify auth.uid() works in your tenant.
-- 3) For capsules: unlocking should also be enforced server-side (Edge Function) for extra safety; RLS prevents SELECT before unlock_at, but storage URLs must also be protected.

-- End of migration
