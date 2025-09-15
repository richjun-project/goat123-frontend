-- 내한공연 가수 인기 순위
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440001', '2025 내한공연 가수 기대순위 🔥', 'music', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '브루노 마스', 892, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '찰리 푸스', 756, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '올리비아 로드리고', 623, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '더 위켄드', 589, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '두아 리파', 445, NOW(), NOW());

-- K리그 vs 프리미어리그 
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440002', '축구 보러가기 K리그 vs 프리미어리그', 'sports', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'K리그 (애국심 + 접근성)', 523, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '프리미어리그 (수준 + 스타플레이어)', 867, NOW(), NOW());

-- 연애 상대 MBTI
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440003', '연애하기 가장 힘든 MBTI는? 😱', 'love', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'INTJ (차가운 전략가)', 734, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'ENTP (논쟁 즐기는 변호사)', 892, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'ESTP (위험한 모험가)', 456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'ISTP (감정표현 0%)', 567, NOW(), NOW());

-- 최고의 야구팀
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440004', '2024 KBO 최강팀은?', 'sports', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 'KIA 타이거즈', 1234, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'LG 트윈스', 989, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', '삼성 라이온즈', 756, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'SSG 랜더스', 645, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', '두산 베어스', 823, NOW(), NOW());

-- 이상형 월드컵 - 재벌집 막내아들 vs 의사
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440005', '결혼 상대 이상형 월드컵 💍', 'love', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440005', '재벌 3세 (돈 무한)', 1567, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440005', '의사 (안정적+존경받는)', 1234, NOW(), NOW());

-- 치킨 브랜드 대전
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440006', '치킨계 절대 강자는? 🍗', 'food', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440006', 'BBQ', 2134, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440006', '교촌치킨', 1876, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440006', 'BHC', 1654, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440006', '푸라닭', 987, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440006', '네네치킨', 876, NOW(), NOW());

-- 대학 브랜드 대결
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440007', '명문대 최종 결정전 🎓', 'life', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440007', '서울대 (국내 최고)', 3456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440007', '연세대 (자유로운 분위기)', 2987, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440007', '고려대 (끈끈한 선후배)', 2876, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440007', 'KAIST (이공계 최강)', 1234, NOW(), NOW());

-- 최악의 상사 유형
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440008', '절대 만나고 싶지 않은 상사 유형 😈', 'life', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440008', '감정기복 롤러코스터형', 2345, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440008', '일 떠넘기기 달인형', 2567, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440008', '마이크로 매니징형', 1987, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440008', '공과사 구분 못하는형', 1456, NOW(), NOW());

-- 롤 vs 오버워치
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440009', '한국 e스포츠 자존심 대결', 'game', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440009', '리그오브레전드 (T1 최강)', 4567, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440009', '오버워치 (한국 독식)', 2345, NOW(), NOW());

-- 소주 브랜드 대전
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440010', '회식 필수템 소주 최강자는? 🍶', 'food', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440010', '참이슬', 3456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440010', '처음처럼', 2987, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440010', '진로', 2345, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440010', '새로', 1876, NOW(), NOW());

-- 아이돌 춤 실력
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440011', '춤신춤왕 아이돌 그룹은? 💃', 'entertainment', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440011', '세븐틴 (칼군무 끝판왕)', 4567, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440011', 'NCT (SM 정통 퍼포먼스)', 3456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440011', '스트레이키즈 (파워풀 에너지)', 2987, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440011', 'ATEEZ (무대 장악력)', 2345, NOW(), NOW());

-- 최고의 데이트 코스
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440012', '첫 데이트 장소 최악은? 🚫', 'love', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440012', 'PC방 (게임에만 집중)', 3456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440012', '부모님 소개 (부담 100%)', 4567, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440012', '헬스장 (땀냄새)', 2345, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440012', '독서실 (대화 불가)', 1987, NOW(), NOW());

-- 넷플릭스 vs 디즈니+
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440013', 'OTT 구독 1개만 한다면?', 'entertainment', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440013', '넷플릭스 (콘텐츠 양)', 5678, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440013', '디즈니+ (마블+스타워즈)', 3456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440013', '왓챠 (영화 매니아)', 1234, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440013', '티빙 (tvN 드라마)', 2345, NOW(), NOW());

-- NBA 팀 인기투표
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440014', 'NBA 최고 인기팀은? 🏀', 'sports', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440014', 'LA 레이커스 (르브론)', 3456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440014', '골든스테이트 (커리)', 2987, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440014', '브루클린 넷츠', 1234, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440014', '보스턴 셀틱스', 1876, NOW(), NOW());

-- 커피 브랜드 대전
INSERT INTO polls (id, title, category, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440015', '카페 프랜차이즈 최강자 ☕', 'food', NOW(), NOW());

INSERT INTO poll_options (id, poll_id, option_text, vote_count, created_at, updated_at)
VALUES 
('660e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440015', '스타벅스 (브랜드파워)', 4567, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440015', '투썸플레이스 (케이크맛집)', 3456, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440015', '메가커피 (가성비)', 2987, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440015', '컴포즈커피 (저렴이)', 2345, NOW(), NOW());