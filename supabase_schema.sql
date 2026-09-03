-- =========================================================================
-- CODE MAFIA: SUPABASE DATABASE INITIALIZATION SCHEMA (IDEMPOTENT & SAFE)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/msgjuazmayoimjjaatmh/sql
-- =========================================================================

-- 1. Create Profiles Table (Stores user aliases, avatars, and match stats)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '👨‍💻',
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Game Matches Table (Stores match history & win resolutions)
CREATE TABLE IF NOT EXISTS public.game_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL,
    winner TEXT NOT NULL,          -- 'DEVELOPERS' or 'MAFIA'
    win_reason TEXT,
    challenge_id TEXT,
    player_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '👨‍💻',
    wins INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 5. Set RLS Policies (Drops if exists to avoid 42710 error, then creates)

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Game matches policies
DROP POLICY IF EXISTS "Allow anyone to read game match records." ON public.game_matches;
CREATE POLICY "Allow anyone to read game match records." 
ON public.game_matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone or server to insert game matches." ON public.game_matches;
CREATE POLICY "Allow anyone or server to insert game matches." 
ON public.game_matches FOR INSERT WITH CHECK (true);

-- Leaderboard policies
DROP POLICY IF EXISTS "Allow anyone to read leaderboard." ON public.leaderboard;
CREATE POLICY "Allow anyone to read leaderboard." 
ON public.leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone or server to insert/update leaderboard." ON public.leaderboard;
CREATE POLICY "Allow anyone or server to insert/update leaderboard." 
ON public.leaderboard FOR ALL USING (true);

-- 6. Trigger: Automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar', '👨‍💻')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    avatar = EXCLUDED.avatar,
    updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Confirmation message
SELECT 'Code Mafia Supabase Schema successfully initialized!' AS status;
