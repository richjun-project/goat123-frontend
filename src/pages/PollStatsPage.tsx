import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Typography, Button, Divider, Progress, Table, Tag, Space, Spin, Empty } from 'antd'
import { 
  ArrowLeftOutlined, 
  TeamOutlined, 
  EyeOutlined, 
  CommentOutlined, 
  ShareAltOutlined, 
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import { usePoll } from '../hooks/usePolls'
import { Pie, Line, Bar } from '@ant-design/charts'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface VoteTimeData {
  hour: string
  votes: number
}

interface OptionStats {
  option_text: string
  vote_count: number
  percentage: number
  color: string
  trend: 'up' | 'down' | 'stable'
}

const PollStatsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { poll, loading: pollLoading } = usePoll(id!)
  const [loading, setLoading] = useState(false)
  const [voteTimeData, setVoteTimeData] = useState<VoteTimeData[]>([])
  const [optionStats, setOptionStats] = useState<OptionStats[]>([])
  const [demographics, setDemographics] = useState<any>({})
  const [recentVotes, setRecentVotes] = useState<any[]>([])

  useEffect(() => {
    if (poll) {
      fetchStatistics()
    }
  }, [poll])

  const fetchStatistics = async () => {
    if (!poll) return

    setLoading(true)
    try {
      // 시간대별 투표 데이터
      const { data: votesData } = await supabase
        .from('poll_votes')
        .select('created_at, option_id')
        .eq('poll_id', poll.id)
        .order('created_at', { ascending: true })

      // 시간대별 그룹화
      const timeGroups: { [key: string]: number } = {}
      votesData?.forEach(vote => {
        const hour = dayjs(vote.created_at).format('HH:00')
        timeGroups[hour] = (timeGroups[hour] || 0) + 1
      })

      const timeData = Object.entries(timeGroups).map(([hour, votes]) => ({
        hour,
        votes
      })).sort((a, b) => a.hour.localeCompare(b.hour))

      setVoteTimeData(timeData)

      // 옵션별 통계
      const stats = poll.options?.map(option => {
        const percentage = poll.total_votes > 0 
          ? Math.round((option.vote_count / poll.total_votes) * 100)
          : 0
        
        // 트렌드 계산 (실제로는 시계열 데이터 분석 필요)
        const avgVotes = poll.options && poll.options.length > 0 ? poll.total_votes / poll.options.length : 0
        const trend: 'up' | 'down' | 'stable' = option.vote_count > avgVotes
          ? 'up' 
          : option.vote_count < avgVotes
            ? 'down'
            : 'stable'

        return {
          option_text: option.option_text,
          vote_count: option.vote_count,
          percentage,
          color: option.color || '#1890ff',
          trend
        }
      }) || []

      setOptionStats(stats as OptionStats[])

      // 최근 투표 기록
      const { data: recent } = await supabase
        .from('poll_votes')
        .select(`
          created_at,
          option:poll_options(option_text, color),
          user:users(name, avatar_url)
        `)
        .eq('poll_id', poll.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentVotes(recent || [])

    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (pollLoading || !poll) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  // 파이 차트 데이터
  const pieData = optionStats.map(stat => ({
    type: stat.option_text,
    value: stat.vote_count,
    percentage: stat.percentage
  }))

  // 라인 차트 설정
  const lineConfig = {
    data: voteTimeData,
    xField: 'hour',
    yField: 'votes',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'circle'
    },
    label: {
      style: {
        fill: '#aaa'
      }
    }
  }

  // 파이 차트 설정
  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}'
    },
    interactions: [
      { type: 'pie-legend-active' },
      { type: 'element-active' }
    ]
  }

  const columns = [
    {
      title: '시간',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('HH:mm:ss')
    },
    {
      title: '사용자',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => user?.name || '익명'
    },
    {
      title: '선택',
      dataIndex: 'option',
      key: 'option',
      render: (option: any) => (
        <Tag color={option?.color}>
          {option?.option_text}
        </Tag>
      )
    }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(`/poll/${poll.id}`)}
        style={{ marginBottom: 20 }}
      >
        투표로 돌아가기
      </Button>

      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>
          <BarChartOutlined /> {poll.title} - 통계 분석
        </Title>

        {/* 기본 통계 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={12} sm={6}>
            <Statistic 
              title="총 참여자" 
              value={poll.total_votes} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="조회수" 
              value={poll.view_count} 
              prefix={<EyeOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="댓글" 
              value={poll.comment_count} 
              prefix={<CommentOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="공유" 
              value={poll.share_count} 
              prefix={<ShareAltOutlined />}
            />
          </Col>
        </Row>

        <Divider />

        {/* 옵션별 결과 */}
        <Title level={4} style={{ marginBottom: 16 }}>
          <TrophyOutlined /> 투표 결과 분석
        </Title>
        <Row gutter={[16, 32]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <Card title="옵션별 득표율" size="small">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {optionStats.map((stat, index) => (
                  <div key={index}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space>
                          {index === 0 && <Text>👑</Text>}
                          <Text strong>{stat.option_text}</Text>
                          {stat.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
                          {stat.trend === 'down' && <FallOutlined style={{ color: '#f5222d' }} />}
                        </Space>
                      </Col>
                      <Col>
                        <Text strong>{stat.percentage}%</Text>
                        <Text type="secondary"> ({stat.vote_count}표)</Text>
                      </Col>
                    </Row>
                    <Progress 
                      percent={stat.percentage} 
                      strokeColor={stat.color}
                      showInfo={false}
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="득표 비율 차트" size="small">
              {pieData.length > 0 ? (
                <div style={{ height: 300 }}>
                  <Pie {...pieConfig} />
                </div>
              ) : (
                <Empty description="데이터 없음" />
              )}
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* 시간대별 투표 추이 */}
        <Title level={4} style={{ marginBottom: 16 }}>
          <ClockCircleOutlined /> 시간대별 투표 추이
        </Title>
        <Card style={{ marginBottom: 32 }}>
          {voteTimeData.length > 0 ? (
            <div style={{ height: 300 }}>
              <Line {...lineConfig} />
            </div>
          ) : (
            <Empty description="아직 투표 데이터가 없습니다" />
          )}
        </Card>

        <Divider />

        {/* 최근 투표 기록 */}
        <Title level={4} style={{ marginBottom: 16 }}>
          최근 투표 활동
        </Title>
        <Table 
          columns={columns}
          dataSource={recentVotes}
          pagination={{ pageSize: 10 }}
          loading={loading}
          size="small"
          rowKey={(record, index) => index?.toString() || ''}
        />

        {/* 투표 정보 */}
        <Card size="small" style={{ marginTop: 32, background: '#fafafa' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">생성일</Text>
              <br />
              <Text>{dayjs(poll.created_at).format('YYYY-MM-DD HH:mm')}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">카테고리</Text>
              <br />
              <Tag>{poll.category}</Tag>
            </Col>
          </Row>
        </Card>
      </Card>
    </div>
  )
}

export default PollStatsPage