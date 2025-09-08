import React, { useMemo, useState, useEffect } from 'react'
import { Card, Typography, Space, Tag, Progress, Button, Row, Col, Avatar, message } from 'antd'
import { TeamOutlined, FireOutlined, ShareAltOutlined, CommentOutlined, BookOutlined, BookFilled } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Poll } from '../types'
import { bookmarkService } from '../services/bookmarks'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography

interface PollCardProps {
  poll: Poll
  index?: number
}

const PollCard: React.FC<PollCardProps> = ({ poll, index = 0 }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const options = poll.options || []
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  
  useEffect(() => {
    if (user) {
      checkBookmarkStatus()
    }
  }, [user, poll.id])
  
  const checkBookmarkStatus = async () => {
    if (!user) return
    try {
      const bookmarked = await bookmarkService.isBookmarked(poll.id, user.id)
      setIsBookmarked(bookmarked)
    } catch (error) {
      // 북마크 테이블이 없거나 에러 발생 시 조용히 실패
      console.log('북마크 상태 확인 실패')
      setIsBookmarked(false)
    }
  }
  
  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지
    
    if (!user) {
      message.warning('로그인이 필요합니다')
      return
    }
    
    setBookmarkLoading(true)
    try {
      const result = await bookmarkService.toggleBookmark(poll.id, user.id)
      setIsBookmarked(result.bookmarked)
      message.success(result.bookmarked ? '북마크에 추가되었습니다' : '북마크가 제거되었습니다')
    } catch (error) {
      message.error('북마크 처리에 실패했습니다')
    } finally {
      setBookmarkLoading(false)
    }
  }
  
  // 가장 많은 표를 받은 옵션 찾기 - useMemo로 최적화
  const { leadingOption, leadingPercent } = useMemo(() => {
    const leading = options.reduce((prev, current) => 
      (current.vote_count > prev.vote_count) ? current : prev
    , options[0])
    
    const percent = poll.total_votes > 0 
      ? Math.round((leading?.vote_count / poll.total_votes) * 100)
      : 0
      
    return { leadingOption: leading, leadingPercent: percent }
  }, [options, poll.total_votes])

  // 1:1 대결인 경우 - 퍼센트 계산 useMemo로 최적화
  const { percentA, percentB } = useMemo(() => {
    if (poll.poll_type === 'versus' && options.length === 2) {
      const a = poll.total_votes > 0 
        ? Math.round((options[0].vote_count / poll.total_votes) * 100)
        : 50
      const b = poll.total_votes > 0
        ? Math.round((options[1].vote_count / poll.total_votes) * 100)
        : 50
      return { percentA: a, percentB: b }
    }
    return { percentA: 0, percentB: 0 }
  }, [poll.poll_type, poll.total_votes, options])

  if (poll.poll_type === 'versus' && options.length === 2) {

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.3) }}
        whileHover={{ y: -5 }}
        style={{ height: '100%', width: '100%' }}
      >
        <Card
          hoverable
          onClick={() => navigate(`/poll/${poll.id}`)}
          style={{ height: '100%', minHeight: '450px', width: '100%', display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}
          cover={
            <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
              <div style={{ display: 'flex', height: '100%' }}>
                <div 
                  style={{ 
                    flex: 1,
                    backgroundImage: options[0].option_image ? `url(${options[0].option_image})` : 'none',
                    backgroundColor: options[0].option_image ? 'transparent' : '#f0f2f5',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!options[0].option_image && (
                    <Title level={4} style={{ color: '#595959' }}>{options[0].option_text}</Title>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '30px 10px 10px',
                    color: 'white'
                  }}>
                    <Text strong style={{ color: 'white', fontSize: 14 }}>{options[0].option_text}</Text>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{percentA}%</div>
                  </div>
                </div>
                
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'white',
                  borderRadius: '50%',
                  padding: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1
                }}>
                  <Text strong style={{ fontSize: 16 }}>VS</Text>
                </div>
                
                <div 
                  style={{ 
                    flex: 1,
                    backgroundImage: options[1].option_image ? `url(${options[1].option_image})` : 'none',
                    backgroundColor: options[1].option_image ? 'transparent' : '#f0f2f5',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!options[1].option_image && (
                    <Title level={4} style={{ color: '#595959' }}>{options[1].option_text}</Title>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '30px 10px 10px',
                    color: 'white'
                  }}>
                    <Text strong style={{ color: 'white', fontSize: 14 }}>{options[1].option_text}</Text>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{percentB}%</div>
                  </div>
                </div>
              </div>
              
              {poll.is_hot && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 2
                }}>
                  <Tag color="red" icon={<FireOutlined />}>HOT</Tag>
                </div>
              )}
            </div>
          }
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0, fontSize: 16 }} ellipsis>
              {poll.title}
            </Title>
            
            <Progress 
              percent={100}
              success={{ percent: (percentB / 100) * 100 }}
              showInfo={false}
              strokeColor={percentA > percentB ? '#52c41a' : '#ff4d4f'}
              trailColor={percentB > percentA ? '#52c41a' : '#ff4d4f'}
              size="small"
            />
            
            <Row justify="space-between" align="middle">
              <Col>
                <Space size={4}>
                  <TeamOutlined />
                  <Text type="secondary">{poll.total_votes.toLocaleString()}명 참여</Text>
                </Space>
              </Col>
            </Row>
          </Space>
        </Card>
      </motion.div>
    )
  }

  // 다중 선택 투표인 경우
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -5 }}
      style={{ height: '100%', width: '100%' }}
    >
      <Card
        hoverable
        onClick={() => navigate(`/poll/${poll.id}`)}
        style={{ height: '450px', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        cover={
          <div style={{ 
            padding: 20, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}>
            <Tag 
              color="purple" 
              style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10,
                fontSize: 12
              }}
            >
              {options.length}개 선택지
            </Tag>
            
            {poll.is_hot && (
              <Tag 
                color="red" 
                icon={<FireOutlined />}
                style={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 10
                }}
              >
                HOT
              </Tag>
            )}
            
            <Title level={4} style={{ color: 'white', margin: '10px 0' }}>
              {poll.title}
            </Title>
            
            {poll.description && (
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                {poll.description}
              </Text>
            )}
            
            <div style={{ marginTop: 20 }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                현재 1위
              </Text>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: 8, 
                padding: '8px 12px',
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Text strong style={{ color: 'white' }}>
                  {leadingOption?.option_text}
                </Text>
                <Tag color="gold">{leadingPercent}%</Tag>
              </div>
            </div>
          </div>
        }
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* 상위 3개 옵션 표시 */}
          {options
            .sort((a, b) => b.vote_count - a.vote_count)
            .slice(0, 3)
            .map((option, idx) => {
              const percent = poll.total_votes > 0 
                ? Math.round((option.vote_count / poll.total_votes) * 100)
                : 0
              
              return (
                <div key={option.id}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 4 }}>
                    <Col>
                      <Space size={4}>
                        <Text strong style={{ fontSize: 12 }}>
                          {idx + 1}.
                        </Text>
                        <Text style={{ fontSize: 13 }}>
                          {option.option_text}
                        </Text>
                      </Space>
                    </Col>
                    <Col>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {percent}%
                      </Text>
                    </Col>
                  </Row>
                  <Progress 
                    percent={percent} 
                    showInfo={false}
                    strokeColor={option.color || '#1890ff'}
                    size="small"
                  />
                </div>
              )
            })}
          
          {options.length > 3 && (
            <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
              +{options.length - 3}개 더 보기
            </Text>
          )}
          
          <Row justify="space-between" align="middle" style={{ 
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Col>
              <Space size={4}>
                <TeamOutlined />
                <Text type="secondary">{poll.total_votes.toLocaleString()}명 참여</Text>
              </Space>
            </Col>
            <Col>
              <Button
                type="text"
                size="small"
                icon={isBookmarked ? <BookFilled /> : <BookOutlined />}
                onClick={handleBookmark}
                loading={bookmarkLoading}
                style={{ 
                  color: isBookmarked ? '#faad14' : undefined 
                }}
              />
            </Col>
          </Row>
        </Space>
      </Card>
    </motion.div>
  )
}

export default React.memo(PollCard)