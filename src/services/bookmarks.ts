import { supabase } from '../lib/supabase'

export const bookmarkService = {
  // 북마크 추가/제거 토글
  async toggleBookmark(pollId: string, userId: string) {
    // 먼저 북마크 여부 확인
    const { data: existing } = await supabase
      .from('poll_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('poll_id', pollId)
      .single()

    if (existing) {
      // 북마크 제거
      const { error } = await supabase
        .from('poll_bookmarks')
        .delete()
        .eq('id', existing.id)
      
      if (error) throw error
      return { bookmarked: false }
    } else {
      // 북마크 추가
      const { error } = await supabase
        .from('poll_bookmarks')
        .insert({
          user_id: userId,
          poll_id: pollId
        })
      
      if (error) throw error
      return { bookmarked: true }
    }
  },

  // 사용자의 북마크 목록 가져오기
  async getUserBookmarks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('poll_bookmarks')
        .select(`
          *,
          poll:polls(
            *,
            options:poll_options(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('북마크 조회 에러:', error)
        // 테이블이 없는 경우 빈 배열 반환
        if (error.code === '42P01') {
          return []
        }
        throw error
      }
      return data?.map(bookmark => bookmark.poll).filter(Boolean) || []
    } catch (error) {
      console.error('getUserBookmarks error:', error)
      return []
    }
  },

  // 특정 투표가 북마크되었는지 확인
  async isBookmarked(pollId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('poll_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('poll_id', pollId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found - 북마크 없음
          return false
        }
        if (error.code === '42P01') { // 테이블이 없음
          return false
        }
        console.error('isBookmarked error:', error)
        return false
      }
      
      return !!data
    } catch (error) {
      console.error('isBookmarked exception:', error)
      return false
    }
  },

  // 여러 투표의 북마크 상태 확인
  async getBookmarkStatuses(pollIds: string[], userId: string) {
    const { data, error } = await supabase
      .from('poll_bookmarks')
      .select('poll_id')
      .eq('user_id', userId)
      .in('poll_id', pollIds)

    if (error) throw error
    
    const bookmarkedIds = new Set(data?.map(b => b.poll_id) || [])
    return pollIds.reduce((acc, pollId) => {
      acc[pollId] = bookmarkedIds.has(pollId)
      return acc
    }, {} as Record<string, boolean>)
  }
}