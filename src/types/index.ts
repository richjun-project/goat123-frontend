export interface PollOption {
  id: string
  poll_id: string
  option_text: string
  option_image?: string
  vote_count: number
  display_order: number
  color?: string
  created_at: string
  created_by?: string
  is_user_submitted?: boolean
}

export interface Poll {
  id: string
  title: string
  description?: string
  poll_type: 'versus' | 'multiple'
  category: string
  total_votes: number
  view_count: number
  share_count: number
  comment_count: number
  is_hot: boolean
  is_featured: boolean
  status: 'active' | 'ended' | 'draft'
  created_by?: string
  created_at: string
  updated_at: string
  ends_at?: string
  options?: PollOption[]
}

// Legacy Battle interface for compatibility
export interface Battle {
  id: string
  title: string
  category: string
  option_a: string
  option_b: string
  option_a_image?: string
  option_b_image?: string
  votes_a: number
  votes_b: number
  total_votes: number
  status: 'active' | 'ended'
  is_hot: boolean
  created_at: string
  view_count: number
  share_count: number
}

export interface PollVote {
  id: string
  poll_id: string
  option_id: string
  user_id?: string
  created_at: string
  ip_address: string
}

// Legacy Vote interface for compatibility
export interface Vote {
  id: string
  battle_id: string
  user_id?: string
  selected_option: 'A' | 'B'
  created_at: string
  ip_address: string
}

export interface BattleStats {
  battle_id: string
  timestamp: string
  votes_a_count: number
  votes_b_count: number
  age_distribution?: Record<string, { A: number; B: number }>
  region_distribution?: Record<string, { A: number; B: number }>
  gender_distribution?: { male: { A: number; B: number }; female: { A: number; B: number } }
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export const categories: Category[] = [
  { id: 'all', name: '전체', icon: '🔥', color: '#ff4d4f' },
  { id: 'food', name: '음식', icon: '🍔', color: '#fa8c16' },
  { id: 'tech', name: '테크', icon: '📱', color: '#1890ff' },
  { id: 'game', name: '게임', icon: '🎮', color: '#722ed1' },
  { id: 'entertainment', name: '엔터', icon: '🎬', color: '#eb2f96' },
  { id: 'sports', name: '스포츠', icon: '⚽', color: '#52c41a' },
  { id: 'fashion', name: '패션', icon: '👕', color: '#faad14' },
  { id: 'culture', name: '문화', icon: '🎨', color: '#13c2c2' },
  { id: 'politics', name: '정치', icon: '🏛️', color: '#597ef7' },
  { id: 'life', name: '일상', icon: '🌟', color: '#95de64' },
]