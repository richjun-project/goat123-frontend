import React, { useEffect, useState } from 'react'
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion'
import { Button, Space } from 'antd'
import { 
  RocketOutlined, 
  ThunderboltOutlined,
  FireOutlined,
  StarOutlined,
  TrophyOutlined,
  TeamOutlined,
  RiseOutlined,
  CrownOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { supabase } from '../lib/supabase'

// Styled Components
const HeroWrapper = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  
  @media (max-width: 768px) {
    min-height: 80vh;
  }
`

const BackgroundAnimation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
`

const FloatingOrb = styled(motion.div)<{ $color: string; $size: number }>`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background: ${props => props.$color};
  filter: blur(40px);
  opacity: 0.6;
`

const ParticleField = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    opacity: 0.6;
    animation: float 20s infinite linear;
  }
  
  @keyframes float {
    from {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    90% {
      opacity: 0.6;
    }
    to {
      transform: translateY(-100vh) rotate(360deg);
      opacity: 0;
    }
  }
`

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 0 1rem;
    gap: 3rem;
  }
`

const TextContent = styled.div`
  color: white;
`

const GlowingTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  margin: 0 0 1.5rem 0;
  line-height: 1.1;
  font-family: var(--font-display);
  letter-spacing: -0.03em;
  text-shadow: 
    0 0 40px rgba(255, 255, 255, 0.3),
    0 0 80px rgba(139, 92, 246, 0.3);
  
  .gradient-text {
    background: linear-gradient(90deg, #fff, #ffd4fc, #c3f0ff, #fff);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient 3s linear infinite;
  }
  
  @keyframes gradient {
    to {
      background-position: 200% center;
    }
  }
`

const Subtitle = styled(motion.p)`
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  margin: 0 0 2.5rem 0;
  opacity: 0.95;
  line-height: 1.6;
  font-weight: 500;
`

const TypingText = styled.span`
  display: inline-block;
  border-right: 3px solid white;
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 50% {
      border-color: white;
    }
    51%, 100% {
      border-color: transparent;
    }
  }
`

const CTAButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
`

const PrimaryButton = styled(motion.button)`
  background: white;
  color: var(--color-primary);
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 100px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: all 0.3s var(--ease-out-expo);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: var(--gradient-aurora);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
    color: white;
    
    &::before {
      width: 400px;
      height: 400px;
    }
    
    span {
      position: relative;
      z-index: 1;
    }
  }
`

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 2.5rem;
  border-radius: 100px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s var(--ease-out-expo);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.6s;
  }
  
  &:hover::before {
    animation: shimmer 0.6s;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }
`

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  
  .anticon {
    background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.6));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const StatNumber = styled(motion.div)`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  font-family: var(--font-display);
`

const StatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
`

const FloatingIcon = styled(motion.div)<{ $delay: number }>`
  position: absolute;
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.2);
  animation: float-icon ${props => 15 + props.$delay}s infinite ease-in-out;
  animation-delay: ${props => props.$delay}s;
  
  @keyframes float-icon {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-20px) rotate(10deg);
    }
    50% {
      transform: translateY(10px) rotate(-5deg);
    }
    75% {
      transform: translateY(-10px) rotate(5deg);
    }
  }
`

const UltraHeroSection: React.FC = () => {
  const navigate = useNavigate()
  const controls = useAnimation()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  const [typedText, setTypedText] = useState('')
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [totalVotes, setTotalVotes] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)
  
  const texts = [
    '최고의 선택을 찾아보세요',
    '당신의 의견을 들려주세요',
    '트렌드를 만들어가세요'
  ]
  
  useEffect(() => {
    const text = texts[currentTextIndex]
    let index = 0
    
    const typeInterval = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index))
        index++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }, 2000)
      }
    }, 100)
    
    return () => clearInterval(typeInterval)
  }, [currentTextIndex])
  
  // Animate stats on mount
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    })
  }, [controls])

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`
    }
    return num.toString()
  }

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total votes count
        const { data: polls } = await supabase
          .from('polls')
          .select('total_votes')
        
        const totalVotesCount = polls?.reduce((sum, poll) => sum + (poll.total_votes || 0), 0) || 0
        setTotalVotes(totalVotesCount)

        // Get all-time active users count
        const { data: recentVotes } = await supabase
          .from('poll_votes')
          .select('user_id, ip_address')
        
        // Count unique users (by user_id or ip_address)
        const uniqueUsers = new Set()
        recentVotes?.forEach(vote => {
          if (vote.user_id) {
            uniqueUsers.add(`user_${vote.user_id}`)
          } else if (vote.ip_address) {
            uniqueUsers.add(`ip_${vote.ip_address}`)
          }
        })
        
        setActiveUsers(uniqueUsers.size)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 20 + Math.random() * 10
  }))

  return (
    <HeroWrapper>
      <BackgroundAnimation>
        <FloatingOrb
          $color="rgba(139, 92, 246, 0.4)"
          $size={600}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <FloatingOrb
          $color="rgba(236, 72, 153, 0.4)"
          $size={400}
          animate={{
            x: [0, -150, 150, 0],
            y: [0, 150, -150, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ bottom: '10%', right: '10%' }}
        />
        <FloatingOrb
          $color="rgba(6, 182, 212, 0.3)"
          $size={300}
          animate={{
            x: [0, 200, -200, 0],
            y: [0, -200, 200, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '50%', right: '20%' }}
        />
        
        <ParticleField>
          {particles.map(particle => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </ParticleField>
        
        <FloatingIcon $delay={0} style={{ top: '15%', left: '5%' }}>
          <TrophyOutlined />
        </FloatingIcon>
        <FloatingIcon $delay={2} style={{ top: '25%', right: '10%' }}>
          <FireOutlined />
        </FloatingIcon>
        <FloatingIcon $delay={4} style={{ bottom: '30%', left: '8%' }}>
          <StarOutlined />
        </FloatingIcon>
        <FloatingIcon $delay={6} style={{ bottom: '20%', right: '15%' }}>
          <RocketOutlined />
        </FloatingIcon>
        <FloatingIcon $delay={8} style={{ top: '60%', left: '15%' }}>
          <CrownOutlined />
        </FloatingIcon>
      </BackgroundAnimation>
      
      <ContentContainer>
        <TextContent>
          <GlowingTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="gradient-text">THEGOAT123</span>에서<br />
            <TypingText>{typedText}</TypingText>
          </GlowingTitle>
          
          <Subtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            실시간 투표 배틀 플랫폼에서 당신의 선택이 트렌드가 됩니다.
            지금 바로 참여하고 최고의 선택을 만들어보세요!
          </Subtitle>
          
          <CTAButtons
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PrimaryButton
              onClick={() => navigate('/create-poll')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThunderboltOutlined />
              <span>투표 만들기</span>
            </PrimaryButton>
            <SecondaryButton
              onClick={() => document.getElementById('polls-section')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RiseOutlined />
              <span>투표 둘러보기</span>
            </SecondaryButton>
          </CTAButtons>
        </TextContent>
        
        <StatsGrid
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <StatCard
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatIcon>
              <TeamOutlined />
            </StatIcon>
            <StatNumber
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 1, stiffness: 200 }}
            >
              {formatNumber(activeUsers)}
            </StatNumber>
            <StatLabel>활성 사용자</StatLabel>
          </StatCard>
          
          <StatCard
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatIcon>
              <FireOutlined />
            </StatIcon>
            <StatNumber
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 1.1, stiffness: 200 }}
            >
              {formatNumber(totalVotes)}
            </StatNumber>
            <StatLabel>총 투표 수</StatLabel>
          </StatCard>
          
          <StatCard
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatIcon>
              <RocketOutlined />
            </StatIcon>
            <StatNumber
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 1.2, stiffness: 200 }}
            >
              98%
            </StatNumber>
            <StatLabel>만족도</StatLabel>
          </StatCard>
          
          <StatCard
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatIcon>
              <TrophyOutlined />
            </StatIcon>
            <StatNumber
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 1.3, stiffness: 200 }}
            >
              24/7
            </StatNumber>
            <StatLabel>실시간 업데이트</StatLabel>
          </StatCard>
        </StatsGrid>
      </ContentContainer>
    </HeroWrapper>
  )
}

export default UltraHeroSection