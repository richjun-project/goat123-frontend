import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Space, Row, Col, Progress, Skeleton, Empty, message, Divider, Avatar, Modal, Badge, Tooltip, Popconfirm, Input, Form } from 'antd'
import { ArrowLeftOutlined, ShareAltOutlined, CommentOutlined, FireOutlined, TeamOutlined, EyeOutlined, ClockCircleOutlined, BarChartOutlined, EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { usePoll } from '../hooks/usePolls'
import { pollService } from '../services/polls'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PollShareCard from '../components/PollShareCard'
import CommentSection from '../components/CommentSection'
import PollTimer from '../components/PollTimer'
import PollFavorite from '../components/PollFavorite'
import PollExport from '../components/PollExport'
import PollActions from '../components/PollActions'
import AuthModal from '../components/AuthModal'
import type { PollOption } from '../types'

const { Title, Text, Paragraph } = Typography

const PollDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { poll, loading, error, refresh } = usePoll(id!)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [votingAnimation, setVotingAnimation] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [showAddOptionModal, setShowAddOptionModal] = useState(false)
  const [newOptionText, setNewOptionText] = useState('')
  const [isAddingOption, setIsAddingOption] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  // 로컬 스토리지에서 투표 여부 확인 및 소유자 확인
  useEffect(() => {
    if (id) {
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
      setHasVoted(votedPolls.includes(id))
    }
  }, [id])
  
  // 소유자 및 현재 사용자 확인
  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (poll && poll.created_by) {
        setIsOwner(user?.id === poll.created_by)
      }
    }
    checkOwnership()
  }, [poll])
  

  const handleVote = async () => {
    if (!selectedOption || !poll || isVoting) return

    // 로그인 확인
    if (!user) {
      message.warning('투표하려면 로그인이 필요합니다.')
      setShowAuthModal(true)
      return
    }

    setIsVoting(true)
    try {
      setVotingAnimation(selectedOption)
      
      // 투표 실행
      await pollService.vote(poll.id, selectedOption)
      
      // 로컬 스토리지에 투표 기록
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
      if (!votedPolls.includes(poll.id)) {
        votedPolls.push(poll.id)
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls))
      }
      
      setHasVoted(true)
      message.success('투표가 완료되었습니다!')
      
      // 데이터 새로고침 (페이지 리로드 없이)
      setTimeout(() => {
        refresh()
        setVotingAnimation(null)
      }, 500)
      
    } catch (error: any) {
      console.error('Vote error:', error)
      message.error(error.message || '투표에 실패했습니다')
      setVotingAnimation(null)
    } finally {
      setIsVoting(false)
    }
  }

  const handleShare = () => {
    pollService.incrementShareCount(poll!.id)
    setShowShareModal(true)
  }


  const handleDelete = async () => {
    try {
      await pollService.deletePoll(poll!.id)
      message.success('투표가 삭제되었습니다')
      navigate('/')
    } catch (error) {
      message.error('투표 삭제에 실패했습니다')
    }
  }

  const handleAddOption = async () => {
    if (!newOptionText.trim() || !poll) return

    setIsAddingOption(true)
    try {
      await pollService.addUserOption(poll.id, newOptionText.trim())
      message.success('선택지가 추가되었습니다!')
      setShowAddOptionModal(false)
      setNewOptionText('')
      refresh()
    } catch (error: any) {
      message.error(error.message || '선택지 추가에 실패했습니다')
    } finally {
      setIsAddingOption(false)
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    try {
      await pollService.deleteUserOption(optionId)
      message.success('선택지가 삭제되었습니다')
      refresh()
    } catch (error: any) {
      message.error(error.message || '선택지 삭제에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <Card>
          <Empty description="투표를 찾을 수 없습니다" />
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
          </div>
        </Card>
      </div>
    )
  }

  const options = poll.options || []
  const totalVotes = poll.total_votes || 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
      >
        뒤로 가기
      </Button>

      <Card>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          {poll.is_hot && (
            <Badge.Ribbon text="🔥 HOT" color="red">
              <div />
            </Badge.Ribbon>
          )}
          
          <Title level={2} style={{ marginBottom: 8 }}>
            {poll.title}
          </Title>
          
          {poll.description && (
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              {poll.description}
            </Paragraph>
          )}
          
          <Space size="large" style={{ marginTop: 16 }}>
            <Tooltip title="총 참여자">
              <Space>
                <TeamOutlined />
                <Text strong>{totalVotes.toLocaleString()}</Text>
              </Space>
            </Tooltip>
            <Tooltip title="조회수">
              <Space>
                <EyeOutlined />
                <Text>{poll.view_count.toLocaleString()}</Text>
              </Space>
            </Tooltip>
            <Tooltip title="댓글">
              <Space>
                <CommentOutlined />
                <Text>{poll.comment_count}</Text>
              </Space>
            </Tooltip>
            <Tooltip title="공유">
              <Space>
                <ShareAltOutlined />
                <Text>{poll.share_count}</Text>
              </Space>
            </Tooltip>
          </Space>
        </div>

        <Divider />

        {/* 투표 옵션 */}
        <div style={{ marginBottom: 30 }}>
          {poll.poll_type === 'versus' && options.length === 2 ? (
            // VS 투표
            <Row gutter={24}>
              {options.map((option) => {
                const percent = totalVotes > 0 
                  ? Math.round((option.vote_count / totalVotes) * 100)
                  : 0  // 0표일 때는 0%로 표시
                const isWinning = totalVotes > 0 && option.vote_count === Math.max(...options.map(o => o.vote_count))
                
                return (
                  <Col xs={24} sm={12} key={option.id}>
                    <motion.div
                      whileHover={!hasVoted ? { scale: 1.02 } : {}}
                      whileTap={!hasVoted ? { scale: 0.98 } : {}}
                      animate={votingAnimation === option.id ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                    >
                      <Card
                        hoverable={!hasVoted}
                        onClick={() => !hasVoted && setSelectedOption(option.id)}
                        style={{
                          border: selectedOption === option.id 
                            ? '2px solid #1890ff' 
                            : '1px solid #f0f0f0',
                          background: hasVoted && isWinning 
                            ? 'linear-gradient(135deg, #f6f9fc 0%, #e8f4fd 100%)'
                            : undefined
                        }}
                      >
                        {option.option_image && (
                          <div style={{ 
                            height: 200, 
                            marginBottom: 16,
                            borderRadius: 8,
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={option.option_image} 
                              alt={option.option_text}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />
                          </div>
                        )}
                        
                        <Title level={4} style={{ textAlign: 'center' }}>
                          {option.option_text}
                        </Title>
                        
                        {hasVoted && (
                          <>
                            <div style={{ 
                              fontSize: 32, 
                              fontWeight: 'bold', 
                              textAlign: 'center',
                              color: isWinning ? '#52c41a' : '#595959'
                            }}>
                              {percent}%
                            </div>
                            <Progress 
                              percent={percent} 
                              showInfo={false}
                              strokeColor={isWinning ? '#52c41a' : '#1890ff'}
                            />
                            <Text type="secondary" style={{ 
                              display: 'block', 
                              textAlign: 'center',
                              marginTop: 8
                            }}>
                              {option.vote_count.toLocaleString()}표
                            </Text>
                          </>
                        )}
                      </Card>
                    </motion.div>
                  </Col>
                )
              })}
            </Row>
          ) : (
            // 다중 선택 투표
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {options
                .sort((a, b) => hasVoted ? b.vote_count - a.vote_count : a.display_order - b.display_order)
                .map((option, index) => {
                  const percent = totalVotes > 0 
                    ? Math.round((option.vote_count / totalVotes) * 100)
                    : 0
                  const isLeading = index === 0 && hasVoted
                  
                  return (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={!hasVoted ? { x: 10 } : {}}
                    >
                      <Card
                        hoverable={!hasVoted}
                        onClick={() => !hasVoted && setSelectedOption(option.id)}
                        style={{
                          border: selectedOption === option.id 
                            ? '2px solid #1890ff' 
                            : '1px solid #f0f0f0',
                          background: isLeading 
                            ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                            : undefined
                        }}
                        bodyStyle={{ padding: '16px 20px' }}
                      >
                        <Row align="middle" gutter={16}>
                          <Col flex="auto">
                            <Space>
                              {isLeading && <Text>👑</Text>}
                              <Text strong style={{ fontSize: 16 }}>
                                {option.option_text}
                              </Text>
                              {option.is_user_submitted && (
                                <Tooltip title="사용자가 추가한 선택지">
                                  <UserOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                                </Tooltip>
                              )}
                            </Space>
                          </Col>
                          
                          {hasVoted && (
                            <>
                              <Col>
                                <Text strong style={{ fontSize: 18 }}>
                                  {percent}%
                                </Text>
                              </Col>
                              <Col>
                                <Text type="secondary">
                                  {option.vote_count.toLocaleString()}표
                                </Text>
                              </Col>
                            </>
                          )}
                          
                          {/* 본인이 추가한 선택지이고 투표가 없으면 삭제 버튼 표시 */}
                          {option.is_user_submitted && 
                           option.created_by === currentUser?.id && 
                           option.vote_count === 0 && (
                            <Col>
                              <Popconfirm
                                title="선택지 삭제"
                                description="이 선택지를 삭제하시겠습니까?"
                                onConfirm={() => handleDeleteOption(option.id)}
                                okText="삭제"
                                cancelText="취소"
                                okButtonProps={{ danger: true }}
                              >
                                <Tooltip title="선택지 삭제">
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            </Col>
                          )}
                        </Row>
                        
                        {hasVoted && (
                          <Progress 
                            percent={percent} 
                            showInfo={false}
                            strokeColor={option.color || '#1890ff'}
                            style={{ marginTop: 8 }}
                          />
                        )}
                      </Card>
                    </motion.div>
                  )
                })}
              
              {/* 로그인한 사용자에게만 선택지 추가 버튼 표시 */}
              {currentUser ? (
                <Card
                  hoverable
                  onClick={() => setShowAddOptionModal(true)}
                  style={{
                    border: '2px dashed #d9d9d9',
                    background: '#fafafa',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ padding: '16px 20px', textAlign: 'center' }}
                >
                  <Space>
                    <PlusOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ color: '#1890ff' }}>새 선택지 추가하기</Text>
                  </Space>
                </Card>
              ) : (
                <Card
                  style={{
                    border: '2px dashed #d9d9d9',
                    background: '#fafafa',
                    opacity: 0.6
                  }}
                  bodyStyle={{ padding: '16px 20px', textAlign: 'center' }}
                >
                  <Text type="secondary">로그인하면 선택지를 추가할 수 있습니다</Text>
                </Card>
              )}
            </Space>
          )}
        </div>

        {/* 투표 버튼 */}
        {!hasVoted && (
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Button
              type="primary"
              size="large"
              disabled={!selectedOption || isVoting}
              loading={isVoting}
              onClick={handleVote}
              style={{ minWidth: 200 }}
            >
              {isVoting ? '투표 중...' : '투표하기'}
            </Button>
          </div>
        )}

        <Divider />

        {/* 액션 버튼 */}
        <Row gutter={16}>
          <Col span={isOwner ? 6 : 8}>
            <Button 
              block 
              icon={<ShareAltOutlined />}
              onClick={handleShare}
            >
              공유하기
            </Button>
          </Col>
          <Col span={isOwner ? 6 : 8}>
            <Button 
              block 
              icon={<CommentOutlined />}
              onClick={() => document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              댓글 {poll.comment_count}
            </Button>
          </Col>
          <Col span={isOwner ? 6 : 8}>
            <Button 
              block 
              icon={<BarChartOutlined />}
              onClick={() => navigate(`/poll/${poll.id}/stats`)}
            >
              통계 보기
            </Button>
          </Col>
          {isOwner && (
            <>
              <Col span={6}>
                <Button 
                  block 
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/poll/${poll.id}/edit`)}
                >
                  수정
                </Button>
              </Col>
              <Col span={6}>
                <Popconfirm
                  title="투표 삭제"
                  description="정말로 이 투표를 삭제하시겠습니까?"
                  onConfirm={handleDelete}
                  okText="삭제"
                  cancelText="취소"
                  okButtonProps={{ danger: true }}
                >
                  <Button 
                    block 
                    danger
                    icon={<DeleteOutlined />}
                  >
                    삭제
                  </Button>
                </Popconfirm>
              </Col>
            </>
          )}
        </Row>
      </Card>

      {/* 공유 모달 */}
      <Modal
        title="투표 공유하기"
        open={showShareModal}
        onCancel={() => setShowShareModal(false)}
        footer={null}
        width={600}
      >
        <PollShareCard poll={poll} onClose={() => setShowShareModal(false)} />
      </Modal>

      {/* 선택지 추가 모달 */}
      <Modal
        title="새 선택지 추가"
        open={showAddOptionModal}
        onCancel={() => {
          setShowAddOptionModal(false)
          setNewOptionText('')
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setShowAddOptionModal(false)
              setNewOptionText('')
            }}
          >
            취소
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isAddingOption}
            disabled={!newOptionText.trim()}
            onClick={handleAddOption}
          >
            추가하기
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item 
            label="선택지 내용" 
            required
            help="다른 사용자들이 투표할 수 있는 새로운 선택지를 추가해보세요"
          >
            <Input
              placeholder="예: 아이유"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              onPressEnter={handleAddOption}
              maxLength={100}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 댓글 섹션 */}
      <CommentSection pollId={poll.id} pollOptions={options} />
      
      {/* 로그인 모달 */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialTab="login"
      />
    </div>
  )
}

export default PollDetailPage