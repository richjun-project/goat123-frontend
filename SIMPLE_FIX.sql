-- Supabase SQL Editor에서 실행하세요
-- https://supabase.com/dashboard/project/aktukgzzplggrivtnytt/sql/new

-- 1. poll_comments 테이블에 UPDATE 권한 부여
DROP POLICY IF EXISTS "Users can update their own comments" ON poll_comments;

CREATE POLICY "Users can update their own comments" 
ON poll_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. 북마크 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS poll_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, poll_id)
);

-- 3. 북마크 테이블 RLS 활성화
ALTER TABLE poll_bookmarks ENABLE ROW LEVEL SECURITY;

-- 4. 북마크 테이블 정책
CREATE POLICY IF NOT EXISTS "Users can view their own bookmarks" 
ON poll_bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own bookmarks" 
ON poll_bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own bookmarks" 
ON poll_bookmarks FOR DELETE 
USING (auth.uid() = user_id);