import React, { useMemo } from 'react'
import { Row, Col, Card, Typography, Space, Progress, Skeleton, Empty, Tag } from 'antd'
import { TeamOutlined, TrophyOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTopPolls } from '../hooks/usePolls'
import { pollService } from '../services/polls'
import type { Poll, Battle } from '../types'

const { Title, Text } = Typography

const rankConfig = [
  { icon: '🥇', color: '#faad14', iconColor: '#faad14', rank: '1위' },
  { icon: '🥈', color: '#d9d9d9', iconColor: '#8c8c8c', rank: '2위' },
  { icon: '🥉', color: '#d48806', iconColor: '#d48806', rank: '3위' },
]

// Poll을 Battle 형식으로 변환
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

const TopRanking: React.FC = React.memo(() => {
  const navigate = useNavigate()
  const { polls, loading, error } = useTopPolls()
  
  // 모든 투표를 Battle 형식으로 변환 (다중 선택도 포함)
  const battles = polls.map(p => {
    if (p.poll_type === 'versus') {
      return convertPollToBattle(p)
    } else {
      // 다중 선택 투표의 경우 상위 2개 옵션을 VS처럼 표시
      const sortedOptions = (p.options || []).sort((a, b) => b.vote_count - a.vote_count)
      const optionA = sortedOptions[0]
      const optionB = sortedOptions[1] || sortedOptions[0] // 옵션이 1개만 있을 경우 대비
      
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        option_a: optionA?.option_text || '',
        option_b: optionB?.option_text || '',
        option_a_image: optionA?.option_image,
        option_b_image: optionB?.option_image,
        votes_a: optionA?.vote_count || 0,
        votes_b: optionB?.vote_count || 0,
        total_votes: p.total_votes,
        status: p.status === 'active' ? 'active' : 'ended',
        is_hot: p.is_hot,
        created_at: p.created_at,
        view_count: p.view_count,
        share_count: p.share_count
      }
    }
  })

  const battleCards = useMemo(() => {
    return battles.map((battle, index) => {
      const votesA = battle.votes_a || 0
      const votesB = battle.votes_b || 0
      const percentA = battle.total_votes > 0 
        ? Math.round((votesA / battle.total_votes) * 100)
        : 50
      const percentB = battle.total_votes > 0
        ? Math.round((votesB / battle.total_votes) * 100)
        : 50
      const winner = percentA > percentB ? battle.option_a : battle.option_b
      const winnerPercent = Math.max(percentA, percentB)
      
      return (
        <Col xs={24} md={8} key={battle.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card
              hoverable
              onClick={() => navigate(`/poll/${battle.id}`)}
              style={{
                border: '1px solid #f0f0f0',
                height: '100%',
                minHeight: 380,
                position: 'relative',
                overflow: 'visible'
              }}
              bodyStyle={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '24px'
              }}
            >
              {/* 순위 뱃지 */}
              <div style={{
                position: 'absolute',
                top: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                padding: '4px 16px',
                borderRadius: 20,
                border: `2px solid ${rankConfig[index].color}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 1
              }}>
                <span style={{ fontSize: 20 }}>{rankConfig[index].icon}</span>
                <Text strong style={{ color: rankConfig[index].iconColor }}>
                  {rankConfig[index].rank}
                </Text>
              </div>

              <Space direction="vertical" size="middle" style={{ width: '100%', flex: 1, marginTop: 16 }}>
                {/* 배틀 정보 */}
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ margin: '0 0 4px 0' }}>
                    {battle.title}
                  </Title>
                  <Tag color="blue" style={{ fontSize: 11 }}>
                    {battle.category === 'food' && '🍔 음식'}
                    {battle.category === 'tech' && '📱 테크'}
                    {battle.category === 'game' && '🎮 게임'}
                    {battle.category === 'entertainment' && '🎬 엔터'}
                    {battle.category === 'sports' && '⚽ 스포츠'}
                    {battle.category === 'fashion' && '👕 패션'}
                    {battle.category === 'culture' && '🎨 문화'}
                  </Tag>
                </div>

                {/* 승자 표시 */}
                <Card
                  bordered={false}
                  style={{ 
                    background: '#fafafa',
                    borderRadius: 8,
                    textAlign: 'center'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <TrophyOutlined style={{ 
                    fontSize: 28, 
                    color: rankConfig[index].iconColor,
                    marginBottom: 8
                  }} />
                  <Title level={4} style={{ margin: '8px 0' }}>
                    {winner}
                  </Title>
                  <Space>
                    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                      {winnerPercent}%
                    </Text>
                    <Tag color="green">승리</Tag>
                  </Space>
                </Card>

                {/* 투표 현황 */}
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <Row justify="space-between" style={{ marginBottom: 4 }}>
                      <Col>
                        <Text>{battle.option_a}</Text>
                      </Col>
                      <Col>
                        <Text strong>{percentA}%</Text>
                      </Col>
                    </Row>
                    <Progress 
                      percent={percentA} 
                      showInfo={false}
                      strokeColor={percentA > percentB ? '#52c41a' : '#d9d9d9'}
                      size="small"
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {votesA.toLocaleString()}표
                    </Text>
                  </div>
                  
                  <div>
                    <Row justify="space-between" style={{ marginBottom: 4 }}>
                      <Col>
                        <Text>{battle.option_b}</Text>
                      </Col>
                      <Col>
                        <Text strong>{percentB}%</Text>
                      </Col>
                    </Row>
                    <Progress 
                      percent={percentB} 
                      showInfo={false}
                      strokeColor={percentB > percentA ? '#52c41a' : '#d9d9d9'}
                      size="small"
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {votesB.toLocaleString()}표
                    </Text>
                  </div>
                </div>

                {/* 참여자 수 */}
                <div style={{ 
                  textAlign: 'center',
                  paddingTop: 12,
                  marginTop: 'auto',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Space>
                    <TeamOutlined />
                    <Text strong>
                      총 {(battle.total_votes || 0).toLocaleString()}명 참여
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          </motion.div>
        </Col>
      )
    })
  }, [battles, navigate])

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map(i => (
          <Col xs={24} md={8} key={i}>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  if (error || battles.length === 0) {
    return (
      <Card>
        <Empty description="TOP 3 투표를 불러올 수 없습니다" />
      </Card>
    )
  }

  return (
    <Row gutter={[16, 32]} style={{ marginTop: 20 }}>
      {battleCards}
    </Row>
  )
})

TopRanking.displayName = 'TopRanking'

export default TopRanking