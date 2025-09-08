import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqodybftrjzjydguaaai.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxb2R5YmZ0cmp6anlkZ3VhYWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzM0NTIsImV4cCI6MjA1MDIwOTQ1Mn0.q2EQrcnywnxzWlwAaGOAPT0UbjG2NB9psT8twqB7D-I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedData() {
  try {
    // VS 투표 데이터들
    const polls = [
      {
        title: '치킨 vs 피자',
        description: '영원한 라이벌! 당신의 선택은?',
        poll_type: 'versus',
        category: 'food',
        status: 'active',
        is_hot: true,
        total_votes: 850,
        view_count: 2500,
        share_count: 45,
        comment_count: 32,
        options: [
          { option_text: '치킨', display_order: 1, vote_count: 520 },
          { option_text: '피자', display_order: 2, vote_count: 330 }
        ]
      },
      {
        title: '아이폰 vs 갤럭시',
        description: '최고의 스마트폰은?',
        poll_type: 'versus',
        category: 'tech',
        status: 'active',
        is_hot: true,
        total_votes: 1250,
        view_count: 4200,
        share_count: 67,
        comment_count: 89,
        options: [
          { option_text: '아이폰', display_order: 1, vote_count: 680 },
          { option_text: '갤럭시', display_order: 2, vote_count: 570 }
        ]
      },
      {
        title: '롤 vs 오버워치',
        description: '최고의 게임은?',
        poll_type: 'versus',
        category: 'game',
        status: 'active',
        is_hot: true,
        total_votes: 990,
        view_count: 3100,
        share_count: 55,
        comment_count: 42,
        options: [
          { option_text: '리그 오브 레전드', display_order: 1, vote_count: 620 },
          { option_text: '오버워치 2', display_order: 2, vote_count: 370 }
        ]
      },
      {
        title: '넷플릭스 vs 디즈니+',
        description: '최고의 OTT는?',
        poll_type: 'versus',
        category: 'entertainment',
        status: 'active',
        is_hot: false,
        total_votes: 450,
        view_count: 1800,
        share_count: 23,
        comment_count: 15,
        options: [
          { option_text: '넷플릭스', display_order: 1, vote_count: 280 },
          { option_text: '디즈니+', display_order: 2, vote_count: 170 }
        ]
      },
      {
        title: '최고의 한식 메뉴는?',
        description: '당신이 가장 좋아하는 한식을 선택하세요',
        poll_type: 'multiple',
        category: 'food',
        status: 'active',
        is_hot: true,
        total_votes: 680,
        view_count: 2100,
        share_count: 34,
        comment_count: 28,
        options: [
          { option_text: '김치찌개', display_order: 1, vote_count: 220, color: '#ff4d4f' },
          { option_text: '된장찌개', display_order: 2, vote_count: 180, color: '#52c41a' },
          { option_text: '불고기', display_order: 3, vote_count: 150, color: '#1890ff' },
          { option_text: '비빔밥', display_order: 4, vote_count: 130, color: '#faad14' }
        ]
      }
    ]

    for (const pollData of polls) {
      const { options, ...poll } = pollData
      
      // 투표 생성
      const { data: createdPoll, error: pollError } = await supabase
        .from('polls')
        .insert(poll)
        .select()
        .single()

      if (pollError) {
        console.error('Error creating poll:', pollError)
        continue
      }

      console.log('Created poll:', createdPoll.title)

      // 옵션 생성
      if (createdPoll && options) {
        const optionsWithPollId = options.map(opt => ({
          ...opt,
          poll_id: createdPoll.id
        }))

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionsWithPollId)

        if (optionsError) {
          console.error('Error creating options:', optionsError)
        } else {
          console.log(`  Added ${options.length} options`)
        }
      }
    }

    console.log('✅ Seed data added successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

seedData()