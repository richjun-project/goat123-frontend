import React, { useState, useEffect } from 'react'
import { Tag, Tooltip } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale('ko')

interface PollTimerProps {
  endsAt?: string | null
  status?: string
}

const PollTimer: React.FC<PollTimerProps> = ({ endsAt, status }) => {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!endsAt) return
    
    const updateTimer = () => {
      const now = dayjs()
      const end = dayjs(endsAt)
      
      if (now.isAfter(end)) {
        setIsExpired(true)
        setTimeLeft('마감됨')
        return
      }
      
      const diff = end.diff(now)
      const duration = dayjs.duration(diff)
      
      if (duration.days() > 0) {
        setTimeLeft(`${duration.days()}일 ${duration.hours()}시간 남음`)
      } else if (duration.hours() > 0) {
        setTimeLeft(`${duration.hours()}시간 ${duration.minutes()}분 남음`)
      } else if (duration.minutes() > 0) {
        setTimeLeft(`${duration.minutes()}분 남음`)
      } else {
        setTimeLeft(`${duration.seconds()}초 남음`)
      }
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [endsAt])

  if (status === 'closed' || isExpired) {
    return (
      <Tag color="red" icon={<CheckCircleOutlined />}>
        마감됨
      </Tag>
    )
  }

  if (!endsAt) {
    return (
      <Tag color="green" icon={<ClockCircleOutlined />}>
        상시 진행
      </Tag>
    )
  }

  return (
    <Tooltip title={`마감: ${dayjs(endsAt).format('YYYY-MM-DD HH:mm')}`}>
      <Tag color="blue" icon={<ClockCircleOutlined />}>
        {timeLeft}
      </Tag>
    </Tooltip>
  )
}

export default PollTimer