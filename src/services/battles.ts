import { supabase } from '../lib/supabase'
import type { Battle, Poll, PollOption } from '../types'

export const battleService = {
  // 모든 배틀 가져오기
  async getAllBattles(category?: string) {
    let query = supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('status', 'active')
      .order('total_votes', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: polls, error } = await query
    if (error) throw error
    
    // Convert Poll to Battle format for compatibility
    return (polls as Poll[]).map(poll => convertPollToBattle(poll))
  },

  // HOT 배틀 가져오기
  async getHotBattle() {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('is_hot', true)
      .single()

    if (error) {
      // HOT 배틀이 없으면 가장 인기있는 배틀 반환
      const { data: topPoll } = await supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*)
        `)
        .eq('status', 'active')
        .order('total_votes', { ascending: false })
        .limit(1)
        .single()
      
      return topPoll ? convertPollToBattle(topPoll as Poll) : null
    }
    return convertPollToBattle(data as Poll)
  },

  // TOP 3 배틀 가져오기
  async getTopBattles() {
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('status', 'active')
      .order('total_votes', { ascending: false })
      .limit(3)

    if (error) throw error
    return (polls as Poll[]).map(poll => convertPollToBattle(poll))
  },

  // 특정 배틀 가져오기
  async getBattleById(id: string) {
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return convertPollToBattle(poll as Poll)
  },

  // 투표하기
  async vote(battleId: string, selectedOption: 'A' | 'B', userId?: string) {
    // IP 주소 가져오기 (프로덕션에서는 서버 사이드에서 처리)
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const { ip } = await ipResponse.json()

    // 중복 투표 확인
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', battleId)
      .eq('ip_address', ip)
      .single()

    if (existingVote) {
      // 재투표 로직 (1회만 가능)
      const { data: reVoteCount } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', battleId)
        .eq('ip_address', ip)
        
      if (reVoteCount && reVoteCount.length >= 2) {
        throw new Error('재투표는 1회만 가능합니다.')
      }
    }

    // 투표 추가
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: battleId,
        user_id: userId,
        selected_option: selectedOption,
        ip_address: ip,
        user_agent: navigator.userAgent
      })

    if (error) throw error

    // 투표 후 업데이트된 배틀 정보 반환
    return this.getBattleById(battleId)
  },

  // 조회수 증가
  async incrementViewCount(battleId: string) {
    const { error } = await supabase.rpc('increment_view_count', {
      battle_id: battleId
    })
    
    if (error) console.error('Error incrementing view count:', error)
  },

  // 공유 횟수 증가
  async incrementShareCount(battleId: string) {
    const { error } = await supabase.rpc('increment_share_count', {
      battle_id: battleId
    })
    
    if (error) console.error('Error incrementing share count:', error)
  }
}

// Realtime 구독 헬퍼
export const subscribeToRealtimeUpdates = (
  battleId: string,
  onUpdate: (battle: Battle) => void
) => {
  return supabase
    .channel(`battle-${battleId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'polls',
        filter: `id=eq.${battleId}`
      },
      async (payload) => {
        const poll = payload.new as Poll
        // 옵션 정보 다시 가져오기
        const { data: options } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', poll.id)
          .order('display_order')
        
        poll.options = options || []
        onUpdate(convertPollToBattle(poll))
      }
    )
    .subscribe()
}

// Poll을 Battle 형식으로 변환하는 헬퍼 함수
function convertPollToBattle(poll: Poll): Battle {
  const options = poll.options || []
  const optionA = options.find(o => o.display_order === 1)
  const optionB = options.find(o => o.display_order === 2)
  
  return {
    id: poll.id,
    title: poll.title,
    category: poll.category,
    option_a: optionA?.option_text || '',
    option_b: optionB?.option_text || '',
    option_a_image: optionA?.option_image,
    option_b_image: optionB?.option_image,
    votes_a: optionA?.vote_count || 0,
    votes_b: optionB?.vote_count || 0,
    total_votes: poll.total_votes,
    status: poll.status === 'active' ? 'active' : 'ended',
    is_hot: poll.is_hot,
    created_at: poll.created_at,
    view_count: poll.view_count,
    share_count: poll.share_count
  }
}

// 전체 배틀 리스트 실시간 구독
export const subscribeToAllBattles = (
  onUpdate: (battles: Battle[]) => void
) => {
  return supabase
    .channel('all-battles')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'polls'
      },
      async () => {
        // 업데이트 시 전체 리스트 다시 가져오기
        const battles = await battleService.getAllBattles()
        onUpdate(battles)
      }
    )
    .subscribe()
}