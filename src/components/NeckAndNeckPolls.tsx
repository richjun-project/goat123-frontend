import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Progress, Typography, Space, Badge, Empty, Skeleton } from 'antd'
import { ThunderboltOutlined, FireOutlined, TeamOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Poll } from '../types'

const { Title, Text } = Typography

const SectionCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  
  .ant-card-head {
    background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
    border: none;
    
    .ant-card-head-title {
      color: white;
      font-weight: 600;
    }
  }
`

const BattleCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #ff6b6b;
    transform: translateY(-2px);
  }
`

const VersusBar = styled.div`
  position: relative;
  height: 40px;
  background: #f0f0f0;
  border-radius: 100px;
  overflow: hidden;
  margin: 12px 0;
`

const VersusProgress = styled(motion.div)<{ $color: string; $side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  height: 100%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  ${props => props.$side === 'left' ? 'left: 0; justify-content: flex-start;' : 'right: 0; justify-content: flex-end;'}
`

const VersusCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  font-weight: bold;
  color: #ff6b6b;
`

const PulseIcon = styled(motion.div)`
  display: inline-block;
`

const NeckAndNeckPolls: React.FC = () => {
  const navigate = useNavigate()
  const [neckAndNeckPolls, setNeckAndNeckPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNeckAndNeckPolls()
    // MVP: 실시간 기능 제거, 단순한 데이터 로딩만 유지
  }, [])

  const fetchNeckAndNeckPolls = async () => {
    try {
      const { data: polls, error } = await supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*)
        `)
        .eq('status', 'active')
        .eq('poll_type', 'versus')
        .gt('total_votes', 10) // 최소 10표 이상
        .order('total_votes', { ascending: false })

      if (error) throw error

      // 박빙인 투표만 필터링 (차이가 10% 이내)
      const closePolls = (polls || []).filter(poll => {
        if (poll.options?.length !== 2) return false
        
        const [optionA, optionB] = poll.options
        const total = poll.total_votes || 0
        
        if (total === 0) return false
        
        const percentA = (optionA.vote_count / total) * 100
        const percentB = (optionB.vote_count / total) * 100
        const difference = Math.abs(percentA - percentB)
        
        return difference <= 10 // 10% 이내 차이
      }).slice(0, 5) // 최대 5개

      setNeckAndNeckPolls(closePolls)
    } catch (error) {
      console.error('Error fetching neck-and-neck polls:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <SectionCard
        title={
          <Space>
            <ThunderboltOutlined />
            <span>실시간 박빙 승부</span>
          </Space>
        }
      >
        <Skeleton active paragraph={{ rows: 3 }} />
      </SectionCard>
    )
  }

  if (neckAndNeckPolls.length === 0) {
    return null // 박빙 투표가 없으면 섹션 자체를 숨김
  }

  return (
    <SectionCard
      title={
        <Space>
          <PulseIcon
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ThunderboltOutlined style={{ fontSize: 20 }} />
          </PulseIcon>
          <span>박빙 승부</span>
          <Badge 
            count={neckAndNeckPolls.length} 
            style={{ backgroundColor: '#fff', color: '#ff6b6b' }}
          />
        </Space>
      }
      bodyStyle={{ padding: 16 }}
    >
      <AnimatePresence mode="wait">
        {neckAndNeckPolls.map((poll, index) => {
          const [optionA, optionB] = poll.options || []
          const total = poll.total_votes || 0
          const percentA = total > 0 ? Math.round((optionA.vote_count / total) * 100) : 50
          const percentB = total > 0 ? Math.round((optionB.vote_count / total) * 100) : 50
          const difference = Math.abs(percentA - percentB)

          return (
            <BattleCard
              key={poll.id}
              onClick={() => navigate(`/poll/${poll.id}`)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={5} style={{ margin: 0 }}>
                    {poll.title}
                  </Title>
                  <Space style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <TeamOutlined /> {total.toLocaleString()}명 참여
                    </Text>
                    {difference <= 2 && (
                      <Badge 
                        status="processing" 
                        text={
                          <Text strong style={{ fontSize: 11, color: '#ff4d4f' }}>
                            초박빙!
                          </Text>
                        } 
                      />
                    )}
                  </Space>
                </Col>
              </Row>

              <VersusBar>
                <VersusProgress
                  $color="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                  $side="left"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentA}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {optionA.option_text}
                </VersusProgress>
                
                <VersusProgress
                  $color="linear-gradient(90deg, #f093fb 0%, #f5576c 100%)"
                  $side="right"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentB}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                >
                  {optionB.option_text}
                </VersusProgress>
                
                <VersusCenter>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    VS
                  </motion.div>
                </VersusCenter>
              </VersusBar>

              <Row justify="space-between" style={{ marginTop: 8 }}>
                <Col>
                  <Text strong style={{ color: '#667eea' }}>
                    {percentA}%
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                    ({optionA.vote_count.toLocaleString()}표)
                  </Text>
                </Col>
                <Col>
                  <Text strong style={{ color: '#f5576c' }}>
                    {percentB}%
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                    ({optionB.vote_count.toLocaleString()}표)
                  </Text>
                </Col>
              </Row>
            </BattleCard>
          )
        })}
      </AnimatePresence>
    </SectionCard>
  )
}

export default NeckAndNeckPolls