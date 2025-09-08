-- GOAT123 Database Schema for Supabase

-- battles 테이블: 배틀 정보
CREATE TABLE battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_a_image TEXT,
  option_b_image TEXT,
  votes_a INTEGER DEFAULT 0,
  votes_b INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  is_hot BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- votes 테이블: 투표 기록
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  user_id UUID,
  selected_option CHAR(1) CHECK (selected_option IN ('A', 'B')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- battle_stats 테이블: 실시간 통계
CREATE TABLE battle_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  votes_a_count INTEGER,
  votes_b_count INTEGER,
  age_distribution JSONB,
  region_distribution JSONB,
  gender_distribution JSONB
);

-- 인덱스 생성
CREATE INDEX idx_battles_category ON battles(category);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_is_hot ON battles(is_hot);
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);
CREATE INDEX idx_battles_total_votes ON battles(total_votes DESC);
CREATE INDEX idx_votes_battle_id ON votes(battle_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);
CREATE INDEX idx_battle_stats_battle_id ON battle_stats(battle_id);
CREATE INDEX idx_battle_stats_timestamp ON battle_stats(timestamp DESC);

-- 투표 시 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_battle_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.selected_option = 'A' THEN
    UPDATE battles 
    SET votes_a = votes_a + 1,
        total_votes = total_votes + 1,
        updated_at = NOW()
    WHERE id = NEW.battle_id;
  ELSE
    UPDATE battles 
    SET votes_b = votes_b + 1,
        total_votes = total_votes + 1,
        updated_at = NOW()
    WHERE id = NEW.battle_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_battle_votes
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION update_battle_votes();

-- HOT 배틀 자동 선정 (최근 24시간 내 가장 많은 투표)
CREATE OR REPLACE FUNCTION update_hot_battles()
RETURNS void AS $$
BEGIN
  -- 모든 배틀의 is_hot을 false로 설정
  UPDATE battles SET is_hot = false;
  
  -- 최근 24시간 내 가장 많은 투표를 받은 배틀을 HOT으로 설정
  UPDATE battles 
  SET is_hot = true
  WHERE id = (
    SELECT battle_id 
    FROM votes 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY battle_id 
    ORDER BY COUNT(*) DESC 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) 설정
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_stats ENABLE ROW LEVEL SECURITY;

-- battles 테이블 정책
CREATE POLICY "battles_read_all" ON battles
  FOR SELECT USING (true);

CREATE POLICY "battles_insert_authenticated" ON battles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "battles_update_authenticated" ON battles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- votes 테이블 정책
CREATE POLICY "votes_read_own" ON votes
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "votes_insert_all" ON votes
  FOR INSERT WITH CHECK (true);

-- battle_stats 테이블 정책
CREATE POLICY "battle_stats_read_all" ON battle_stats
  FOR SELECT USING (true);

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(battle_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE battles 
  SET view_count = view_count + 1
  WHERE id = battle_id;
END;
$$ LANGUAGE plpgsql;

-- 공유수 증가 함수
CREATE OR REPLACE FUNCTION increment_share_count(battle_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE battles 
  SET share_count = share_count + 1
  WHERE id = battle_id;
END;
$$ LANGUAGE plpgsql;

-- 샘플 데이터 삽입
INSERT INTO battles (title, category, option_a, option_b, option_a_image, option_b_image, votes_a, votes_b, total_votes, is_hot) VALUES
('최고의 라면은?', 'food', '신라면', '진라면', 
 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=신라면', 
 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=진라면',
 52341, 51892, 104233, true),
('최고의 치킨 브랜드는?', 'food', '교촌치킨', 'BBQ',
 'https://via.placeholder.com/300x200/FFE66D/333333?text=교촌',
 'https://via.placeholder.com/300x200/A8E6CF/333333?text=BBQ',
 72543, 68921, 141464, false),
('최고의 스마트폰 브랜드는?', 'tech', 'iPhone', 'Galaxy',
 'https://via.placeholder.com/300x200/95E1D3/333333?text=iPhone',
 'https://via.placeholder.com/300x200/F38181/FFFFFF?text=Galaxy',
 134567, 98234, 232801, false);