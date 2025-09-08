// MVP: 실시간 댓글 기능은 MVP에서 제외
/*
import React, { useState, useEffect } from 'react'
import { Card, Tabs, List, Avatar, Typography, Empty, Tag, Space, Badge } from 'antd'
import { CommentOutlined, FireOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const { Text, Paragraph } = Typography
const { TabPane } = Tabs

interface RecentComment {
  id: string
  content: string
  created_at: string
  poll_id: string
  poll?: {
    title: string
    category: string
  }
  user?: {
    name: string
    avatar_url?: string
  }
  option?: {
    option_text: string
    color?: string
  }
}

interface PollActivity {
  poll_id: string
  poll_title: string
  comment_count: number
  recent_comments: RecentComment[]
  last_activity: string
}

const RealtimeComments: React.FC = () => {
  const navigate = useNavigate()
  const [activePolls, setActivePolls] = useState<PollActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('0')

  useEffect(() => {
    fetchActiveComments()
    
    // 실시간 구독
    const subscription = supabase
      .channel('realtime-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_comments'
        },
        (payload) => {
          fetchActiveComments()
        }
      )
      .subscribe()

    // 30초마다 업데이트
    const interval = setInterval(fetchActiveComments, 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const fetchActiveComments = async () => {
    try {
      // 최근 1주일 내 활발한 댓글 활동이 있는 투표 찾기
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: recentComments, error } = await supabase
        .from('poll_comments')
        .select(`
          *,
          poll:polls!poll_comments_poll_id_fkey(title, category),
          user:users!poll_comments_user_id_fkey(name, avatar_url),
          option:poll_options!poll_comments_option_id_fkey(option_text, color)
        `)
        .gte('created_at', oneWeekAgo)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      // 투표별로 그룹화
      const pollMap = new Map<string, PollActivity>()
      
      recentComments?.forEach(comment => {
        const pollId = comment.poll_id
        if (!pollMap.has(pollId)) {
          pollMap.set(pollId, {
            poll_id: pollId,
            poll_title: comment.poll?.title || '제목 없음',
            comment_count: 0,
            recent_comments: [],
            last_activity: comment.created_at
          })
        }
        
        const activity = pollMap.get(pollId)!
        activity.comment_count++
        if (activity.recent_comments.length < 3) {
          activity.recent_comments.push(comment)
        }
        
        // 가장 최근 활동 시간 업데이트
        if (comment.created_at > activity.last_activity) {
          activity.last_activity = comment.created_at
        }
      })

      // 활동량 순으로 정렬하여 상위 3개만
      const sortedActivities = Array.from(pollMap.values())
        .sort((a, b) => b.comment_count - a.comment_count)
        .slice(0, 3)

      setActivePolls(sortedActivities)
    } catch (error) {
      console.error('Error fetching active comments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null
  if (activePolls.length === 0) return null

  return (
    <Card 
      title={
        <Space>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <span>실시간 댓글</span>
          <Badge count={activePolls.reduce((sum, p) => sum + p.comment_count, 0)} />
        </Space>
      }
      style={{ marginTop: 24, marginBottom: 24 }}
      bodyStyle={{ padding: 0 }}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarStyle={{ margin: 0, padding: '0 16px' }}
      >
        {activePolls.map((activity, index) => (
          <TabPane 
            tab={
              <Space size={4}>
                <Text ellipsis style={{ maxWidth: 120 }}>
                  {activity.poll_title}
                </Text>
                <Badge 
                  count={activity.comment_count} 
                  style={{ backgroundColor: '#52c41a' }}
                />
              </Space>
            } 
            key={index.toString()}
          >
            <div style={{ padding: 16 }}>
              <div 
                style={{ 
                  marginBottom: 16, 
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/poll/${activity.poll_id}`)}
              >
                <Text strong>{activity.poll_title}</Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  {dayjs(activity.last_activity).fromNow()} 마지막 활동
                </Text>
              </div>

              <List
                dataSource={activity.recent_comments}
                renderItem={(comment) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <List.Item style={{ padding: '8px 0' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size="small"
                            src={comment.user?.avatar_url}
                            icon={!comment.user?.avatar_url && <UserOutlined />}
                          >
                            {!comment.user?.avatar_url && comment.user?.name?.[0]}
                          </Avatar>
                        }
                        title={
                          <Space size={4}>
                            <Text strong style={{ fontSize: 13 }}>
                              {comment.user?.name || '익명'}
                            </Text>
                            {comment.option && (
                              <Tag 
                                color={comment.option.color} 
                                style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}
                              >
                                {comment.option.option_text}
                              </Tag>
                            )}
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {dayjs(comment.created_at).fromNow()}
                            </Text>
                          </Space>
                        }
                        description={
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ marginBottom: 0, fontSize: 12 }}
                          >
                            {comment.content}
                          </Paragraph>
                        }
                      />
                    </List.Item>
                  </motion.div>
                )}
                locale={{ emptyText: <Empty description="댓글이 없습니다" /> }}
              />

              {activity.comment_count > 3 && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Text 
                    type="secondary" 
                    style={{ fontSize: 12, cursor: 'pointer' }}
                    onClick={() => navigate(`/poll/${activity.poll_id}#comment-section`)}
                  >
                    +{activity.comment_count - 3}개 댓글 더 보기
                  </Text>
                </div>
              )}
            </div>
          </TabPane>
        ))}
      </Tabs>
    </Card>
  )
}

export default RealtimeComments
*/

// MVP용 빈 컴포넌트로 대체
import React from 'react'

const RealtimeComments: React.FC = () => {
  // MVP: 실시간 댓글 기능은 나중에 구현
  return null
}

export default RealtimeComments