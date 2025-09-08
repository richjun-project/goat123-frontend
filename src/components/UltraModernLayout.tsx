import React, { useState } from 'react'
import { Layout, Typography, Space } from 'antd'
import { Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ModernHeader from './ModernHeader'
import MobileBottomNav from './MobileBottomNav'
import ImprovedAuthModal from './ImprovedAuthModal'
import styled from 'styled-components'

const { Content, Footer } = Layout
const { Text } = Typography

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #fafafa;
  
  &.dark {
    background: var(--dark-background);
  }
`

const StyledContent = styled(Content)`
  padding-top: 80px;
  min-height: calc(100vh - 180px);
  
  @media (max-width: 768px) {
    padding-bottom: 72px;
    min-height: calc(100vh - 80px);
  }
`

const StyledFooter = styled(Footer)`
  text-align: center;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 24px 50px;
  
  @media (max-width: 768px) {
    display: none;
  }
  
  &.dark {
    background: var(--dark-surface);
    border-top-color: var(--dark-border);
    
    .ant-typography {
      color: #999;
    }
  }
`

const UltraModernLayout: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <StyledLayout>
      <ModernHeader showAuthModal={() => setShowAuthModal(true)} />
      
      <StyledContent>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </StyledContent>
      
      <StyledFooter>
        <Space direction="vertical" size={0}>
          <Text type="secondary">
            THEGOAT123 - Greatest Of All Time 투표 배틀
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © 2025 THEGOAT123. 모든 투표는 익명으로 진행됩니다.
          </Text>
        </Space>
      </StyledFooter>
      
      <MobileBottomNav />
      
      <ImprovedAuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </StyledLayout>
  )
}

export default UltraModernLayout