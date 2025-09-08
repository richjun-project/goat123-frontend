import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Badge } from 'antd'
import { 
  HomeOutlined, 
  PlusCircleOutlined, 
  SearchOutlined, 
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'

const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: none;
  z-index: 1000;
  padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  &.dark {
    background: #1f1f1f;
    border-top-color: #303030;
  }
`

const NavItem = styled.div<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  color: ${props => props.$active ? '#1890ff' : '#8c8c8c'};
  
  &:active {
    transform: scale(0.95);
  }

  .anticon {
    font-size: 20px;
    margin-bottom: 2px;
    transition: transform 0.3s ease;
  }

  &:hover .anticon {
    transform: translateY(-2px);
  }

  span {
    font-size: 11px;
    font-weight: ${props => props.$active ? '600' : '400'};
  }

  ${props => props.$active && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 20%;
      right: 20%;
      height: 2px;
      background: #1890ff;
      border-radius: 0 0 2px 2px;
    }
  `}
`

const CreateButton = styled.div`
  position: relative;
  
  .create-icon {
    font-size: 32px;
    color: #1890ff;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    transition: all 0.3s ease;
  }
  
  &:active .create-icon {
    transform: scale(0.9);
  }
`

interface NavItemData {
  key: string
  path: string
  icon: React.ReactNode
  label: string
}

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const navItems: NavItemData[] = [
    { key: 'home', path: '/', icon: <HomeOutlined />, label: '홈' },
    { key: 'search', path: '/search', icon: <SearchOutlined />, label: '검색' },
    { key: 'create', path: '/create-poll', icon: <PlusCircleOutlined className="create-icon" />, label: '만들기' },
    { key: 'ranking', path: '/ranking', icon: <TrophyOutlined />, label: '랭킹' },
    { key: 'my', path: '/my', icon: <UserOutlined />, label: '마이' }
  ]

  const handleNavClick = (path: string) => {
    if (path === '/my' && !user) {
      // 로그인이 필요한 페이지
      const authModal = document.querySelector('[data-auth-modal-trigger]') as HTMLElement
      if (authModal) authModal.click()
      return
    }
    navigate(path)
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <NavContainer className={document.body.classList.contains('dark') ? 'dark' : ''}>
      {navItems.map((item) => (
        <NavItem
          key={item.key}
          $active={isActive(item.path)}
          onClick={() => handleNavClick(item.path)}
        >
          {item.key === 'create' ? (
            <CreateButton>
              {item.icon}
            </CreateButton>
          ) : (
            <>
              {item.key === 'my' && user ? (
                <Badge dot offset={[-4, 4]}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
              <span>{item.label}</span>
            </>
          )}
        </NavItem>
      ))}
    </NavContainer>
  )
}

export default MobileBottomNav