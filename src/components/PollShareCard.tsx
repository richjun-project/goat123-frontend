import React, { useRef, useEffect, useState } from 'react'
import { Card, Typography, Button, Space, message, Row, Col, Progress, Avatar, QRCode as AntQRCode } from 'antd'
import { ShareAltOutlined, DownloadOutlined, LinkOutlined, QrcodeOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import type { Poll } from '../types'

const { Title, Text } = Typography

interface PollShareCardProps {
  poll: Poll
  onClose?: () => void
}

const PollShareCard: React.FC<PollShareCardProps> = ({ poll, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const shareUrl = `${window.location.origin}/poll/${poll.id}`
  const options = poll.options || []
  
  // 카드 이미지로 다운로드
  const downloadAsImage = async () => {
    if (!cardRef.current) return
    
    try {
      // 잠시 대기하여 QR 코드가 완전히 렌더링되도록 함
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY
      const scrollX = window.scrollX
      
      // 스크롤을 최상단으로 이동 (html2canvas가 더 정확하게 캡처하도록)
      window.scrollTo(0, 0)
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: cardRef.current.scrollWidth,
        windowHeight: cardRef.current.scrollHeight,
        x: 0,
        y: 0
      })
      
      // 스크롤 위치 복원
      window.scrollTo(scrollX, scrollY)
      
      const link = document.createElement('a')
      link.download = `poll-${poll.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      message.success('이미지가 다운로드되었습니다')
    } catch (error) {
      console.error('Image download error:', error)
      message.error('이미지 다운로드에 실패했습니다')
    }
  }
  
  // 링크 복사
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    message.success('링크가 복사되었습니다')
  }
  
  // 공유하기
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.title,
          text: poll.description || `"${poll.title}" 투표에 참여해보세요!`,
          url: shareUrl
        })
      } catch (error) {
        // 공유 취소 또는 실패 시 조용히 처리
      }
    } else {
      copyLink()
    }
  }
  
  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      {/* 공유 카드 미리보기 */}
      <div ref={cardRef} style={{ padding: 20, background: 'white' }}>
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 12
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 헤더 */}
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                {poll.title}
              </Title>
              {poll.description && (
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                  {poll.description}
                </Text>
              )}
            </div>
            
            {/* 투표 옵션 표시 */}
            <div style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: 8, 
              padding: 16 
            }}>
              {poll.poll_type === 'versus' && options.length === 2 ? (
                // 1:1 대결
                <Row gutter={16} align="middle">
                  <Col span={10}>
                    <div style={{ textAlign: 'center' }}>
                      {options[0].option_image && (
                        <Avatar 
                          src={options[0].option_image} 
                          size={80} 
                          style={{ marginBottom: 8 }}
                        />
                      )}
                      <Text strong>{options[0].option_text}</Text>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                        {poll.total_votes > 0 
                          ? Math.round((options[0].vote_count / poll.total_votes) * 100)
                          : 50}%
                      </div>
                    </div>
                  </Col>
                  <Col span={4} style={{ textAlign: 'center' }}>
                    <Text strong style={{ fontSize: 18 }}>VS</Text>
                  </Col>
                  <Col span={10}>
                    <div style={{ textAlign: 'center' }}>
                      {options[1].option_image && (
                        <Avatar 
                          src={options[1].option_image} 
                          size={80} 
                          style={{ marginBottom: 8 }}
                        />
                      )}
                      <Text strong>{options[1].option_text}</Text>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                        {poll.total_votes > 0 
                          ? Math.round((options[1].vote_count / poll.total_votes) * 100)
                          : 50}%
                      </div>
                    </div>
                  </Col>
                </Row>
              ) : (
                // 다중 선택
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {options
                    .sort((a, b) => b.vote_count - a.vote_count)
                    .slice(0, 5)
                    .map((option, idx) => {
                      const percent = poll.total_votes > 0 
                        ? Math.round((option.vote_count / poll.total_votes) * 100)
                        : 0
                      
                      return (
                        <div key={option.id}>
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Space>
                                <Text strong>{idx + 1}.</Text>
                                <Text>{option.option_text}</Text>
                              </Space>
                            </Col>
                            <Col>
                              <Text strong>{percent}%</Text>
                            </Col>
                          </Row>
                          <Progress 
                            percent={percent} 
                            showInfo={false}
                            strokeColor={option.color || '#1890ff'}
                            strokeWidth={6}
                          />
                        </div>
                      )
                    })}
                </Space>
              )}
            </div>
            
            {/* 통계 정보 */}
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: 8, 
              padding: 12,
              textAlign: 'center'
            }}>
              <Text strong style={{ color: 'white', fontSize: 16 }}>
                🗳️ {poll.total_votes.toLocaleString()}명이 투표했습니다
              </Text>
            </div>
            
            {/* QR 코드 - Ant Design QRCode 사용 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: '12px', 
                borderRadius: '8px',
                display: 'inline-block',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                minWidth: '174px'
              }}>
                <AntQRCode 
                  value={shareUrl}
                  size={150}
                  color="#000000"
                  bgColor="#FFFFFF"
                  bordered={false}
                  errorLevel="M"
                  icon={`${window.location.origin}/favicon.ico`}
                  iconSize={30}
                />
                <div style={{ 
                  width: '150px',
                  margin: '8px auto 0',
                  padding: '4px 8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#333333',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  <span>📱 QR코드로 투표 참여</span>
                </div>
              </div>
            </div>
          </Space>
        </Card>
      </div>
      
      {/* 공유 버튼들 */}
      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={5}>공유하기</Title>
          
          <Row gutter={8}>
            <Col span={8}>
              <Button 
                block 
                icon={<ShareAltOutlined />}
                onClick={share}
              >
                공유
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                block 
                icon={<LinkOutlined />}
                onClick={copyLink}
              >
                링크 복사
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                block 
                icon={<DownloadOutlined />}
                onClick={downloadAsImage}
              >
                이미지 저장
              </Button>
            </Col>
          </Row>
          
          {/* SNS 공유 버튼 */}
          <Row gutter={8}>
            <Col span={8}>
              <Button 
                block
                style={{ background: '#1DA1F2', borderColor: '#1DA1F2', color: 'white' }}
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(poll.title)}&url=${encodeURIComponent(shareUrl)}`,
                    '_blank'
                  )
                }}
              >
                트위터
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                block
                style={{ background: '#4267B2', borderColor: '#4267B2', color: 'white' }}
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    '_blank'
                  )
                }}
              >
                페이스북
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                block
                style={{ background: '#03C75A', borderColor: '#03C75A', color: 'white' }}
                onClick={() => {
                  window.open(
                    `https://share.naver.com/web/shareView?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(poll.title)}`,
                    '_blank'
                  )
                }}
              >
                네이버
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  )
}

export default PollShareCard