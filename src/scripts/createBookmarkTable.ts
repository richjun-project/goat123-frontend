import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aktukgzzplggrivtnytt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHVrZ3p6cGxnZ3JpdnRueXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NDg0ODcsImV4cCI6MjA1MDUyNDQ4N30.PijGluCvxdNb-332jiPRObOds9-6zLCJtxLxe8aIQKU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBookmarkTable() {
  try {
    // 북마크 테이블 생성 SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- 북마크 테이블 생성
        CREATE TABLE IF NOT EXISTS poll_bookmarks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, poll_id)
        );

        -- 인덱스 생성
        CREATE INDEX IF NOT EXISTS idx_poll_bookmarks_user_id ON poll_bookmarks(user_id);
        CREATE INDEX IF NOT EXISTS idx_poll_bookmarks_poll_id ON poll_bookmarks(poll_id);

        -- RLS 정책 활성화
        ALTER TABLE poll_bookmarks ENABLE ROW LEVEL SECURITY;

        -- RLS 정책 생성
        CREATE POLICY "Users can view their own bookmarks" ON poll_bookmarks
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own bookmarks" ON poll_bookmarks
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own bookmarks" ON poll_bookmarks
          FOR DELETE USING (auth.uid() = user_id);
      `
    })

    if (error) {
      console.error('Error creating bookmark table:', error)
      return
    }

    console.log('북마크 테이블이 성공적으로 생성되었습니다!')
  } catch (error) {
    console.error('Error:', error)
  }
}

createBookmarkTable()