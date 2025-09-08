import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aktukgzzplggrivtnytt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHVrZ3p6cGxnZ3JpdnRueXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NDg0ODcsImV4cCI6MjA1MDUyNDQ4N30.PijGluCvxdNb-332jiPRObOds9-6zLCJtxLxe8aIQKU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCommentDeletion() {
  try {
    // 테스트용 사용자로 로그인
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('로그인이 필요합니다')
      return
    }

    console.log('현재 사용자:', user.id)

    // 사용자의 댓글 하나 가져오기
    const { data: comments, error: fetchError } = await supabase
      .from('poll_comments')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)

    if (fetchError) {
      console.error('댓글 조회 에러:', fetchError)
      return
    }

    if (!comments || comments.length === 0) {
      console.log('삭제할 댓글이 없습니다')
      return
    }

    const testComment = comments[0]
    console.log('삭제 테스트할 댓글:', testComment.id)

    // 삭제 시도
    const { error: deleteError } = await supabase
      .from('poll_comments')
      .delete()
      .eq('id', testComment.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('삭제 실패:', deleteError)
      console.error('에러 상세:', {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code
      })
    } else {
      console.log('댓글이 성공적으로 삭제되었습니다!')
    }
  } catch (error) {
    console.error('예외 발생:', error)
  }
}

// RLS 정책 확인
async function checkRLSPolicies() {
  console.log('=== RLS 정책 확인 ===')
  console.log('poll_comments 테이블의 DELETE 정책을 확인하세요:')
  console.log('1. Supabase 대시보드 > Authentication > Policies')
  console.log('2. poll_comments 테이블의 DELETE 정책이 있는지 확인')
  console.log('3. 정책이 auth.uid() = user_id를 사용하는지 확인')
  
  // 필요한 정책 SQL
  console.log('\n필요한 경우 이 SQL을 실행하세요:')
  console.log(`
CREATE POLICY "Users can delete their own comments" 
ON poll_comments 
FOR DELETE 
USING (auth.uid() = user_id);
  `)
}

checkRLSPolicies()
testCommentDeletion()