import { supabase } from '../lib/supabase'

export const databaseSetup = {
  // poll_comments 테이블에 대한 DELETE 정책 확인 및 생성
  async ensureCommentDeletePolicy() {
    try {
      // Service role key를 사용하여 정책 생성 (필요시)
      // 참고: 이는 관리자 권한이 필요하므로 Supabase 대시보드에서 직접 실행하는 것이 좋습니다
      
      const testSQL = `
        -- 댓글 삭제 정책 (Supabase SQL Editor에서 실행)
        
        -- 기존 정책 삭제
        DROP POLICY IF EXISTS "Users can delete their own comments" ON poll_comments;
        
        -- 새 정책 생성
        CREATE POLICY "Users can delete their own comments" 
        ON poll_comments 
        FOR DELETE 
        USING (auth.uid() = user_id);
        
        -- 확인
        SELECT * FROM pg_policies WHERE tablename = 'poll_comments' AND policyname LIKE '%delete%';
      `
      
      console.log('다음 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요:')
      console.log(testSQL)
      
      return testSQL
    } catch (error) {
      console.error('정책 설정 실패:', error)
      throw error
    }
  },

  // 북마크 테이블 생성
  async createBookmarkTable() {
    const sql = `
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
      DROP POLICY IF EXISTS "Users can view their own bookmarks" ON poll_bookmarks;
      CREATE POLICY "Users can view their own bookmarks" ON poll_bookmarks
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can create their own bookmarks" ON poll_bookmarks;
      CREATE POLICY "Users can create their own bookmarks" ON poll_bookmarks
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON poll_bookmarks;
      CREATE POLICY "Users can delete their own bookmarks" ON poll_bookmarks
        FOR DELETE USING (auth.uid() = user_id);
    `
    
    return sql
  }
}