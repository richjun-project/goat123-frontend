import React, { useMemo, useState } from 'react'
import { Card, Typography, Space, Tag, Progress, Button, Avatar, Tooltip, Badge } from 'antd'
import { 
  TeamOutlined, 
  FireOutlined, 
  ShareAltOutlined, 
  CommentOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Poll } from '../types'

const { Title, Text } = Typography

const StyledCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 520px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .ant-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
`

const VersusContainer = styled.div`
  position: relative;
  height: 220px;
  overflow: hidden;
  width: 100%;
`

const VersusOption = styled.div<{ $isLeading?: boolean; $side?: 'left' | 'right' }>`
  position: absolute;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
  
  ${props => props.$side === 'left' ? 'left: 0;' : 'right: 0;'}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$isLeading 
      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))'
      : 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))'};
    z-index: 1;
  }
`

const VersusContent = styled.div`
  position: relative;
  z-index: 2;
  color: white;
  text-align: center;
`

const VersusText = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`

const VersusPercent = styled.div<{ $size?: 'large' | 'normal' }>`
  font-size: ${props => props.$size === 'large' ? '36px' : '28px'};
  font-weight: bold;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
`

const VersusVS = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  color: #667eea;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 3;
`

const CategoryTag = styled(Tag)`
  border-radius: 20px;
  padding: 2px 12px;
  font-size: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
`

const StatusBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 8px;
    height: 8px;
  }
`

const ActionButton = styled(Button)`
  border-radius: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
  flex-wrap: wrap;
`

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 12px;
  white-space: nowrap;
  
  .anticon {
    font-size: 14px;
  }
`

const MultipleOptionBar = styled.div`
  margin-bottom: 16px;
`

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'food': '#52c41a',
    'tech': '#1890ff',
    'game': '#722ed1',
    'sports': '#fa541c',
    'entertainment': '#eb2f96',
    'travel': '#13c2c2',
    'fashion': '#faad14',
    'beauty': '#ff85c0',
    'auto': '#595959'
  }
  return colors[category] || '#1890ff'
}

interface ModernPollCardProps {
  poll: Poll
  index?: number
}

const ModernPollCard: React.FC<ModernPollCardProps> = ({ poll, index = 0 }) => {
  const navigate = useNavigate()
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


  if (poll.poll_type === 'versus' && options.length === 2) {
    const percentA = poll.total_votes > 0 
      ? Math.round((options[0].vote_count / poll.total_votes) * 100)
      : 50
    const percentB = poll.total_votes > 0
      ? Math.round((options[1].vote_count / poll.total_votes) * 100)
      : 50

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        style={{ height: '100%' }}
      >
        <StyledCard
          hoverable
          onClick={() => navigate(`/poll/${poll.id}`)}
        >
          <VersusContainer>
            <VersusOption 
              $isLeading={percentA >= percentB}
              $side="left"
              style={{
                backgroundImage: options[0].option_image 
                  ? `url(${options[0].option_image})`
                  : 'linear-gradient(135deg, #667eea, #764ba2)'
              }}
            >
              <VersusContent>
                <VersusText>{options[0].option_text}</VersusText>
                <VersusPercent $size={percentA >= percentB ? 'large' : 'normal'}>
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
                  : 'linear-gradient(135deg, #f093fb, #f5576c)'
              }}
            >
              <VersusContent>
                <VersusText>{options[1].option_text}</VersusText>
                <VersusPercent $size={percentB > percentA ? 'large' : 'normal'}>
                  {percentB}%
                </VersusPercent>
              </VersusContent>
            </VersusOption>
            
            <VersusVS>VS</VersusVS>
          </VersusContainer>

          <Space direction="vertical" size="small" style={{ width: '100%', padding: '20px' }}>
            <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
              <CategoryTag color={getCategoryColor(poll.category)}>
                {poll.category}
              </CategoryTag>
              {poll.is_hot && (
                <StatusBadge status="processing" text={<Text style={{ fontSize: 12 }}>🔥 HOT</Text>} />
              )}
            </Space>

            <Title level={4} style={{ margin: '8px 0' }}>
              {poll.title}
            </Title>

            {poll.description && (
              <Text type="secondary" ellipsis>
                {poll.description}
              </Text>
            )}


            <StatsContainer>
              <StatItem>
                <TeamOutlined />
                <span>{formatNumber(poll.total_votes)}</span>
              </StatItem>
              <StatItem>
                <EyeOutlined />
                <span>{formatNumber(poll.view_count)}</span>
              </StatItem>
              <StatItem>
                <CommentOutlined />
                <span>{formatNumber(poll.comment_count)}</span>
              </StatItem>
              <StatItem>
                <ClockCircleOutlined />
                <span>{getTimeAgo(poll.created_at)}</span>
              </StatItem>
            </StatsContainer>
          </Space>
        </StyledCard>
      </motion.div>
    )
  }

  // Multiple choice poll
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      style={{ height: '100%' }}
    >
      <StyledCard
        hoverable
        onClick={() => navigate(`/poll/${poll.id}`)}
      >
        <Space direction="vertical" size="small" style={{ width: '100%', flex: 1, padding: '24px' }}>
          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
            <CategoryTag color={getCategoryColor(poll.category)}>
              {poll.category}
            </CategoryTag>
            {poll.is_hot && (
              <StatusBadge status="processing" text={<Text style={{ fontSize: 12 }}>🔥 HOT</Text>} />
            )}
          </Space>

          <Title level={4} style={{ margin: '8px 0' }}>
            {poll.title}
          </Title>

          {poll.description && (
            <Text type="secondary" ellipsis>
              {poll.description}
            </Text>
          )}

          <MultipleOptionBar>
            {sortedOptions.slice(0, 3).map((option, idx) => {
              const percent = poll.total_votes > 0 
                ? Math.round((option.vote_count / poll.total_votes) * 100)
                : 0
              
              return (
                <OptionItem key={option.id}>
                  <Space>
                    {idx === 0 && <TrophyOutlined style={{ color: '#faad14' }} />}
                    <Text>{option.option_text}</Text>
                  </Space>
                  <Space>
                    <Progress 
                      percent={percent} 
                      strokeWidth={6}
                      style={{ width: 100 }}
                      strokeColor={idx === 0 ? '#52c41a' : undefined}
                    />
                    <Text strong>{percent}%</Text>
                  </Space>
                </OptionItem>
              )
            })}
            {options.length > 3 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{options.length - 3}개 더 보기
              </Text>
            )}
          </MultipleOptionBar>


          <StatsContainer>
            <StatItem>
              <TeamOutlined />
              <span>{formatNumber(poll.total_votes)}</span>
            </StatItem>
            <StatItem>
              <EyeOutlined />
              <span>{formatNumber(poll.view_count)}</span>
            </StatItem>
            <StatItem>
              <CommentOutlined />
              <span>{formatNumber(poll.comment_count)}</span>
            </StatItem>
            <StatItem>
              <ClockCircleOutlined />
              <span>{getTimeAgo(poll.created_at)}</span>
            </StatItem>
          </StatsContainer>
        </Space>
      </StyledCard>
    </motion.div>
  )
}

export default ModernPollCard