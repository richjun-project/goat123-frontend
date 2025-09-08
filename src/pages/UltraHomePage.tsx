import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Typography, Row, Col } from 'antd'
import { FireOutlined, TrophyOutlined, StarOutlined } from '@ant-design/icons'
import UltraHeroSection from '../components/UltraHeroSection'
import UltraModernPollCard from '../components/UltraModernPollCard'
import CategoryFilter from '../components/CategoryFilter'
// import RealtimeComments from '../components/RealtimeComments' // MVP: 제거
// import NeckAndNeckPolls from '../components/NeckAndNeckPolls' // MVP: 제거
import { useHotPolls, usePolls } from '../hooks/usePolls'
import styled from 'styled-components'

const { Title } = Typography

// Styled Components
const PageWrapper = styled.div`
  background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  min-height: 100vh;
  
  .dark & {
    background: linear-gradient(180deg, var(--dark-background) 0%, var(--dark-surface) 100%);
  }
`

const SectionWrapper = styled.section`
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`

const SectionHeader = styled.div`
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const SectionTitle = styled(motion.h2)`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  margin: 0 0 1rem 0;
  font-family: var(--font-display);
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  
  .icon {
    font-size: 0.9em;
    -webkit-text-fill-color: initial;
    color: #8B5CF6;
  }
`

const SectionSubtitle = styled(motion.p)`
  font-size: 1.125rem;
  color: #666;
  margin: 0;
  
  .dark & {
    color: #999;
  }
`

const BentoGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`

const FloatingBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  
  .dark & {
    background: rgba(26, 26, 26, 0.5);
    border-color: rgba(255, 255, 255, 0.06);
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #666;
    
    .dark & {
      color: #999;
    }
  }
`

const UltraHomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { polls: hotPolls, loading: hotLoading } = useHotPolls()
  const { polls: allPolls, loading: allLoading } = usePolls(selectedCategory)
  
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <PageWrapper>
      <UltraHeroSection />
      
      {/* HOT 투표 섹션 */}
      <SectionWrapper>
        <SectionHeader>
          <FloatingBadge
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <FireOutlined />
            TRENDING NOW
          </FloatingBadge>
          
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FireOutlined className="icon" />
            실시간 HOT 투표
          </SectionTitle>
          
          <SectionSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            지금 가장 뜨거운 투표들을 확인해보세요
          </SectionSubtitle>
        </SectionHeader>

        {hotLoading ? (
          <BentoGrid>
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  height: 520,
                  background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                  borderRadius: 24,
                  animation: 'shimmer 2s infinite'
                }}
              />
            ))}
          </BentoGrid>
        ) : hotPolls.length > 0 ? (
          <BentoGrid
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {hotPolls.slice(0, 3).map((poll, index) => (
              <motion.div 
                key={poll.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <UltraModernPollCard poll={poll} index={index} />
              </motion.div>
            ))}
          </BentoGrid>
        ) : (
          <EmptyState>
            <h3>아직 HOT 투표가 없습니다</h3>
            <p>첫 번째 HOT 투표를 만들어보세요!</p>
          </EmptyState>
        )}
      </SectionWrapper>

      {/* MVP: 실시간 박빙 투표와 실시간 댓글 섹션 제거 */}

      {/* 전체 투표 섹션 */}
      <SectionWrapper id="polls-section">
        <SectionHeader>
          <FloatingBadge
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <StarOutlined />
            ALL POLLS
          </FloatingBadge>
          
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <TrophyOutlined className="icon" />
            진행중인 투표
          </SectionTitle>
          
          <SectionSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            카테고리별로 다양한 투표에 참여해보세요
          </SectionSubtitle>
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '2rem' }}
        >
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </motion.div>

        {allLoading ? (
          <BentoGrid>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  height: 520,
                  background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                  borderRadius: 24,
                  animation: 'shimmer 2s infinite'
                }}
              />
            ))}
          </BentoGrid>
        ) : allPolls.length > 0 ? (
          <BentoGrid
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {allPolls.map((poll, index) => (
              <motion.div 
                key={poll.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <UltraModernPollCard poll={poll} index={index} />
              </motion.div>
            ))}
          </BentoGrid>
        ) : (
          <EmptyState>
            <h3>아직 투표가 없습니다</h3>
            <p>첫 번째 투표를 만들어보세요!</p>
          </EmptyState>
        )}
      </SectionWrapper>
    </PageWrapper>
  )
}

export default UltraHomePage