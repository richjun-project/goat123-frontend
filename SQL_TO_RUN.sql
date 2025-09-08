-- Supabase SQL Editor에서 이 SQL을 실행하세요
-- https://supabase.com/dashboard/project/aktukgzzplggrivtnytt/sql/new

-- 1. poll_comments 테이블에 deleted_at 컬럼 추가 (소프트 삭제용)
ALTER TABLE poll_comments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. 기존 DELETE 정책 삭제
DROP POLICY IF EXISTS "Users can delete their own comments" ON poll_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON poll_comments;

-- 3. 새로운 DELETE 정책 생성
CREATE POLICY "Users can delete their own comments" 
ON poll_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. UPDATE 정책 추가 (소프트 삭제를 위한)
DROP POLICY IF EXISTS "Users can update their own comments" ON poll_comments;
CREATE POLICY "Users can update their own comments" 
ON poll_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. 북마크 테이블 생성 (아직 없는 경우)
CREATE TABLE IF NOT EXISTS poll_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, poll_id)
);

-- 북마크 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_poll_bookmarks_user_id ON poll_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_bookmarks_poll_id ON poll_bookmarks(poll_id);

-- 북마크 테이블 RLS 활성화
ALTER TABLE poll_bookmarks ENABLE ROW LEVEL SECURITY;

-- 북마크 테이블 RLS 정책
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON poll_bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON poll_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON poll_bookmarks;
CREATE POLICY "Users can create their own bookmarks" ON poll_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON poll_bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON poll_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('poll_comments', 'poll_bookmarks')
ORDER BY tablename, cmd;