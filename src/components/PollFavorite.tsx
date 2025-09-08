import React, { useState, useEffect } from 'react'
import { Button, Tooltip, message } from 'antd'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

interface PollFavoriteProps {
  pollId: string
  size?: 'small' | 'middle' | 'large'
}

const PollFavorite: React.FC<PollFavoriteProps> = ({ pollId, size = 'middle' }) => {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 로컬 스토리지에서 즐겨찾기 상태 확인
    const favorites = JSON.parse(localStorage.getItem('favoritedPolls') || '[]')
    setIsFavorited(favorites.includes(pollId))
  }, [pollId])

  const handleToggleFavorite = () => {
    if (!user) {
      message.info('로그인 후 즐겨찾기를 사용할 수 있습니다')
      return
    }

    setLoading(true)
    
    const favorites = JSON.parse(localStorage.getItem('favoritedPolls') || '[]')
    let newFavorites: string[]
    
    if (isFavorited) {
      newFavorites = favorites.filter((id: string) => id !== pollId)
      message.success('즐겨찾기에서 제거되었습니다')
    } else {
      newFavorites = [...favorites, pollId]
      message.success('즐겨찾기에 추가되었습니다')
    }
    
    localStorage.setItem('favoritedPolls', JSON.stringify(newFavorites))
    setIsFavorited(!isFavorited)
    setLoading(false)
  }

  return (
    <Tooltip title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기'}>
      <Button
        type={isFavorited ? 'primary' : 'default'}
        icon={isFavorited ? <StarFilled /> : <StarOutlined />}
        onClick={handleToggleFavorite}
        loading={loading}
        size={size}
        style={{
          color: isFavorited ? '#faad14' : undefined,
          borderColor: isFavorited ? '#faad14' : undefined
        }}
      />
    </Tooltip>
  )
}

export default PollFavorite