import React, { useState } from 'react'
import { Button, Dropdown, Menu, Modal, message } from 'antd'
import { EditOutlined, DeleteOutlined, MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Poll } from '../types'

const { confirm } = Modal

interface PollActionsProps {
  poll: Poll
  onUpdate?: () => void
}

const PollActions: React.FC<PollActionsProps> = ({ poll, onUpdate }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // 작성자가 아니면 아무것도 렌더링하지 않음
  if (!user || poll.created_by !== user.id) {
    return null
  }

  const handleEdit = () => {
    navigate(`/poll/${poll.id}/edit`)
  }

  const handleDelete = () => {
    confirm({
      title: '투표를 삭제하시겠습니까?',
      icon: <ExclamationCircleOutlined />,
      content: '삭제된 투표는 복구할 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        setLoading(true)
        try {
          // 관련 데이터 삭제 (옵션, 투표, 댓글은 CASCADE로 자동 삭제)
          const { error } = await supabase
            .from('polls')
            .delete()
            .eq('id', poll.id)
            .eq('created_by', user.id) // 본인 확인

          if (error) throw error

          message.success('투표가 삭제되었습니다')
          navigate('/')
        } catch (error: any) {
          message.error(error.message || '삭제에 실패했습니다')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const handleClose = () => {
    confirm({
      title: '투표를 마감하시겠습니까?',
      content: '마감된 투표는 더 이상 참여할 수 없습니다.',
      okText: '마감',
      cancelText: '취소',
      onOk: async () => {
        setLoading(true)
        try {
          const { error } = await supabase
            .from('polls')
            .update({
              status: 'closed',
              ends_at: new Date().toISOString()
            })
            .eq('id', poll.id)
            .eq('created_by', user.id)

          if (error) throw error

          message.success('투표가 마감되었습니다')
          onUpdate?.()
        } catch (error: any) {
          message.error(error.message || '마감에 실패했습니다')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={handleEdit}>
        수정
      </Menu.Item>
      {poll.status === 'active' && (
        <Menu.Item key="close" onClick={handleClose}>
          투표 마감
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={handleDelete}>
        삭제
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} placement="bottomRight">
      <Button icon={<MoreOutlined />} loading={loading} />
    </Dropdown>
  )
}

export default PollActions