import { supabase } from '../lib/supabase'
import type { Poll, PollOption, PollVote } from '../types'

export const pollService = {
  // 모든 투표 가져오기
  async getAllPolls(category?: string, pollType?: 'versus' | 'multiple') {
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

    if (pollType) {
      query = query.eq('poll_type', pollType)
    }

    const { data: polls, error } = await query
    if (error) throw error
    
    return (polls || []) as Poll[]
  },

  // HOT 투표 가져오기 - 실제 인기도 기준
  async getHotPolls() {
    // is_hot이 true인 투표 먼저 확인
    let { data: hotPolls, error } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('is_hot', true)
      .eq('status', 'active')
      .order('total_votes', { ascending: false })
      .limit(3)

    if (error) throw error

    // is_hot 투표가 3개 미만이면 인기도 기준으로 추가 선택
    if (!hotPolls || hotPolls.length < 3) {
      const { data: topPolls, error: topError } = await supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*)
        `)
        .eq('status', 'active')
        .gt('total_votes', 0)  // 최소 1표 이상
        .order('total_votes', { ascending: false })
        .limit(3)
      
      if (topError) throw topError
      return (topPolls || []) as Poll[]
    }
    
    return (hotPolls || []) as Poll[]
  },

  // TOP 3 투표 가져오기
  async getTopPolls() {
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
    return (polls || []) as Poll[]
  },

  // 특정 투표 가져오기
  async getPollById(id: string) {
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return poll as Poll
  },

  // 투표하기
  async vote(pollId: string, optionId: string) {
    // 먼저 투표가 만료되었는지 확인
    const { data: poll } = await supabase
      .from('polls')
      .select('ends_at, status')
      .eq('id', pollId)
      .single()
    
    if (poll?.status === 'ended' || (poll?.ends_at && new Date(poll.ends_at) < new Date())) {
      throw new Error('이 투표는 이미 종료되었습니다.')
    }
    
    let ip = 'unknown'
    
    // IP 주소 가져오기 (에러 처리 추가)
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      if (ipResponse.ok) {
        const data = await ipResponse.json()
        ip = data.ip || 'unknown'
      }
    } catch (error) {
      console.warn('Failed to get IP address:', error)
      // IP를 못 가져와도 계속 진행 (랜덤 ID 생성)
      ip = `anonymous_${Date.now()}_${Math.random().toString(36).substring(7)}`
    }

    // 중복 투표 확인
    const { data: existingVotes } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('ip_address', ip)
      .limit(1)
    
    const existingVote = existingVotes && existingVotes.length > 0

    if (existingVote) {
      throw new Error('이미 투표하셨습니다.')
    }

    // 현재 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser()
    
    // 투표 추가 (트리거가 자동으로 vote_count를 업데이트함)
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user?.id || null,
        ip_address: ip
      })

    if (error) throw error

    console.log('Vote added successfully. Trigger will update counts automatically.')

    // 투표 후 업데이트된 투표 정보 반환
    return this.getPollById(pollId)
  },

  // 투표 생성
  async createPoll(
    title: string,
    description: string,
    pollType: 'versus' | 'multiple',
    category: string,
    options: { text: string; image?: string; color?: string }[]
  ) {
    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('로그인이 필요합니다.')
    
    // 투표 생성
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title,
        description,
        poll_type: pollType,
        category,
        status: 'active',
        created_by: user.id
      })
      .select()
      .single()

    if (pollError) throw pollError

    // 옵션들 생성
    const optionsToInsert = options.map((opt, index) => ({
      poll_id: poll.id,
      option_text: opt.text,
      option_image: opt.image,
      color: opt.color || generateColor(index),
      display_order: index + 1
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)

    if (optionsError) throw optionsError

    return poll
  },

  // 조회수 증가
  async incrementViewCount(pollId: string) {
    // RPC 함수 대신 직접 UPDATE
    const { data: currentPoll } = await supabase
      .from('polls')
      .select('view_count')
      .eq('id', pollId)
      .single()
    
    if (currentPoll) {
      const { error } = await supabase
        .from('polls')
        .update({ view_count: (currentPoll.view_count || 0) + 1 })
        .eq('id', pollId)
      
      if (error) console.error('Error incrementing view count:', error)
    }
  },

  // 공유 횟수 증가
  async incrementShareCount(pollId: string) {
    // RPC 함수 대신 직접 UPDATE
    const { data: currentPoll } = await supabase
      .from('polls')
      .select('share_count')
      .eq('id', pollId)
      .single()
    
    if (currentPoll) {
      const { error } = await supabase
        .from('polls')
        .update({ share_count: (currentPoll.share_count || 0) + 1 })
        .eq('id', pollId)
      
      if (error) console.error('Error incrementing share count:', error)
    }
  },

  // 투표 수정
  async updatePoll(
    pollId: string,
    title: string,
    description: string,
    category: string
  ) {
    const { data, error } = await supabase
      .from('polls')
      .update({
        title,
        description,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', pollId)
      .select()
      .single()

    if (error) throw error
    return data as Poll
  },

  // 투표 삭제 (CASCADE 삭제로 자동 처리)
  async deletePoll(pollId: string) {
    try {
      // CASCADE 삭제로 연관 데이터는 자동 삭제됨
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId)

      if (error) {
        console.error('투표 삭제 에러:', error)
        throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('투표 삭제 실패:', error)
      throw error
    }
  },

  // 투표 소유자 확인
  async checkPollOwner(pollId: string, userId: string) {
    const { data, error } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single()

    if (error) throw error
    return data?.created_by === userId
  },

  // 사용자가 옵션 추가하기
  async addUserOption(pollId: string, optionText: string) {
    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('로그인이 필요합니다.')

    // 투표가 다중 선택인지 확인
    const { data: poll } = await supabase
      .from('polls')
      .select('poll_type, status')
      .eq('id', pollId)
      .single()

    if (poll?.poll_type !== 'multiple') {
      throw new Error('다중 선택 투표에만 옵션을 추가할 수 있습니다.')
    }

    if (poll?.status !== 'active') {
      throw new Error('활성 투표에만 옵션을 추가할 수 있습니다.')
    }

    // 현재 옵션 수 확인 (순서 결정용)
    const { data: existingOptions } = await supabase
      .from('poll_options')
      .select('display_order')
      .eq('poll_id', pollId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existingOptions?.[0]?.display_order ? existingOptions[0].display_order + 1 : 1

    // 옵션 추가
    const { data, error } = await supabase
      .from('poll_options')
      .insert({
        poll_id: pollId,
        option_text: optionText,
        display_order: nextOrder,
        color: generateColor(nextOrder - 1),
        is_user_submitted: true,
        created_by: user.id,
        vote_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 사용자가 추가한 옵션 삭제
  async deleteUserOption(optionId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('로그인이 필요합니다.')

    // 옵션 확인
    const { data: option } = await supabase
      .from('poll_options')
      .select('created_by, is_user_submitted, vote_count')
      .eq('id', optionId)
      .single()

    if (!option) throw new Error('옵션을 찾을 수 없습니다.')
    if (option.created_by !== user.id) throw new Error('본인이 추가한 옵션만 삭제할 수 있습니다.')
    if (!option.is_user_submitted) throw new Error('사용자가 추가한 옵션만 삭제할 수 있습니다.')
    if (option.vote_count > 0) throw new Error('투표가 있는 옵션은 삭제할 수 없습니다.')

    const { error } = await supabase
      .from('poll_options')
      .delete()
      .eq('id', optionId)

    if (error) throw error
    return { success: true }
  }
}

// 색상 생성 헬퍼
function generateColor(index: number): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C41A',
    '#FA8C16', '#1890FF', '#722ED1', '#EB2F96', '#13C2C2'
  ]
  return colors[index % colors.length]
}

// Realtime 구독 헬퍼
export const subscribeToPollUpdates = (
  pollId: string,
  onUpdate: (poll: Poll) => void
) => {
  return supabase
    .channel(`poll-${pollId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'polls',
        filter: `id=eq.${pollId}`
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
        onUpdate(poll)
      }
    )
    .subscribe()
}

// 전체 투표 리스트 실시간 구독
export const subscribeToAllPolls = (
  onUpdate: (polls: Poll[]) => void
) => {
  return supabase
    .channel('all-polls')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'polls'
      },
      async () => {
        // 업데이트 시 전체 리스트 다시 가져오기
        const polls = await pollService.getAllPolls()
        onUpdate(polls)
      }
    )
    .subscribe()
}