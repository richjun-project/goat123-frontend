import React, { useState, useCallback } from 'react'
import { Space, Typography, Button, Row, Col, Tabs } from 'antd'
import { PlusOutlined, FireOutlined, CrownOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import HotPolls from '../components/HotPolls'
import TopRanking from '../components/TopRanking'
import PollList from '../components/PollList'
import CategoryFilter from '../components/CategoryFilter'
import HeroSection from '../components/HeroSection'

const { Title } = Typography

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const handleCreatePoll = useCallback(() => {
    navigate('/create-poll')
  }, [navigate])
  
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <HeroSection />
      
      <div>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              🔥 실시간 HOT 투표
            </Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreatePoll}
              style={{ display: 'none' }}
            >
              새 투표 만들기
            </Button>
          </Col>
        </Row>
        <HotPolls />
      </div>

      <div>
        <Title level={2} style={{ marginBottom: 24 }}>
          🏆 최다 참여 TOP 3
        </Title>
        <TopRanking />
      </div>

      <div id="polls-section">
        <Title level={2} style={{ marginBottom: 16 }}>
          🗳️ 진행중인 투표
        </Title>
        
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: (
                <span>
                  <AppstoreOutlined />
                  모든 투표
                </span>
              ),
              children: (
                <>
                  <CategoryFilter 
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                  <PollList category={selectedCategory} />
                </>
              )
            },
            {
              key: 'versus',
              label: (
                <span>
                  ⚔️ VS 투표
                </span>
              ),
              children: (
                <>
                  <CategoryFilter 
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                  <PollList category={selectedCategory} pollType="versus" />
                </>
              )
            },
            {
              key: 'multiple',
              label: (
                <span>
                  🎯 다중 선택
                </span>
              ),
              children: (
                <>
                  <CategoryFilter 
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                  <PollList category={selectedCategory} pollType="multiple" />
                </>
              )
            }
          ]}
        />
      </div>
    </Space>
  )
}

export default React.memo(HomePage)