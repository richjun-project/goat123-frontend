import React, { useState, useEffect } from 'react'
import { Card, Tabs, Avatar, Typography, Button, Space, Row, Col, Empty, Skeleton, Statistic, Upload, Form, Input, Modal, message, List, Popconfirm } from 'antd'
import { UserOutlined, EditOutlined, PlusOutlined, FireOutlined, CommentOutlined, ShareAltOutlined, CameraOutlined, LogoutOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ImprovedAuthModal from '../components/ImprovedAuthModal'
import PollCard from '../components/PollCard'
import { supabase } from '../lib/supabase'
import type { Poll } from '../types'
import { bookmarkService } from '../services/bookmarks'
import { pollService } from '../services/polls'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

const MyPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [myPolls, setMyPolls] = useState<Poll[]>([])
  const [votedPolls, setVotedPolls] = useState<Poll[]>([])
  const [myComments, setMyComments] = useState<any[]>([])
  const [bookmarkedPolls, setBookmarkedPolls] = useState<Poll[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [profileForm] = Form.useForm()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    totalComments: 0,
    totalViews: 0
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // 사용자 프로필 가져오기
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
        profileForm.setFieldsValue({
          name: profile.name,
          email: profile.email
        })
      }

      // 내가 만든 투표
      const { data: created } = await supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      setMyPolls(created || [])

      // 내가 참여한 투표
      const { data: voted } = await supabase
        .from('poll_votes')
        .select(`
          poll:polls(
            *,
            options:poll_options(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const uniquePolls = Array.from(
        new Map(
          (voted || []).map((v: any) => [v.poll.id, v.poll])
        ).values()
      ) as Poll[]
      setVotedPolls(uniquePolls)

      // 통계
      const totalViews = (created || []).reduce((sum, p) => sum + (p.view_count || 0), 0)
      const totalVotes = (created || []).reduce((sum, p) => sum + (p.total_votes || 0), 0)
      
      // 내가 작성한 댓글 가져오기
      let totalCommentsWritten = 0
      if (user) {
        try {
          const { data: comments, error } = await supabase
            .from('poll_comments')
            .select(`
              *,
              poll:polls(id, title, category),
              option:poll_options(option_text, color)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          
          if (error) {
            console.error('댓글 조회 에러:', error)
            setMyComments([])
          } else {
            setMyComments(comments || [])
            totalCommentsWritten = comments?.length || 0
          }
        } catch (error) {
          console.error('댓글 가져오기 실패:', error)
          setMyComments([])
        }
      }

      // 북마크한 투표 가져오기
      try {
        const bookmarked = await bookmarkService.getUserBookmarks(user.id)
        setBookmarkedPolls(bookmarked)
      } catch (error) {
        console.error('북마크 조회 에러:', error)
        setBookmarkedPolls([])
      }

      setStats({
        totalPolls: created?.length || 0,
        totalVotes: totalVotes,
        totalComments: totalCommentsWritten,
        totalViews: totalViews
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (values: any) => {
    try {
      await updateProfile({
        name: values.name
      })
      setEditModalVisible(false)
      fetchUserData()
    } catch (error) {
      message.error('프로필 업데이트에 실패했습니다')
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    try {
      // Supabase Storage에 업로드
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // 공개 URL 가져오기
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // 프로필 업데이트
      await updateProfile({
        avatar_url: data.publicUrl
      })

      fetchUserData()
      message.success('프로필 사진이 업데이트되었습니다')
    } catch (error) {
      message.error('프로필 사진 업로드에 실패했습니다')
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleDeletePoll = async (pollId: string) => {
    if (!user) {
      message.error('로그인이 필요합니다')
      return
    }
    
    try {
      // 소유권 확인
      const isOwner = await pollService.checkPollOwner(pollId, user.id)
      if (!isOwner) {
        message.error('자신의 투표만 삭제할 수 있습니다')
        return
      }
      
      // 삭제 확인
      Modal.confirm({
        title: '투표 삭제',
        content: '정말로 이 투표를 삭제하시겠습니까? 모든 투표 데이터와 댓글이 삭제됩니다.',
        okText: '삭제',
        okType: 'danger',
        cancelText: '취소',
        onOk: async () => {
          try {
            await pollService.deletePoll(pollId)
            message.success('투표가 삭제되었습니다')
            
            // 삭제된 투표를 목록에서 제거
            setMyPolls(prev => prev.filter(p => p.id !== pollId))
            
            // 통계 업데이트
            setStats(prev => ({
              ...prev,
              totalPolls: Math.max(0, prev.totalPolls - 1)
            }))
          } catch (error) {
            console.error('투표 삭제 에러:', error)
            message.error('투표 삭제에 실패했습니다')
          }
        }
      })
    } catch (error) {
      console.error('투표 삭제 에러:', error)
      message.error('투표 삭제에 실패했습니다')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      message.error('로그인이 필요합니다')
      return
    }
    
    try {
      // 실제 DELETE 사용 (RLS 정책이 적용됨)
      const { error } = await supabase
        .from('poll_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('댓글 삭제 에러:', error)
        // DELETE 실패 시 소프트 삭제 시도
        const { error: updateError } = await supabase
          .from('poll_comments')
          .update({ 
            content: '[삭제된 댓글입니다]',
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', commentId)
          .eq('user_id', user.id)
        
        if (updateError) {
          throw updateError
        }
        message.info('댓글이 삭제 처리되었습니다')
      } else {
        message.success('댓글이 삭제되었습니다')
      }
      
      // 삭제된 댓글을 목록에서 즉시 제거
      setMyComments(prev => prev.filter(c => c.id !== commentId))
      
      // 통계 업데이트
      setStats(prev => ({
        ...prev,
        totalComments: Math.max(0, prev.totalComments - 1)
      }))
    } catch (error: any) {
      console.error('댓글 삭제 에러:', error)
      message.error('댓글 삭제에 실패했습니다')
    }
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <Card>
          <Empty 
            description="로그인이 필요합니다"
            image={<UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          >
            <Button type="primary" size="large" onClick={() => setShowAuthModal(true)}>
              로그인하기
            </Button>
          </Empty>
        </Card>
        <ImprovedAuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {/* 프로필 헤더 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handleAvatarUpload(file)
                return false
              }}
              accept="image/*"
            >
              <Avatar 
                size={120} 
                src={userProfile?.avatar_url}
                icon={!userProfile?.avatar_url && <UserOutlined />}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {!userProfile?.avatar_url && userProfile?.name?.[0]}
              </Avatar>
              <div style={{ marginTop: 8 }}>
                <Button icon={<CameraOutlined />} size="small">
                  사진 변경
                </Button>
              </div>
            </Upload>
          </Col>
          
          <Col xs={24} sm={18}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  {userProfile?.name || '이름 없음'}
                </Title>
                <Text type="secondary">{userProfile?.email}</Text>
              </div>
              
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic title="만든 투표" value={stats.totalPolls} />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic title="받은 투표" value={stats.totalVotes} />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic title="작성 댓글" value={stats.totalComments} />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic title="총 조회수" value={stats.totalViews} />
                </Col>
              </Row>
              
              <Space>
                <Button icon={<EditOutlined />} onClick={() => setEditModalVisible(true)}>
                  프로필 수정
                </Button>
                <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                  로그아웃
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 탭 콘텐츠 */}
      <Card>
        <Tabs defaultActiveKey="created">
          <TabPane tab={`내가 만든 투표 (${myPolls.length})`} key="created">
            {loading ? (
              <Row gutter={[16, 16]}>
                {[1, 2, 3].map(i => (
                  <Col xs={24} sm={12} lg={8} key={i}>
                    <Card>
                      <Skeleton active />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : myPolls.length > 0 ? (
              <Row gutter={[16, 16]}>
                {myPolls.map((poll, index) => (
                  <Col xs={24} sm={12} lg={8} key={poll.id}>
                    <PollCard poll={poll} index={index} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="아직 만든 투표가 없습니다">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/create-poll')}
                >
                  첫 투표 만들기
                </Button>
              </Empty>
            )}
          </TabPane>
          
          <TabPane tab={`참여한 투표 (${votedPolls.length})`} key="voted">
            {loading ? (
              <Row gutter={[16, 16]}>
                {[1, 2, 3].map(i => (
                  <Col xs={24} sm={12} lg={8} key={i}>
                    <Card>
                      <Skeleton active />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : votedPolls.length > 0 ? (
              <Row gutter={[16, 16]}>
                {votedPolls.map((poll, index) => (
                  <Col xs={24} sm={12} lg={8} key={poll.id}>
                    <PollCard poll={poll} index={index} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="아직 참여한 투표가 없습니다">
                <Button 
                  type="primary"
                  onClick={() => navigate('/')}
                >
                  투표 둘러보기
                </Button>
              </Empty>
            )}
          </TabPane>
          
          <TabPane tab={`작성한 댓글 (${myComments.length})`} key="comments">
            {loading ? (
              <List
                dataSource={[1, 2, 3]}
                renderItem={() => (
                  <List.Item>
                    <Skeleton active />
                  </List.Item>
                )}
              />
            ) : myComments.length > 0 ? (
              <List
                dataSource={myComments}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false
                }}
                renderItem={(comment: any) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => navigate(`/poll/${comment.poll_id}`)}
                      >
                        투표 보기
                      </Button>,
                      <Popconfirm
                        title="댓글을 삭제하시겠습니까?"
                        onConfirm={() => handleDeleteComment(comment.id)}
                        okText="삭제"
                        cancelText="취소"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          삭제
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{comment.poll?.title || '제목 없음'}</Text>
                          {comment.option && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                backgroundColor: comment.option.color || '#f0f0f0',
                                color: '#fff',
                                fontSize: 12
                              }}
                            >
                              {comment.option.option_text}
                            </span>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                          <Paragraph style={{ marginBottom: 4 }}>
                            {comment.content}
                          </Paragraph>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(comment.created_at).fromNow()} • {comment.poll?.category || '분류 없음'}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="아직 작성한 댓글이 없습니다">
                <Button 
                  type="primary"
                  onClick={() => navigate('/')}
                >
                  투표 참여하기
                </Button>
              </Empty>
            )}
          </TabPane>
          
          <TabPane tab={`북마크 (${bookmarkedPolls.length})`} key="bookmarks">
            {loading ? (
              <Row gutter={[16, 16]}>
                {[1, 2, 3].map(i => (
                  <Col xs={24} sm={12} lg={8} key={i}>
                    <Card>
                      <Skeleton active />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : bookmarkedPolls.length > 0 ? (
              <Row gutter={[16, 16]}>
                {bookmarkedPolls.map((poll, index) => (
                  <Col xs={24} sm={12} lg={8} key={poll.id}>
                    <PollCard poll={poll} index={index} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="북마크한 투표가 없습니다">
                <Button 
                  type="primary"
                  onClick={() => navigate('/')}
                >
                  투표 둘러보기
                </Button>
              </Empty>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 프로필 수정 모달 */}
      <Modal
        title="프로필 수정"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
        >
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력해주세요' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="이메일"
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              저장
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyPage