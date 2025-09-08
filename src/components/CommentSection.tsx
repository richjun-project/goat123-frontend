import React, { useState, useEffect } from 'react'
import { Card, List, Avatar, Input, Button, Space, Typography, Empty, message, Tooltip, Tag } from 'antd'
import { SendOutlined, LikeOutlined, LikeFilled, UserOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const { TextArea } = Input
const { Text, Paragraph } = Typography

interface Comment {
  id: string
  poll_id: string
  user_id: string
  option_id?: string
  content: string
  likes: number
  created_at: string
  user?: {
    name: string
    avatar_url?: string
    email: string
  }
  option?: {
    option_text: string
    color?: string
  }
}

interface CommentSectionProps {
  pollId: string
  pollOptions?: any[]
}

const CommentSection: React.FC<CommentSectionProps> = ({ pollId, pollOptions = [] }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  // 댓글 불러오기
  useEffect(() => {
    fetchComments()
    
    // 실시간 구독
    const subscription = supabase
      .channel(`comments:${pollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_comments',
          filter: `poll_id=eq.${pollId}`
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [pollId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('poll_comments')
        .select(`
          *,
          user:users!poll_comments_user_id_fkey(name, avatar_url, email),
          option:poll_options!poll_comments_option_id_fkey(option_text, color)
        `)
        .eq('poll_id', pollId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
      
      // 로컬 스토리지에서 좋아요 기록 불러오기
      const liked = JSON.parse(localStorage.getItem('likedComments') || '[]')
      setLikedComments(new Set(liked))
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!newComment.trim()) {
      message.warning('댓글 내용을 입력해주세요')
      return
    }

    setSubmitting(true)
    try {
      // option_id가 null이면 제외
      const commentData: any = {
        poll_id: pollId,
        user_id: user.id,
        content: newComment.trim(),
        likes: 0
      }
      
      // selectedOption이 있을 때만 추가
      if (selectedOption) {
        commentData.option_id = selectedOption
      }

      const { error } = await supabase
        .from('poll_comments')
        .insert(commentData)

      if (error) {
        console.error('Comment error:', error)
        throw error
      }

      setNewComment('')
      setSelectedOption(null)
      message.success('댓글이 작성되었습니다')
      fetchComments() // 댓글 목록 새로고침
    } catch (error: any) {
      console.error('Error creating comment:', error)
      message.error(error.message || '댓글 작성에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (commentId: string, currentLikes: number, commentUserId?: string) => {
    const isLiked = likedComments.has(commentId)
    
    try {
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1
      
      const { error } = await supabase
        .from('poll_comments')
        .update({ likes: newLikes })
        .eq('id', commentId)

      if (error) throw error

      // 좋아요 추가 시 알림 생성 (자기 자신의 댓글이 아닌 경우)
      if (!isLiked && commentUserId && user && commentUserId !== user.id) {
        // 댓글 정보 가져오기
        const comment = comments.find(c => c.id === commentId)
        if (comment) {
          await supabase
            .from('notifications')
            .insert({
              user_id: commentUserId,
              type: 'like',
              title: '댓글 좋아요',
              description: `${user.email?.split('@')[0] || '누군가'}님이 "${comment.content.substring(0, 30)}${comment.content.length > 30 ? '...' : ''}" 댓글을 좋아합니다`,
              related_id: pollId,
              read: false
            })
        }
      }

      // 로컬 스토리지 업데이트
      const newLikedComments = new Set(likedComments)
      if (isLiked) {
        newLikedComments.delete(commentId)
      } else {
        newLikedComments.add(commentId)
      }
      setLikedComments(newLikedComments)
      localStorage.setItem('likedComments', JSON.stringify(Array.from(newLikedComments)))
    } catch (error) {
      message.error('좋아요 처리에 실패했습니다')
    }
  }

  return (
    <>
      <Card 
        id="comment-section"
        title={`댓글 ${comments.length}개`}
        style={{ marginTop: 24 }}
      >
        {/* 댓글 작성 영역 */}
        <div style={{ marginBottom: 24 }}>
          {pollOptions.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ marginRight: 8 }}>
                선택한 옵션:
              </Text>
              <Space wrap>
                {pollOptions.map(option => (
                  <Tag
                    key={option.id}
                    color={selectedOption === option.id ? option.color : undefined}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedOption(
                      selectedOption === option.id ? null : option.id
                    )}
                  >
                    {option.option_text}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
          
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다"}
              autoSize={{ minRows: 1, maxRows: 3 }}
              disabled={!user}
              style={{ resize: 'none' }}
              onPressEnter={(e) => {
                if (e.shiftKey) return
                e.preventDefault()
                handleSubmit()
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={!user || !newComment.trim()}
              style={{ height: 'auto' }}
            >
              작성
            </Button>
          </Space.Compact>
          
          {!user && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                <a onClick={() => setShowAuthModal(true)}>로그인</a>하여 댓글을 작성하세요
              </Text>
            </div>
          )}
        </div>

        {/* 댓글 목록 */}
        <List
          loading={loading}
          locale={{ emptyText: <Empty description="첫 번째 댓글을 작성해보세요!" /> }}
          dataSource={comments}
          renderItem={(comment) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <List.Item
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={likedComments.has(comment.id) ? <LikeFilled /> : <LikeOutlined />}
                    onClick={() => handleLike(comment.id, comment.likes, comment.user_id)}
                    style={{ 
                      color: likedComments.has(comment.id) ? '#ff4d4f' : undefined 
                    }}
                  >
                    {comment.likes > 0 && comment.likes}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={comment.user?.avatar_url}
                      icon={!comment.user?.avatar_url && <UserOutlined />}
                    >
                      {!comment.user?.avatar_url && comment.user?.name?.[0]}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text strong>{comment.user?.name || '익명'}</Text>
                      {comment.option && (
                        <Tag color={comment.option.color} style={{ fontSize: 11 }}>
                          {comment.option.option_text}
                        </Tag>
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(comment.created_at).fromNow()}
                      </Text>
                    </Space>
                  }
                  description={
                    <Paragraph style={{ marginBottom: 0 }}>
                      {comment.content}
                    </Paragraph>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      </Card>

      <AuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}

export default CommentSection