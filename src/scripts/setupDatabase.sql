-- Supabase SQL Editor에서 실행해야 하는 데이터베이스 설정 스크립트

-- 1. 댓글 삭제 정책 수정
DROP POLICY IF EXISTS "Users can delete their own comments" ON poll_comments;
CREATE POLICY "Users can delete their own comments" 
ON poll_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. 댓글 soft delete 트리거 제거 (실제 삭제 허용)
DROP TRIGGER IF EXISTS handle_comment_deletion ON poll_comments;
DROP FUNCTION IF EXISTS prevent_comment_deletion();

-- 3. 투표 만료 체크 함수
CREATE OR REPLACE FUNCTION check_poll_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- 만료된 투표 자동으로 상태 변경
  IF NEW.ends_at IS NOT NULL AND NEW.ends_at < NOW() AND NEW.status = 'active' THEN
    NEW.status = 'ended';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 투표 만료 트리거
DROP TRIGGER IF EXISTS check_poll_expiry ON polls;
CREATE TRIGGER check_poll_expiry
BEFORE INSERT OR UPDATE ON polls
FOR EACH ROW
EXECUTE FUNCTION check_poll_expiration();

-- 5. 사용자 프로필 RLS 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" 
ON users FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 6. 알림 테이블 인덱스 (성능 개선)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 7. 투표 테이블 인덱스 (성능 개선)
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_total_votes ON polls(total_votes DESC);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_option ON poll_votes(poll_id, option_id);

-- 8. 만료된 투표 자동 업데이트 (크론잡 대체)
CREATE OR REPLACE FUNCTION auto_expire_polls()
RETURNS void AS $$
BEGIN
  UPDATE polls 
  SET status = 'ended' 
  WHERE ends_at IS NOT NULL 
    AND ends_at < NOW() 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- 9. 투표 통계 뷰 (분석용)
CREATE OR REPLACE VIEW poll_statistics AS
SELECT 
  p.id,
  p.title,
  p.status,
  p.total_votes,
  p.view_count,
  p.share_count,
  COUNT(DISTINCT pv.ip_address) as unique_voters,
  COUNT(DISTINCT pc.user_id) as unique_commenters,
  COUNT(pc.id) as total_comments
FROM polls p
LEFT JOIN poll_votes pv ON p.id = pv.poll_id
LEFT JOIN poll_comments pc ON p.id = pc.poll_id
GROUP BY p.id, p.title, p.status, p.total_votes, p.view_count, p.share_count;

-- 10. 실행 확인
SELECT 'Database setup completed successfully!' as message;