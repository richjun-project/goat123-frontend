import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // 샘플 투표 데이터
    const samplePolls = [
      {
        title: "BLACKPINK vs 뉴진스 - 2025 최고의 K-POP 걸그룹은?",
        description: "2025년을 빛낼 최고의 K-POP 걸그룹을 선택해주세요!",
        poll_type: 'versus',
        category: 'entertainment',
        is_hot: true,
        view_count: 15234,
        total_votes: 8921,
        share_count: 342,
        comment_count: 156
      },
      {
        title: "2025년 MZ세대 필수 아이템은?",
        description: "올해 꼭 가져야 할 아이템을 투표해주세요",
        poll_type: 'multiple',
        category: 'lifestyle',
        is_hot: true,
        view_count: 9876,
        total_votes: 5432,
        share_count: 234,
        comment_count: 89
      },
      {
        title: "치킨 vs 피자 - 영원한 야식 대결",
        description: "금요일 밤, 당신의 선택은?",
        poll_type: 'versus',
        category: 'food',
        is_hot: false,
        view_count: 7654,
        total_votes: 4321,
        share_count: 123,
        comment_count: 67
      },
      {
        title: "2025 최고의 AI 서비스는?",
        description: "가장 유용한 AI 서비스를 선택해주세요",
        poll_type: 'multiple',
        category: 'tech',
        is_hot: true,
        view_count: 12345,
        total_votes: 6789,
        share_count: 456,
        comment_count: 234
      },
      {
        title: "아이폰 vs 갤럭시 - 2025 스마트폰 대전",
        description: "당신의 선택은?",
        poll_type: 'versus',
        category: 'tech',
        is_hot: false,
        view_count: 5432,
        total_votes: 3210,
        share_count: 98,
        comment_count: 45
      },
      {
        title: "2025 최고의 넷플릭스 드라마는?",
        description: "올해 가장 재밌게 본 드라마를 선택해주세요",
        poll_type: 'multiple',
        category: 'entertainment',
        is_hot: true,
        view_count: 8765,
        total_votes: 4567,
        share_count: 167,
        comment_count: 78
      }
    ]

    // 투표 생성
    for (const pollData of samplePolls) {
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          ...pollData,
          created_by: null // 익명 투표
        })
        .select()
        .single()

      if (pollError) {
        console.error('Error creating poll:', pollError)
        continue
      }

      console.log(`✅ Created poll: ${poll.title}`)

      // 옵션 생성
      if (poll.poll_type === 'versus') {
        // VS 투표 옵션
        const options = poll.title.includes('BLACKPINK') 
          ? ['BLACKPINK', '뉴진스']
          : poll.title.includes('치킨')
          ? ['치킨', '피자']
          : poll.title.includes('아이폰')
          ? ['아이폰', '갤럭시']
          : ['옵션 A', '옵션 B']

        for (let i = 0; i < options.length; i++) {
          const voteCount = Math.floor(poll.total_votes * (i === 0 ? 0.52 : 0.48))
          await supabase
            .from('poll_options')
            .insert({
              poll_id: poll.id,
              option_text: options[i],
              display_order: i + 1,
              vote_count: voteCount,
              color: i === 0 ? '#ff4d4f' : '#1890ff'
            })
        }
      } else {
        // 다중 선택 옵션
        const options = poll.title.includes('MZ세대')
          ? ['에어팟 프로', '갤럭시 워치', '아이패드', '닌텐도 스위치', '다이슨 에어랩']
          : poll.title.includes('AI')
          ? ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney']
          : ['오징어 게임', '킹덤', '지금 우리 학교는', '더 글로리', '이상한 변호사 우영우']

        for (let i = 0; i < options.length; i++) {
          const voteCount = Math.floor(poll.total_votes / options.length * (1 + Math.random() * 0.5))
          await supabase
            .from('poll_options')
            .insert({
              poll_id: poll.id,
              option_text: options[i],
              display_order: i + 1,
              vote_count: voteCount,
              color: ['#ff4d4f', '#52c41a', '#1890ff', '#faad14', '#722ed1'][i % 5]
            })
        }
      }

      console.log(`  ✅ Created options for poll: ${poll.id}`)
    }

    console.log('🎉 Database seeding completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

// 실행
seedDatabase()