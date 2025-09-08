-- VS 투표 샘플 데이터 추가
DO $$
DECLARE
  poll_id1 uuid;
  poll_id2 uuid;
  poll_id3 uuid;
  poll_id4 uuid;
  poll_id5 uuid;
BEGIN
  -- 1. 치킨 vs 피자
  INSERT INTO polls (title, description, poll_type, category, status, is_hot, total_votes, view_count, share_count, comment_count)
  VALUES ('치킨 vs 피자', '영원한 라이벌! 당신의 선택은?', 'versus', 'food', 'active', true, 850, 2500, 45, 32)
  RETURNING id INTO poll_id1;
  
  INSERT INTO poll_options (poll_id, option_text, display_order, vote_count)
  VALUES 
    (poll_id1, '치킨', 1, 520),
    (poll_id1, '피자', 2, 330);

  -- 2. 아이폰 vs 갤럭시
  INSERT INTO polls (title, description, poll_type, category, status, is_hot, total_votes, view_count, share_count, comment_count)
  VALUES ('아이폰 vs 갤럭시', '최고의 스마트폰은?', 'versus', 'tech', 'active', true, 1250, 4200, 67, 89)
  RETURNING id INTO poll_id2;
  
  INSERT INTO poll_options (poll_id, option_text, display_order, vote_count)
  VALUES 
    (poll_id2, '아이폰', 1, 680),
    (poll_id2, '갤럭시', 2, 570);

  -- 3. 롤 vs 오버워치
  INSERT INTO polls (title, description, poll_type, category, status, is_hot, total_votes, view_count, share_count, comment_count)
  VALUES ('롤 vs 오버워치', '최고의 게임은?', 'versus', 'game', 'active', true, 990, 3100, 55, 42)
  RETURNING id INTO poll_id3;
  
  INSERT INTO poll_options (poll_id, option_text, display_order, vote_count)
  VALUES 
    (poll_id3, '리그 오브 레전드', 1, 620),
    (poll_id3, '오버워치 2', 2, 370);

  -- 4. 넷플릭스 vs 디즈니+
  INSERT INTO polls (title, description, poll_type, category, status, is_hot, total_votes, view_count, share_count, comment_count)
  VALUES ('넷플릭스 vs 디즈니+', '최고의 OTT는?', 'versus', 'entertainment', 'active', false, 450, 1800, 23, 15)
  RETURNING id INTO poll_id4;
  
  INSERT INTO poll_options (poll_id, option_text, display_order, vote_count)
  VALUES 
    (poll_id4, '넷플릭스', 1, 280),
    (poll_id4, '디즈니+', 2, 170);

  -- 5. 다중 선택 투표도 하나 추가
  INSERT INTO polls (title, description, poll_type, category, status, is_hot, total_votes, view_count, share_count, comment_count)
  VALUES ('최고의 한식 메뉴는?', '당신이 가장 좋아하는 한식을 선택하세요', 'multiple', 'food', 'active', true, 680, 2100, 34, 28)
  RETURNING id INTO poll_id5;
  
  INSERT INTO poll_options (poll_id, option_text, display_order, vote_count, color)
  VALUES 
    (poll_id5, '김치찌개', 1, 220, '#ff4d4f'),
    (poll_id5, '된장찌개', 2, 180, '#52c41a'),
    (poll_id5, '불고기', 3, 150, '#1890ff'),
    (poll_id5, '비빔밥', 4, 130, '#faad14');

END $$;