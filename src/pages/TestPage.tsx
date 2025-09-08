import React from 'react'
import { Card, Typography, Button, Space } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const TestPage: React.FC = () => {
  const navigate = useNavigate()
  
  return (
    <div style={{ padding: 20 }}>
      <Card>
        <Title level={2}>테스트 페이지</Title>
        <Text>앱이 정상적으로 로드되었습니다!</Text>
        <br /><br />
        <Space>
          <Button type="primary" onClick={() => navigate('/')}>
            홈으로 가기
          </Button>
          <Button onClick={() => navigate('/create-poll')}>
            투표 만들기
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default TestPage