import React from 'react'
import { Row, Col, Card, Skeleton, Empty, Carousel } from 'antd'
import { FireOutlined } from '@ant-design/icons'
import { useHotPolls } from '../hooks/usePolls'
import ModernPollCard from './ModernPollCard'

const HotPolls: React.FC = React.memo(() => {
  const { polls, loading, error } = useHotPolls()

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    )
  }

  if (error || polls.length === 0) {
    return (
      <Card>
        <Empty 
          description="HOT 투표를 불러올 수 없습니다" 
        />
      </Card>
    )
  }

  // 1개만 있으면 단독 표시, 여러 개면 그리드로 표시
  if (polls.length === 1) {
    return <ModernPollCard poll={polls[0]} />
  }

  return (
    <Row gutter={[24, 24]}>
      {polls.slice(0, 4).map((poll, index) => (
        <Col xs={24} sm={12} md={12} lg={12} xl={12} key={poll.id}>
          <div style={{ width: '100%', height: '100%' }}>
            <ModernPollCard poll={poll} index={index} />
          </div>
        </Col>
      ))}
    </Row>
  )
})

HotPolls.displayName = 'HotPolls'

export default HotPolls