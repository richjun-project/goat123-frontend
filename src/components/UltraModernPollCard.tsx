import React, { useState, useRef, useMemo } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Typography, Tag, Progress, Avatar, Tooltip } from 'antd'
import { 
  TeamOutlined, 
  FireOutlined, 
  ShareAltOutlined, 
  CommentOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Poll } from '../types'

const { Title, Text } = Typography

// Styled Components
const CardWrapper = styled(motion.div)`
  perspective: 1000px;
  width: 100%;
  min-height: 520px;
  height: auto;
  cursor: pointer;
  position: relative;
`

const CardInner = styled(motion.div)`
  width: 100%;
  min-height: 520px;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  overflow: hidden;
`

const CardFront = styled(CardFace)`
  background: #ffffff;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: var(--gradient-aurora);
    opacity: 0.05;
    pointer-events: none;
  }

  .dark & {
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(26, 26, 26, 0.9) 100%);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
`

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background: var(--gradient-aurora);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 2rem;
`

const VersusContainer = styled.div`
  position: relative;
  height: 240px;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  margin: -1px -1px 0 -1px;
`

const VersusOption = styled(motion.div)<{ $isLeading?: boolean; $side: 'left' | 'right' }>`
  position: absolute;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  background-size: cover;
  background-position: center;
  ${props => props.$side === 'left' ? 'left: 0;' : 'right: 0;'}
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$isLeading 
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9))'
      : 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))'};
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover::before {
    background: ${props => props.$isLeading 
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95))'
      : 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85))'};
  }
`

const VersusContent = styled.div`
  position: relative;
  z-index: 2;
  color: white;
  text-align: center;
`

const VersusText = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`

const VersusPercent = styled(motion.div)<{ $size?: 'large' | 'normal' }>`
  font-size: ${props => props.$size === 'large' ? '2.5rem' : '2rem'};
  font-weight: 800;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', 'Pretendard Variable', sans-serif;
`

const VersusVS = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.5rem;
  color: #8B5CF6;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 3;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.05em;
`

const ContentSection = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const CategoryBadge = styled(motion.div)`
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
`

const HotBadge = styled(motion.div)`
  background: linear-gradient(135deg, #FF6B6B, #FFE66D);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`

const TitleSection = styled.div`
  margin-bottom: 1rem;
`

const StyledTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  font-family: 'Inter', 'Pretendard Variable', sans-serif;
  line-height: 1.3;
  
  .dark & {
    color: #f0f0f0;
  }
`

const Description = styled.p`
  color: #666;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  
  .dark & {
    color: #999;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  
  .dark & {
    border-top-color: rgba(255, 255, 255, 0.06);
  }
`

const StatItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.1);
    color: var(--color-primary);
    font-size: 1rem;
  }
  
  .content {
    flex: 1;
    
    .label {
      font-size: 0.75rem;
      color: #999;
      margin-bottom: 0.125rem;
      
      .dark & {
        color: #666;
      }
    }
    
    .value {
      font-size: 0.875rem;
      font-weight: 700;
      color: #1a1a1a;
      
      .dark & {
        color: #f0f0f0;
      }
    }
  }
`


const ShineEffect = styled(motion.div)`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.7) 50%,
    transparent 60%
  );
  animation: shine 3s infinite;
  pointer-events: none;
  
  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%);
    }
    100% {
      transform: translateX(100%) translateY(100%);
    }
  }
`

interface UltraModernPollCardProps {
  poll: Poll
  index?: number
}

const UltraModernPollCard: React.FC<UltraModernPollCardProps> = ({ poll, index = 0 }) => {
  const navigate = useNavigate()
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])
  
  const options = poll.options || []
  
  const { leadingOption, sortedOptions } = useMemo(() => {
    const sorted = [...options].sort((a, b) => b.vote_count - a.vote_count)
    return {
      leadingOption: sorted[0],
      sortedOptions: sorted
    }
  }, [options])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000)
    
    if (diff < 60) return '방금 전'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
    return created.toLocaleDateString()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    x.set((e.clientX - centerX) / 5)
    y.set((e.clientY - centerY) / 5)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }


  if (poll.poll_type === 'versus' && options.length === 2) {
    const percentA = poll.total_votes > 0 
      ? Math.round((options[0].vote_count / poll.total_votes) * 100)
      : 50
    const percentB = poll.total_votes > 0
      ? Math.round((options[1].vote_count / poll.total_votes) * 100)
      : 50

    return (
      <CardWrapper
        ref={cardRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.1, 
          duration: 0.6,
          ease: [0.19, 1, 0.22, 1]
        }}
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/poll/${poll.id}`)}
      >
        <CardInner style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          <CardFront>
            <VersusContainer>
              <VersusOption 
                $isLeading={percentA >= percentB}
                $side="left"
                style={{
                  backgroundImage: options[0].option_image 
                    ? `url(${options[0].option_image})`
                    : undefined
                }}
              >
                <ShineEffect />
                <VersusContent>
                  <VersusText>{options[0].option_text}</VersusText>
                  <VersusPercent 
                    $size={percentA >= percentB ? 'large' : 'normal'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    {percentA}%
                  </VersusPercent>
                </VersusContent>
              </VersusOption>
              
              <VersusOption 
                $isLeading={percentB > percentA}
                $side="right"
                style={{
                  backgroundImage: options[1].option_image 
                    ? `url(${options[1].option_image})`
                    : undefined
                }}
              >
                <ShineEffect />
                <VersusContent>
                  <VersusText>{options[1].option_text}</VersusText>
                  <VersusPercent 
                    $size={percentB > percentA ? 'large' : 'normal'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    {percentB}%
                  </VersusPercent>
                </VersusContent>
              </VersusOption>
              
              <VersusVS
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                VS
              </VersusVS>
            </VersusContainer>

            <ContentSection>
              <HeaderSection>
                <CategoryBadge
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrophyOutlined />
                  {poll.category}
                </CategoryBadge>
                {poll.is_hot && (
                  <HotBadge>
                    <FireOutlined />
                    HOT
                  </HotBadge>
                )}
              </HeaderSection>

              <TitleSection>
                <StyledTitle>{poll.title}</StyledTitle>
                {poll.description && (
                  <Description>{poll.description}</Description>
                )}
              </TitleSection>

              <StatsGrid>
                <StatItem
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="icon">
                    <TeamOutlined />
                  </div>
                  <div className="content">
                    <div className="label">참여</div>
                    <div className="value">{formatNumber(poll.total_votes)}</div>
                  </div>
                </StatItem>
                
                <StatItem
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="icon">
                    <EyeOutlined />
                  </div>
                  <div className="content">
                    <div className="label">조회</div>
                    <div className="value">{formatNumber(poll.view_count)}</div>
                  </div>
                </StatItem>
                
                <StatItem
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="icon">
                    <CommentOutlined />
                  </div>
                  <div className="content">
                    <div className="label">댓글</div>
                    <div className="value">{formatNumber(poll.comment_count)}</div>
                  </div>
                </StatItem>
                
                <StatItem
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="icon">
                    <ClockCircleOutlined />
                  </div>
                  <div className="content">
                    <div className="label">생성</div>
                    <div className="value">{getTimeAgo(poll.created_at)}</div>
                  </div>
                </StatItem>
              </StatsGrid>

            </ContentSection>
          </CardFront>
          
          <CardBack>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>투표 통계</h2>
              <p>상세 통계 정보가 여기에 표시됩니다</p>
            </div>
          </CardBack>
        </CardInner>
      </CardWrapper>
    )
  }

  // Multiple choice poll
  return (
    <CardWrapper
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.6,
        ease: [0.19, 1, 0.22, 1]
      }}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/poll/${poll.id}`)}
    >
      <CardInner>
        <CardFront>
          <ContentSection style={{ paddingTop: '2rem' }}>
            <HeaderSection>
              <CategoryBadge
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThunderboltOutlined />
                {poll.category}
              </CategoryBadge>
              {poll.is_hot && (
                <HotBadge>
                  <FireOutlined />
                  HOT
                </HotBadge>
              )}
            </HeaderSection>

            <TitleSection>
              <StyledTitle>{poll.title}</StyledTitle>
              {poll.description && (
                <Description>{poll.description}</Description>
              )}
            </TitleSection>

            <div style={{ marginBottom: '1.5rem' }}>
              {sortedOptions.slice(0, 3).map((option, idx) => {
                const percent = poll.total_votes > 0 
                  ? Math.round((option.vote_count / poll.total_votes) * 100)
                  : 0
                
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {idx === 0 && <TrophyOutlined style={{ color: '#FFD700', marginRight: '0.25rem' }} />}
                        {option.option_text}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                        {percent}%
                      </span>
                    </div>
                    <Progress 
                      percent={percent} 
                      strokeWidth={6}
                      strokeColor={idx === 0 ? 'var(--gradient-aurora)' : undefined}
                      showInfo={false}
                    />
                  </motion.div>
                )
              })}
              {options.length > 3 && (
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  +{options.length - 3}개 더 보기
                </Text>
              )}
            </div>

            <StatsGrid>
              <StatItem
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="icon">
                  <TeamOutlined />
                </div>
                <div className="content">
                  <div className="label">참여</div>
                  <div className="value">{formatNumber(poll.total_votes)}</div>
                </div>
              </StatItem>
              
              <StatItem
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="icon">
                  <EyeOutlined />
                </div>
                <div className="content">
                  <div className="label">조회</div>
                  <div className="value">{formatNumber(poll.view_count)}</div>
                </div>
              </StatItem>
              
              <StatItem
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="icon">
                  <CommentOutlined />
                </div>
                <div className="content">
                  <div className="label">댓글</div>
                  <div className="value">{formatNumber(poll.comment_count)}</div>
                </div>
              </StatItem>
              
              <StatItem
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="icon">
                  <ClockCircleOutlined />
                </div>
                <div className="content">
                  <div className="label">생성</div>
                  <div className="value">{getTimeAgo(poll.created_at)}</div>
                </div>
              </StatItem>
            </StatsGrid>

          </ContentSection>
        </CardFront>
      </CardInner>
    </CardWrapper>
  )
}

export default UltraModernPollCard