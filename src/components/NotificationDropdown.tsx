import React, { useState } from 'react'
import { Dropdown, Badge, Button, List, Typography, Space, Empty, Avatar, Divider } from 'antd'
import { 
  BellOutlined, 
  BellFilled, 
  CheckOutlined, 
  DeleteOutlined,
  CommentOutlined,
  HeartOutlined,
  TrophyOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import { useNotifications } from '../contexts/NotificationContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const { Text } = Typography

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'comment':
      return <CommentOutlined style={{ color: '#1890ff' }} />
    case 'vote':
      return <TrophyOutlined style={{ color: '#52c41a' }} />
    case 'like':
      return <HeartOutlined style={{ color: '#ff4d4f' }} />
    case 'poll_winner':
      return <TrophyOutlined style={{ color: '#faad14' }} />
    case 'new_follower':
      return <UserAddOutlined style={{ color: '#722ed1' }} />
    default:
      return <BellOutlined />
  }
}

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
  const [open, setOpen] = useState(false)

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  const dropdownContent = (
    <div style={{ 
      width: 360, 
      maxHeight: 480, 
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      {/* 헤더 */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong style={{ fontSize: 16 }}>
          알림 {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <Space>
          {unreadCount > 0 && (
            <Button 
              type="text" 
              size="small" 
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              모두 읽음
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              type="text" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={clearNotifications}
            >
              모두 삭제
            </Button>
          )}
        </Space>
      </div>

      {/* 알림 목록 */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                onClick={() => handleNotificationClick(item.id)}
                style={{ 
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: item.read ? '#fff' : '#f6f9ff',
                  borderLeft: item.read ? 'none' : '3px solid #1890ff',
                  transition: 'all 0.3s'
                }}
                className="notification-item"
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getNotificationIcon(item.type)}
                      style={{ background: 'transparent' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong={!item.read}>{item.title}</Text>
                      {!item.read && (
                        <Badge status="processing" />
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text style={{ fontSize: 13 }}>{item.description}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(item.created_at).fromNow()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty 
            image={<BellOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
            description="알림이 없습니다"
            style={{ padding: '40px 0' }}
          />
        )}
      </div>

      {/* 더보기 */}
      {notifications.length > 10 && (
        <div style={{ 
          padding: '8px', 
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center'
        }}>
          <Button type="link">
            모든 알림 보기
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Badge count={unreadCount} size="small">
        <Button 
          type="text" 
          icon={unreadCount > 0 ? <BellFilled /> : <BellOutlined />}
          style={{ fontSize: 18 }}
        />
      </Badge>
    </Dropdown>
  )
}

export default NotificationDropdown