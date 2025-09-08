import React from 'react'
import { Row, Col, Card, Skeleton, Empty, Typography } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import { usePolls } from '../hooks/usePolls'
import PollCard from './PollCard'

const { Text } = Typography

interface PollListProps {
  category: string
  pollType?: 'versus' | 'multiple'
}

const PollList: React.FC<PollListProps> = React.memo(({ category, pollType }) => {
  const { polls, loading, error } = usePolls(category, pollType)

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Col xs={24} sm={12} lg={8} key={i}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  if (error) {
    return (
      <Card>
        <Empty 
          description={
            <div>
              <Text>투표를 불러올 수 없습니다</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {error.message}
              </Text>
            </div>
          }
        />
      </Card>
    )
  }

  if (polls.length === 0) {
    return (
      <Card>
        <Empty 
          image={<TrophyOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          description={
            <div>
              <Text>아직 진행중인 투표가 없습니다</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                곧 새로운 투표가 시작됩니다!
              </Text>
            </div>
          }
        />
      </Card>
    )
  }

  return (
    <Row gutter={[16, 16]}>
      {polls.map((poll, index) => (
        <Col xs={24} sm={12} lg={8} key={poll.id} style={{ display: 'flex' }}>
          <PollCard poll={poll} index={index} />
        </Col>
      ))}
    </Row>
  )
})

PollList.displayName = 'PollList'

export default PollList