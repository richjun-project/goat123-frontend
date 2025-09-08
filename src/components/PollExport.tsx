import React, { useState } from 'react'
import { Button, Dropdown, Menu, message } from 'antd'
import { DownloadOutlined, FileTextOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import type { Poll } from '../types'

interface PollExportProps {
  poll: Poll
  containerRef?: React.RefObject<HTMLElement>
}

const PollExport: React.FC<PollExportProps> = ({ poll, containerRef }) => {
  const [loading, setLoading] = useState(false)

  const exportToCSV = () => {
    const csvContent = [
      ['투표 제목', poll.title],
      ['설명', poll.description || ''],
      ['유형', poll.poll_type === 'versus' ? 'VS 투표' : '다중 선택'],
      ['총 참여자', poll.total_votes.toString()],
      ['조회수', poll.view_count.toString()],
      [''],
      ['선택지', '득표수', '득표율(%)']
    ]

    poll.options?.forEach(option => {
      const percentage = poll.total_votes > 0 
        ? ((option.vote_count / poll.total_votes) * 100).toFixed(1)
        : '0'
      csvContent.push([
        option.option_text,
        option.vote_count.toString(),
        percentage
      ])
    })

    const csv = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${poll.title}_결과.csv`
    link.click()
    
    message.success('CSV 파일이 다운로드되었습니다')
  }

  const exportToJSON = () => {
    const data = {
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        type: poll.poll_type,
        category: poll.category,
        totalVotes: poll.total_votes,
        viewCount: poll.view_count,
        createdAt: poll.created_at,
        options: poll.options?.map(option => ({
          text: option.option_text,
          votes: option.vote_count,
          percentage: poll.total_votes > 0 
            ? ((option.vote_count / poll.total_votes) * 100).toFixed(1)
            : '0'
        }))
      },
      exportedAt: new Date().toISOString()
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${poll.title}_결과.json`
    link.click()
    
    message.success('JSON 파일이 다운로드되었습니다')
  }

  const exportToImage = async () => {
    if (!containerRef?.current) {
      message.error('이미지 캡처 영역을 찾을 수 없습니다')
      return
    }

    setLoading(true)
    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `${poll.title}_결과.png`
          link.click()
          message.success('이미지가 다운로드되었습니다')
        }
      })
    } catch (error) {
      message.error('이미지 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const menu = (
    <Menu
      onClick={({ key }) => {
        switch (key) {
          case 'csv':
            exportToCSV()
            break
          case 'json':
            exportToJSON()
            break
          case 'image':
            exportToImage()
            break
        }
      }}
    >
      <Menu.Item key="csv" icon={<FileTextOutlined />}>
        CSV로 내보내기
      </Menu.Item>
      <Menu.Item key="json" icon={<FileTextOutlined />}>
        JSON으로 내보내기
      </Menu.Item>
      <Menu.Item key="image" icon={<FileImageOutlined />}>
        이미지로 저장
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} placement="bottomRight">
      <Button icon={<DownloadOutlined />} loading={loading}>
        결과 내보내기
      </Button>
    </Dropdown>
  )
}

export default PollExport