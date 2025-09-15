import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aktukgzzplggrivtnytt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHVrZ3p6cGxnZ3JpdnRueXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDI4NTcsImV4cCI6MjA3MTI3ODg1N30.Tjsim0Ih8iv-XdAiwDQUDHNuU77zsg6uw_XfyKKG67A';

const supabase = createClient(supabaseUrl, supabaseKey);

const polls = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: '2025 내한공연 가수 기대순위 🔥',
    category: 'music',
    options: [
      { option_text: '브루노 마스', vote_count: 892 },
      { option_text: '찰리 푸스', vote_count: 756 },
      { option_text: '올리비아 로드리고', vote_count: 623 },
      { option_text: '더 위켄드', vote_count: 589 },
      { option_text: '두아 리파', vote_count: 445 }
    ],
    comments: [
      { content: '브루노 마스 안오면 진짜 서울시청 앞에서 1인시위함' },
      { content: '찰리푸스 내한 언제와... 10년째 기다리는중 ㅠㅠ' },
      { content: '올리비아 로드리고 ㄹㅇ 와야됨 drivers license 라이브로 듣고싶어' },
      { content: '더 위켄드는 진짜 무대 장인이라 꼭 봐야됨 ㅋㅋㅋ' },
      { content: '두아리파 이미 2번 왔는데 또 와줬으면... 콘서트 미쳤었음' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: '축구 보러가기 K리그 vs 프리미어리그',
    category: 'sports',
    options: [
      { option_text: 'K리그 (애국심 + 접근성)', vote_count: 523 },
      { option_text: '프리미어리그 (수준 + 스타플레이어)', vote_count: 867 }
    ],
    comments: [
      { content: 'K리그도 직관 한번 해보면 재밌음 ㅋㅋ 근데 프리미어리그는 차원이 다르지' },
      { content: '솔직히 손흥민 경기 보려면 프리미어리그 봐야지 ㅋㅋㅋㅋ' },
      { content: 'K리그 티켓값 싸고 접근성 좋아서 가족끼리 가기 좋음' },
      { content: '축구는 현장감이 중요한데 K리그도 나름 재밌어요!' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: '연애하기 가장 힘든 MBTI는? 😱',
    category: 'love',
    options: [
      { option_text: 'INTJ (차가운 전략가)', vote_count: 734 },
      { option_text: 'ENTP (논쟁 즐기는 변호사)', vote_count: 892 },
      { option_text: 'ESTP (위험한 모험가)', vote_count: 456 },
      { option_text: 'ISTP (감정표현 0%)', vote_count: 567 }
    ],
    comments: [
      { content: 'INTJ는 진짜... 연애할때도 전략 짜고 분석함 ㅋㅋㅋㅋ' },
      { content: 'ENTP 만나봤는데 매일이 토론배틀임 지침...' },
      { content: 'ESTP는 너무 충동적이야 갑자기 번지점프 가자고 함' },
      { content: 'ISTP 3년 만났는데 사랑한다 소리 5번도 안들어봄 ㅋㅋㅋㅋㅋ' },
      { content: 'MBTI 믿는 사람이 제일 연애하기 힘듦 ㅇㅈ?' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: '2024 KBO 최강팀은?',
    category: 'sports',
    options: [
      { option_text: 'KIA 타이거즈', vote_count: 1234 },
      { option_text: 'LG 트윈스', vote_count: 989 },
      { option_text: '삼성 라이온즈', vote_count: 756 },
      { option_text: 'SSG 랜더스', vote_count: 645 },
      { option_text: '두산 베어스', vote_count: 823 }
    ],
    comments: [
      { content: 'KIA는 인정이지 V12 가즈아!!!!' },
      { content: 'LG는 서울이라는 메리트가 있음 잠실 접근성 최고' },
      { content: '삼성 팬인데 올해는 좀... 내년 기대합니다 ㅠㅠ' },
      { content: 'SSG 문학구장 시설 진짜 좋음 직관 추천' },
      { content: '두산 곰밴드 최고... 분위기 하나는 진짜 좋음' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: '결혼 상대 이상형 월드컵 💍',
    category: 'love',
    options: [
      { option_text: '재벌 3세 (돈 무한)', vote_count: 1567 },
      { option_text: '의사 (안정적+존경받는)', vote_count: 1234 }
    ],
    comments: [
      { content: '재벌 3세면 평생 일 안해도 되잖아 ㅋㅋㅋㅋ 당연히 재벌이지' },
      { content: '의사가 더 현실적임 재벌은 만날 확률이 0%' },
      { content: '재벌이면 시댁 스트레스 장난아닐듯...' },
      { content: '의사는 너무 바빠서 가정 신경 못씀 경험담임' },
      { content: '돈보다 사랑이죠~~ (재벌 뽑음 ㅋ)' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    title: '치킨계 절대 강자는? 🍗',
    category: 'food',
    options: [
      { option_text: 'BBQ', vote_count: 2134 },
      { option_text: '교촌치킨', vote_count: 1876 },
      { option_text: 'BHC', vote_count: 1654 },
      { option_text: '푸라닭', vote_count: 987 },
      { option_text: '네네치킨', vote_count: 876 }
    ],
    comments: [
      { content: 'BBQ 황금올리브 못 이김 진리임' },
      { content: '교촌 레드콤보 안먹어본 사람 없게 해주세요' },
      { content: 'BHC 뿌링클 최고... 이거 이길 치킨 없음' },
      { content: '푸라닭 블랙알리오 존맛... 다들 모르는 숨은 맛집' },
      { content: '네네 스노윙 치킨 파우더 중독성 장난아님 ㅋㅋㅋ' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    title: '명문대 최종 결정전 🎓',
    category: 'life',
    options: [
      { option_text: '서울대 (국내 최고)', vote_count: 3456 },
      { option_text: '연세대 (자유로운 분위기)', vote_count: 2987 },
      { option_text: '고려대 (끈끈한 선후배)', vote_count: 2876 },
      { option_text: 'KAIST (이공계 최강)', vote_count: 1234 }
    ],
    comments: [
      { content: '서울대는 그냥 넘사벽이지... SKY중에서도 S가 다름' },
      { content: '연세대 신촌 캠퍼스 낭만 최고임 대학생활 제대로 즐기고싶으면 연대' },
      { content: '고대 선배들 인맥 장난아님 취업할때 체감함' },
      { content: 'KAIST는 공대생들한테는 서울대보다 위임 팩트' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    title: '절대 만나고 싶지 않은 상사 유형 😈',
    category: 'life',
    options: [
      { option_text: '감정기복 롤러코스터형', vote_count: 2345 },
      { option_text: '일 떠넘기기 달인형', vote_count: 2567 },
      { option_text: '마이크로 매니징형', vote_count: 1987 },
      { option_text: '공과사 구분 못하는형', vote_count: 1456 }
    ],
    comments: [
      { content: '감정기복 상사 진짜 최악... 아침에 웃다가 오후에 폭발함' },
      { content: '일 떠넘기기 달인 = 본인은 커피만 마시고 우리는 야근' },
      { content: '마이크로 매니징은 진짜 숨막혀... 5분마다 진행상황 물어봄' },
      { content: '공과사 구분 못하는 상사... 회식에서 차였다고 나한테 화풀이함 ㅋㅋ' },
      { content: '다 최악임 좋은 상사 만나는게 복권 당첨 확률' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    title: '한국 e스포츠 자존심 대결',
    category: 'game',
    options: [
      { option_text: '리그오브레전드 (T1 최강)', vote_count: 4567 },
      { option_text: '오버워치 (한국 독식)', vote_count: 2345 }
    ],
    comments: [
      { content: 'T1 페이커가 있는 이상 롤이 원탑이지' },
      { content: '오버워치 한국이 씹어먹는 게임임 월드컵 우승 몇번인데' },
      { content: '롤은 이제 할아버지 게임... 오버워치가 미래다' },
      { content: '롤드컵 시청자수 vs 오버워치리그 시청자수 비교하면 답나옴' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    title: '회식 필수템 소주 최강자는? 🍶',
    category: 'food',
    options: [
      { option_text: '참이슬', vote_count: 3456 },
      { option_text: '처음처럼', vote_count: 2987 },
      { option_text: '진로', vote_count: 2345 },
      { option_text: '새로', vote_count: 1876 }
    ],
    comments: [
      { content: '참이슬 오리지널이 진리지 다른건 왜먹음?' },
      { content: '처음처럼 순한데 은근 취함 ㅋㅋㅋ 위험한 술' },
      { content: '진로 이즈백 두꺼비 돌아왔다!!!' },
      { content: '새로 먹으면 담날 안아픔 숙취 없는 술' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    title: '춤신춤왕 아이돌 그룹은? 💃',
    category: 'entertainment',
    options: [
      { option_text: '세븐틴 (칼군무 끝판왕)', vote_count: 4567 },
      { option_text: 'NCT (SM 정통 퍼포먼스)', vote_count: 3456 },
      { option_text: '스트레이키즈 (파워풀 에너지)', vote_count: 2987 },
      { option_text: 'ATEEZ (무대 장악력)', vote_count: 2345 }
    ],
    comments: [
      { content: '세븐틴 13명 칼군무는 진짜 소름돋음... 직캠 보면 미침' },
      { content: 'NCT는 SM 정통 퍼포먼스 계승자들임 춤선이 다름' },
      { content: '스키즈 무대 에너지 장난아님 콘서트 가면 기절함' },
      { content: 'ATEEZ는 해외에서 더 인정받는 퍼포먼스 강자' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    title: '첫 데이트 장소 최악은? 🚫',
    category: 'love',
    options: [
      { option_text: 'PC방 (게임에만 집중)', vote_count: 3456 },
      { option_text: '부모님 소개 (부담 100%)', vote_count: 4567 },
      { option_text: '헬스장 (땀냄새)', vote_count: 2345 },
      { option_text: '독서실 (대화 불가)', vote_count: 1987 }
    ],
    comments: [
      { content: 'PC방 데이트는 진짜... 남친이 롤하느라 날 안봄 ㅋㅋㅋㅋ' },
      { content: '첫 데이트에 부모님 소개는 미친짓... 결혼 전제 아니면 부담 100배' },
      { content: '헬스장은 ㅋㅋㅋㅋㅋ 땀냄새에 화장 다 지워짐' },
      { content: '독서실 데이트 실화냐? 공부하러 가는건가 데이트하러 가는건가' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    title: 'OTT 구독 1개만 한다면?',
    category: 'entertainment',
    options: [
      { option_text: '넷플릭스 (콘텐츠 양)', vote_count: 5678 },
      { option_text: '디즈니+ (마블+스타워즈)', vote_count: 3456 },
      { option_text: '왓챠 (영화 매니아)', vote_count: 1234 },
      { option_text: '티빙 (tvN 드라마)', vote_count: 2345 }
    ],
    comments: [
      { content: '넷플릭스는 그냥 필수임 안보는 사람이 없음' },
      { content: '디즈니+는 마블/스타워즈 덕후라면 필수' },
      { content: '왓챠는 영화 진짜 많음 숨은 명작 찾기 좋음' },
      { content: '티빙은 tvN 예능/드라마 보려면 필수 ㅋㅋ' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    title: 'NBA 최고 인기팀은? 🏀',
    category: 'sports',
    options: [
      { option_text: 'LA 레이커스 (르브론)', vote_count: 3456 },
      { option_text: '골든스테이트 (커리)', vote_count: 2987 },
      { option_text: '브루클린 넷츠', vote_count: 1234 },
      { option_text: '보스턴 셀틱스', vote_count: 1876 }
    ],
    comments: [
      { content: '레이커스는 르브론 있는 이상 인기 1위임' },
      { content: '커리의 3점은 예술임 골든스테이트 경기 꿀잼' },
      { content: '보스턴은 전통 명가... 우승 횟수가 다름' }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    title: '카페 프랜차이즈 최강자 ☕',
    category: 'food',
    options: [
      { option_text: '스타벅스 (브랜드파워)', vote_count: 4567 },
      { option_text: '투썸플레이스 (케이크맛집)', vote_count: 3456 },
      { option_text: '메가커피 (가성비)', vote_count: 2987 },
      { option_text: '컴포즈커피 (저렴이)', vote_count: 2345 }
    ],
    comments: [
      { content: '스벅은 비싸도 분위기값임 공부하기 좋음' },
      { content: '투썸 케이크는 진짜 인정... 커피보다 케이크 먹으러 감' },
      { content: '메가커피 가성비 미쳤음 아메리카노 2000원' },
      { content: '컴포즈 1500원 커피 퀄리티 개좋음 가성비 끝판왕' }
    ]
  }
];

async function insertData() {
  try {
    // Insert polls
    for (const poll of polls) {
      console.log(`Inserting poll: ${poll.title}`);
      
      // Insert poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          id: poll.id,
          title: poll.title,
          category: poll.category
        });

      if (pollError) {
        console.error(`Error inserting poll ${poll.title}:`, pollError);
        continue;
      }

      // Insert options
      for (const option of poll.options) {
        const { error: optionError } = await supabase
          .from('poll_options')
          .insert({
            poll_id: poll.id,
            option_text: option.option_text,
            vote_count: option.vote_count
          });

        if (optionError) {
          console.error(`Error inserting option ${option.option_text}:`, optionError);
        }
      }

      // Insert comments
      for (const comment of poll.comments) {
        const { error: commentError } = await supabase
          .from('comments')
          .insert({
            poll_id: poll.id,
            user_id: '123e4567-e89b-12d3-a456-426614174000', // Default user
            content: comment.content
          });

        if (commentError) {
          console.error(`Error inserting comment:`, commentError);
        }
      }
    }

    console.log('✅ All data inserted successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

insertData();