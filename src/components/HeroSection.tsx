import React from 'react'
import { Typography, Button, Space, Row, Col } from 'antd'
import { TrophyOutlined, FireOutlined, TeamOutlined, RocketOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const { Title, Text, Paragraph } = Typography

const HeroContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 60px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
    border-radius: 16px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: pulse 15s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`

const HeroTitle = styled(Title)`
  color: white !important;
  font-size: 48px !important;
  font-weight: 700 !important;
  margin-bottom: 16px !important;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  
  @media (max-width: 768px) {
    font-size: 32px !important;
  }
`

const HeroSubtitle = styled(Paragraph)`
  color: rgba(255,255,255,0.95);
  font-size: 20px;
  margin-bottom: 32px !important;
  max-width: 600px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const StatCard = styled(motion.div)`
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255,255,255,0.25);
    transform: translateY(-5px);
  }
`

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
`

const StatLabel = styled.div`
  color: rgba(255,255,255,0.9);
  font-size: 14px;
`

const CTAButton = styled(Button)`
  height: 56px;
  padding: 0 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 28px;
  border: none;
  background: white;
  color: #667eea;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0,0,0,0.3);
    background: white !important;
    color: #764ba2 !important;
  }
  
  @media (max-width: 768px) {
    height: 48px;
    font-size: 16px;
    padding: 0 24px;
  }
`

const SecondaryButton = styled(Button)`
  height: 56px;
  padding: 0 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 28px;
  background: transparent;
  color: white;
  border: 2px solid rgba(255,255,255,0.5);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255,255,255,0.1) !important;
    border-color: white !important;
    color: white !important;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    height: 48px;
    font-size: 16px;
    padding: 0 24px;
  }
`

const FloatingIcon = styled(motion.div)`
  position: absolute;
  opacity: 0.1;
  color: white;
  font-size: 80px;
  
  @media (max-width: 768px) {
    display: none;
  }
`

interface HeroSectionProps {
  showStats?: boolean
}

const HeroSection: React.FC<HeroSectionProps> = ({ showStats = true }) => {
  const navigate = useNavigate()

  const stats = [
    { number: '10K+', label: '활성 투표', icon: <FireOutlined /> },
    { number: '50K+', label: '일일 참여자', icon: <TeamOutlined /> },
    { number: '1M+', label: '총 투표수', icon: <TrophyOutlined /> }
  ]

  return (
    <HeroContainer>
      <FloatingIcon
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%', left: '5%' }}
      >
        <TrophyOutlined />
      </FloatingIcon>
      
      <FloatingIcon
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '10%', right: '5%' }}
      >
        <FireOutlined />
      </FloatingIcon>

      <HeroContent>
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={showStats ? 14 : 24}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <HeroTitle level={1}>
                당신의 선택이 <br />
                순위를 결정합니다 🏆
              </HeroTitle>
              <HeroSubtitle>
                THEGOAT123에서 다양한 주제의 투표에 참여하고,
                실시간으로 변화하는 순위를 확인하세요.
                당신의 한 표가 결과를 바꿀 수 있습니다!
              </HeroSubtitle>
              
              <Space size="middle" wrap>
                <CTAButton 
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/create-poll')}
                >
                  투표 만들기
                </CTAButton>
                <SecondaryButton 
                  onClick={() => document.getElementById('polls-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  인기 투표 보기
                </SecondaryButton>
              </Space>
            </motion.div>
          </Col>
          
          {showStats && (
            <Col xs={24} lg={10}>
              <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                  <Col xs={8} key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.5,
                        delay: 0.2 + index * 0.1
                      }}
                    >
                      <StatCard
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 8, color: 'white' }}>
                          {stat.icon}
                        </div>
                        <StatNumber>{stat.number}</StatNumber>
                        <StatLabel>{stat.label}</StatLabel>
                      </StatCard>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Col>
          )}
        </Row>
      </HeroContent>
    </HeroContainer>
  )
}

export default HeroSection