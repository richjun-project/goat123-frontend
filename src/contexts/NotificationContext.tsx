import React, { createContext, useContext, useEffect, useState } from 'react'
import { notification, message } from 'antd'
import { BellOutlined, CommentOutlined, HeartOutlined, TrophyOutlined, UserAddOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface Notification {
  id: string
  type: 'comment' | 'vote' | 'like' | 'poll_winner' | 'new_follower'
  title: string
  description: string
  read: boolean
  created_at: string
  data?: any
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'comment':
      return <CommentOutlined style={{ color: '#1890ff' }} />
    case 'vote':
      return <TrophyOutlined style={{ color: '#52c41a' }} />
    case 'like':
      return <HeartOutlined style={{ color: '#ff4d4f' }} />
    case 'poll_winner':
      return <TrophyOutlined style={{ color: '#faad14' }} />
    case 'new_follower':
      return <UserAddOutlined style={{ color: '#722ed1' }} />
    default:
      return <BellOutlined />
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // 저장된 알림 불러오기
    const savedNotifications = localStorage.getItem(`notifications_${user.id}`)
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications)
      setNotifications(parsed)
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
    }

    // 실시간 구독 설정
    const channel = supabase.channel(`notifications:${user.id}`)
    
    // 내 투표에 대한 참여 알림
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'poll_votes'
      },
      async (payload) => {
        const { data: poll } = await supabase
          .from('polls')
          .select('title, created_by')
          .eq('id', payload.new.poll_id)
          .single()

        if (poll?.created_by === user.id && payload.new.user_id !== user.id) {
          showNotification({
            id: `vote_${Date.now()}`,
            type: 'vote',
            title: '새로운 투표 참여',
            description: `"${poll.title}" 투표에 누군가 참여했습니다`,
            read: false,
            created_at: new Date().toISOString(),
            data: { poll_id: payload.new.poll_id }
          })
        }
      }
    )
    
    // 내 투표에 대한 댓글 알림
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'poll_comments'
      },
      async (payload) => {
        const { data: poll } = await supabase
          .from('polls')
          .select('title, created_by')
          .eq('id', payload.new.poll_id)
          .single()

        if (poll?.created_by === user.id && payload.new.user_id !== user.id) {
          const { data: commenter } = await supabase
            .from('users')
            .select('name')
            .eq('id', payload.new.user_id)
            .single()
            
          showNotification({
            id: `comment_${Date.now()}`,
            type: 'comment',
            title: '새로운 댓글',
            description: `${commenter?.name || '누군가'}님이 "${poll.title}" 투표에 댓글을 남겼습니다`,
            read: false,
            created_at: new Date().toISOString(),
            data: { poll_id: payload.new.poll_id }
          })
        }
      }
    )
    
    const subscription = channel.subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const showNotification = (notif: Notification) => {
    // 알림 표시
    notification.open({
      message: notif.title,
      description: notif.description,
      icon: getNotificationIcon(notif.type),
      placement: 'topRight',
      duration: 4,
      onClick: () => {
        if (notif.data?.poll_id) {
          window.location.href = `/poll/${notif.data.poll_id}`
        }
      }
    })

    // 알림 저장
    setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50) // 최대 50개 보관
      if (user) {
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
      }
      return updated
    })
    
    setUnreadCount(prev => prev + 1)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
      if (user) {
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
      }
      return updated
    })
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      if (user) {
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
      }
      return updated
    })
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
    if (user) {
      localStorage.removeItem(`notifications_${user.id}`)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext