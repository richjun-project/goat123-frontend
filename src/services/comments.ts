import { supabase } from '../lib/supabase'

export const commentService = {
  // 댓글 삭제 (RLS 우회를 위한 임시 방법)
  async deleteComment(commentId: string, userId: string) {
    try {
      // 먼저 댓글 소유권 확인
      const { data: comment, error: checkError } = await supabase
        .from('poll_comments')
        .select('user_id')
        .eq('id', commentId)
        .single()
      
      if (checkError || !comment) {
        throw new Error('댓글을 찾을 수 없습니다')
      }
      
      if (comment.user_id !== userId) {
        throw new Error('자신의 댓글만 삭제할 수 있습니다')
      }
      
      // RLS 정책이 제대로 동작하지 않을 경우를 위한 대체 방법
      // 1. 먼저 일반 삭제 시도
      const { error: deleteError } = await supabase
        .from('poll_comments')
        .delete()
        .eq('id', commentId)
      
      if (deleteError) {
        console.error('직접 삭제 실패:', deleteError)
        
        // 2. 삭제 실패 시 소프트 삭제 (content를 '[삭제된 댓글]'로 변경)
        const { error: updateError } = await supabase
          .from('poll_comments')
          .update({ 
            content: '[삭제된 댓글입니다]',
            deleted_at: new Date().toISOString()
          })
          .eq('id', commentId)
          .eq('user_id', userId)
        
        if (updateError) {
          throw updateError
        }
        
        return { deleted: false, softDeleted: true }
      }
      
      return { deleted: true, softDeleted: false }
    } catch (error) {
      console.error('댓글 삭제 서비스 에러:', error)
      throw error
    }
  },

  // 댓글 목록 가져오기 (삭제된 댓글 제외)
  async getUserComments(userId: string) {
    const { data, error } = await supabase
      .from('poll_comments')
      .select(`
        *,
        poll:polls!poll_comments_poll_id_fkey(id, title, category),
        option:poll_options!poll_comments_option_id_fkey(option_text, color)
      `)
      .eq('user_id', userId)
      .neq('content', '[삭제된 댓글입니다]') // 소프트 삭제된 댓글 제외
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}