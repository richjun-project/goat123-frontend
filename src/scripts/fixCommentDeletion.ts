import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aktukgzzplggrivtnytt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHVrZ3p6cGxnZ3JpdnRueXR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk0ODQ4NywiZXhwIjoyMDUwNTI0NDg3fQ.DQqb3dVTSbZlLn1sLWqtmPe30pxKV1K6y9S9PYoXYvI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixCommentDeletion() {
  try {
    console.log('댓글 삭제 정책 수정 중...')
    
    // 기존 정책 삭제
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Users can delete their own comments" ON poll_comments;
        `
      })
    } catch (error) {
      // Ignore error
    }

    // 새 정책 생성
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can delete their own comments" 
        ON poll_comments 
        FOR DELETE 
        USING (auth.uid() = user_id);
      `
    })

    if (error) {
      console.error('정책 생성 실패:', error)
    } else {
      console.log('✅ 댓글 삭제 정책이 성공적으로 생성되었습니다!')
    }
  } catch (error) {
    console.error('오류 발생:', error)
  }
}

fixCommentDeletion()