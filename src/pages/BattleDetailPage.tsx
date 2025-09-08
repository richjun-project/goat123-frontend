import React, { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Typography, Space, Progress, Statistic, message, Divider, Skeleton, Result } from 'antd'
import { ArrowLeftOutlined, TeamOutlined, EyeOutlined, ShareAltOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useBattle } from '../hooks/useBattles'
// import { useBattle } from '../hooks/useBattlesMock' // 임시 Mock 데이터 사용
import { battleService } from '../services/battles'
import RealtimeDashboard from '../components/RealtimeDashboard'

const { Title, Text } = Typography

const BattleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { battle, loading, error } = useBattle(id!)
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)

  // 로컬스토리지에서 투표 기록 확인
  React.useEffect(() => {
    if (!id) return
    const votedBattles = JSON.parse(localStorage.getItem('votedBattles') || '{}')
    if (votedBattles[id]) {
      setHasVoted(true)
      setSelectedOption(votedBattles[id])
    }
  }, [id])

  const handleVote = useCallback(async (option: 'A' | 'B') => {
    if (hasVoted || isVoting || !battle) return

    setIsVoting(true)
    setSelectedOption(option)
    setVoteError(null)

    try {
      await battleService.vote(battle.id, option)
      
      // 로컬스토리지에 저장
      const votedBattles = JSON.parse(localStorage.getItem('votedBattles') || '{}')
      votedBattles[battle.id] = option
      localStorage.setItem('votedBattles', JSON.stringify(votedBattles))
      
      setHasVoted(true)
      message.success('투표가 완료되었습니다!')
    } catch (err: any) {
      setVoteError(err.message || '투표 중 오류가 발생했습니다')
      setSelectedOption(null)
      message.error(err.message || '투표 중 오류가 발생했습니다')
    } finally {
      setIsVoting(false)
    }
  }, [battle, hasVoted, isVoting])

  const handleShare = useCallback(async () => {
    if (!battle) return
    
    try {
      await navigator.share({
        title: battle.title,
        text: `THEGOAT123에서 투표하세요! ${battle.option_a} vs ${battle.option_b}`,
        url: window.location.href
      })
      await battleService.incrementShareCount(battle.id)
    } catch (err) {
      // 공유 실패 시 URL 복사
      navigator.clipboard.writeText(window.location.href)
      message.success('링크가 복사되었습니다!')
    }
  }, [battle])

  const { percentA, percentB } = useMemo(() => {
    if (!battle || battle.total_votes === 0) {
      return { percentA: 50, percentB: 50 }
    }
    const pA = Math.round((battle.votes_a / battle.total_votes) * 100)
    const pB = Math.round((battle.votes_b / battle.total_votes) * 100)
    return { percentA: pA, percentB: pB }
  }, [battle])

  if (loading) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} type="text">
          뒤로가기
        </Button>
        <Card>
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      </Space>
    )
  }

  if (error || !battle) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} type="text">
          뒤로가기
        </Button>
        <Card>
          <Result
            status="404"
            title="배틀을 찾을 수 없습니다"
            subTitle={error?.message || "요청하신 배틀이 존재하지 않거나 삭제되었습니다."}
            extra={<Button type="primary" onClick={() => navigate('/')}>홈으로 돌아가기</Button>}
          />
        </Card>
      </Space>
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/')}
        type="text"
      >
        뒤로가기
      </Button>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>{battle.title}</Title>
            <Space size="large" wrap>
              <Statistic
                value={battle.view_count}
                prefix={<EyeOutlined />}
                suffix="조회"
              />
              <Statistic
                value={battle.share_count}
                prefix={<ShareAltOutlined />}
                suffix="공유"
              />
              <Statistic
                value={battle.total_votes}
                prefix={<TeamOutlined />}
                suffix="참여"
              />
            </Space>
          </div>

          <Divider />

          <Row gutter={[32, 32]}>
            <Col xs={24} md={11}>
              <motion.div
                whileHover={!hasVoted && !isVoting ? { scale: 1.02 } : {}}
                whileTap={!hasVoted && !isVoting ? { scale: 0.98 } : {}}
              >
                <Card
                  hoverable={!hasVoted && !isVoting}
                  onClick={() => !hasVoted && !isVoting && handleVote('A')}
                  style={{
                    border: selectedOption === 'A' ? '3px solid #52c41a' : '1px solid #d9d9d9',
                    position: 'relative',
                    cursor: hasVoted || isVoting ? 'default' : 'pointer',
                    opacity: isVoting && selectedOption !== 'A' ? 0.5 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {selectedOption === 'A' && hasVoted && (
                    <CheckCircleOutlined 
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 24,
                        color: '#52c41a',
                        zIndex: 1
                      }}
                    />
                  )}
                  {isVoting && selectedOption === 'A' && (
                    <LoadingOutlined 
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 24,
                        color: '#1890ff',
                        zIndex: 1
                      }}
                    />
                  )}
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {battle.option_a_image ? (
                      <img 
                        src={battle.option_a_image}
                        alt={battle.option_a}
                        style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: 200, 
                        background: '#f0f2f5',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Title level={3} style={{ color: '#595959' }}>{battle.option_a}</Title>
                      </div>
                    )}
                    <Title level={3} style={{ textAlign: 'center' }}>
                      {battle.option_a}
                    </Title>
                    {hasVoted && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Title level={1} style={{ textAlign: 'center', margin: 0 }}>
                            {percentA}%
                          </Title>
                          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                            {battle.votes_a.toLocaleString()}표
                          </Text>
                        </motion.div>
                      </AnimatePresence>
                    )}
                    {!hasVoted && !isVoting && (
                      <Button 
                        type="primary" 
                        size="large" 
                        block
                        style={{ height: 48 }}
                      >
                        이거다!
                      </Button>
                    )}
                  </Space>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} md={2} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Title level={1} type="secondary">VS</Title>
            </Col>

            <Col xs={24} md={11}>
              <motion.div
                whileHover={!hasVoted && !isVoting ? { scale: 1.02 } : {}}
                whileTap={!hasVoted && !isVoting ? { scale: 0.98 } : {}}
              >
                <Card
                  hoverable={!hasVoted && !isVoting}
                  onClick={() => !hasVoted && !isVoting && handleVote('B')}
                  style={{
                    border: selectedOption === 'B' ? '3px solid #52c41a' : '1px solid #d9d9d9',
                    position: 'relative',
                    cursor: hasVoted || isVoting ? 'default' : 'pointer',
                    opacity: isVoting && selectedOption !== 'B' ? 0.5 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {selectedOption === 'B' && hasVoted && (
                    <CheckCircleOutlined 
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 24,
                        color: '#52c41a',
                        zIndex: 1
                      }}
                    />
                  )}
                  {isVoting && selectedOption === 'B' && (
                    <LoadingOutlined 
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 24,
                        color: '#1890ff',
                        zIndex: 1
                      }}
                    />
                  )}
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {battle.option_b_image ? (
                      <img 
                        src={battle.option_b_image}
                        alt={battle.option_b}
                        style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: 200, 
                        background: '#f0f2f5',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Title level={3} style={{ color: '#595959' }}>{battle.option_b}</Title>
                      </div>
                    )}
                    <Title level={3} style={{ textAlign: 'center' }}>
                      {battle.option_b}
                    </Title>
                    {hasVoted && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Title level={1} style={{ textAlign: 'center', margin: 0 }}>
                            {percentB}%
                          </Title>
                          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                            {battle.votes_b.toLocaleString()}표
                          </Text>
                        </motion.div>
                      </AnimatePresence>
                    )}
                    {!hasVoted && !isVoting && (
                      <Button 
                        type="primary" 
                        size="large" 
                        block
                        style={{ height: 48 }}
                      >
                        이거다!
                      </Button>
                    )}
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {voteError && (
            <Card style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
              <Text type="danger">{voteError}</Text>
            </Card>
          )}

          {hasVoted && (
            <>
              <div>
                <Text type="secondary">전체 투표 현황</Text>
                <Progress 
                  percent={100}
                  success={{ percent: (percentB / 100) * 100 }}
                  format={() => (
                    <Space>
                      <Text>{battle.option_a} {percentA}%</Text>
                      <Text>|</Text>
                      <Text>{battle.option_b} {percentB}%</Text>
                    </Space>
                  )}
                  strokeColor={percentA > percentB ? '#52c41a' : '#ff4d4f'}
                  trailColor={percentB > percentA ? '#52c41a' : '#ff4d4f'}
                />
              </div>

              <Button 
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                block
                size="large"
              >
                친구에게 공유하기
              </Button>

              <Divider />

              <RealtimeDashboard battle={battle} />
            </>
          )}
        </Space>
      </Card>
    </Space>
  )
}

export default React.memo(BattleDetailPage)