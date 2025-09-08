import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aktukgzzplggrivtnytt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHVrZ3p6cGxnZ3JpdnRueXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDI4NTcsImV4cCI6MjA3MTI3ODg1N30.Tjsim0Ih8iv-XdAiwDQUDHNuU77zsg6uw_XfyKKG67A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  try {
    // 테스트 계정 생성
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test1234',
      options: {
        data: {
          name: '테스트 사용자'
        }
      }
    })

    if (error) {
      console.error('테스트 계정 생성 실패:', error)
      return
    }

    console.log('테스트 계정이 생성되었습니다:', data.user?.email)
    
    // users 테이블에도 프로필 생성
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: '테스트 사용자',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('프로필 생성 실패:', profileError)
      } else {
        console.log('프로필이 생성되었습니다')
      }
    }
  } catch (error) {
    console.error('오류:', error)
  }
}

createTestUser()