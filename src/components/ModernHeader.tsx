import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Input, Badge, Avatar, Dropdown, Menu } from 'antd'
import logoImg from '../assets/logo.png'
import { 
  SearchOutlined, 
  PlusOutlined, 
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  StarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import NotificationDropdown from './NotificationDropdown'
import styled from 'styled-components'

const { Search } = Input

// Styled Components
const HeaderWrapper = styled(motion.header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 2rem;
  transition: all 0.3s var(--ease-out-expo);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const HeaderContainer = styled.div<{ $scrolled: boolean }>`
  max-width: 1400px;
  margin: 0 auto;
  background: ${props => props.$scrolled 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${props => props.$scrolled ? '100px' : '24px'};
  padding: ${props => props.$scrolled ? '0.5rem 1.5rem' : '0.75rem 1.5rem'};
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  transition: all 0.3s var(--ease-out-expo);

  .dark & {
    background: ${props => props.$scrolled 
      ? 'rgba(26, 26, 26, 0.8)' 
      : 'rgba(26, 26, 26, 0.95)'};
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
`

const LogoSection = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
`

const LogoIcon = styled(motion.div)`
  width: 40px;
  height: 40px;
  background: var(--gradient-aurora);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
  }

  span {
    position: relative;
    z-index: 1;
  }
`

const LogoText = styled.h1`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  background: var(--gradient-aurora);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  
  @media (max-width: 576px) {
    display: none;
  }
`

const SearchSection = styled.div`
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const StyledSearch = styled(Search)`
  &.ant-input-search {
    .ant-input-wrapper {
      display: flex;
      align-items: center;
      
      .ant-input-affix-wrapper {
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 100px;
        padding: 0 1rem;
        height: 40px;
        flex: 1;
        transition: all 0.2s ease;
        
        &:hover {
          background: rgba(0, 0, 0, 0.06);
          border-color: #8B5CF6;
        }
        
        &:focus-within {
          background: white;
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        input {
          background: transparent;
          font-weight: 500;
          height: 38px;
          line-height: 38px;
          
          &::placeholder {
            color: rgba(0, 0, 0, 0.4);
          }
        }
      }
      
      .ant-input-group-addon {
        background: transparent;
        border: none;
        padding: 0;
        margin-left: 8px;
        
        .ant-input-search-button {
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border: none;
          border-radius: 100px;
          height: 40px;
          width: 40px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          
          &:hover {
            transform: scale(1.05);
          }
          
          .anticon {
            color: white;
            font-size: 16px;
          }
        }
      }
    }
  }

  .dark & {
    .ant-input-affix-wrapper {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      
      &:focus-within {
        background: var(--dark-surface);
      }
      input {
        color: white;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
`

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const CreateButton = styled(motion.button)`
  background: var(--gradient-aurora);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.2s var(--ease-out-expo);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
    
    &::before {
      transform: translateX(100%);
    }
  }
  
  @media (max-width: 992px) {
    padding: 0.625rem;
    
    span {
      display: none;
    }
  }
`

const IconButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s var(--ease-out-expo);
  position: relative;
  
  &:hover {
    background: white;
    border-color: var(--color-primary-light);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .dark & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: white;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`

const NotificationBadge = styled(Badge)`
  .ant-badge-dot {
    background: var(--color-secondary);
    box-shadow: 0 0 0 2px white;
  }
`

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  border: 2px solid transparent;
  background: var(--gradient-aurora);
  transition: all 0.2s var(--ease-out-expo);
  
  &:hover {
    border-color: var(--color-primary);
    transform: scale(1.05);
  }
`

const MobileMenuButton = styled(IconButton)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
  }
`

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 999;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .dark & {
    background: rgba(15, 15, 15, 0.98);
  }
`

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const MobileSearchSection = styled.div`
  width: 100%;
`

const MobileMenuItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const MobileMenuItem = styled(motion.button)`
  background: rgba(0, 0, 0, 0.04);
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s var(--ease-out-expo);
  
  &:hover {
    background: rgba(139, 92, 246, 0.1);
    transform: translateX(8px);
  }

  .dark & {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    
    &:hover {
      background: rgba(139, 92, 246, 0.2);
    }
  }
`

interface ModernHeaderProps {
  onMenuClick?: () => void
  showAuthModal?: () => void
}

const ModernHeader: React.FC<ModernHeaderProps> = ({ showAuthModal }) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -10])
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.98])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`)
      setSearchValue('')
      setMobileMenuOpen(false)
    }
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/mypage')}>
        마이페이지
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={signOut}>
        로그아웃
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <HeaderWrapper
        style={{ y: headerY, opacity: headerOpacity }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      >
        <HeaderContainer $scrolled={scrolled}>
          <LogoSection
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src={logoImg} alt="THEGOAT123" style={{ height: '40px', width: 'auto' }} />
            <LogoText>THEGOAT123</LogoText>
          </LogoSection>

          <SearchSection>
            <StyledSearch
              placeholder="투표 검색..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </SearchSection>

          <ActionsSection>
            <CreateButton
              onClick={() => navigate('/create-poll')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StarOutlined />
              <span>투표 만들기</span>
            </CreateButton>

            {user ? (
              <>
                <NotificationDropdown />
                
                <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
                  <UserAvatar 
                    src={user.user_metadata?.avatar_url}
                    icon={!user.user_metadata?.avatar_url && <UserOutlined />}
                  >
                    {!user.user_metadata?.avatar_url && user.email?.[0]?.toUpperCase()}
                  </UserAvatar>
                </Dropdown>
              </>
            ) : (
              <CreateButton
                onClick={showAuthModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'white', color: 'var(--color-primary)', border: '2px solid var(--color-primary)' }}
              >
                로그인
              </CreateButton>
            )}

            <MobileMenuButton 
              onClick={() => setMobileMenuOpen(true)}
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
            >
              <MenuOutlined />
            </MobileMenuButton>
          </ActionsSection>
        </HeaderContainer>
      </HeaderWrapper>

      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            <MobileMenuHeader>
              <LogoSection onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                <img src={logoImg} alt="THEGOAT123" style={{ height: '40px', width: 'auto' }} />
                <LogoText>THEGOAT123</LogoText>
              </LogoSection>
              
              <IconButton onClick={() => setMobileMenuOpen(false)}>
                <CloseOutlined />
              </IconButton>
            </MobileMenuHeader>

            <MobileSearchSection>
              <StyledSearch
                placeholder="투표 검색..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                size="large"
              />
            </MobileSearchSection>

            <MobileMenuItems>
              <MobileMenuItem
                onClick={() => { navigate('/create-poll'); setMobileMenuOpen(false); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusOutlined /> 투표 만들기
              </MobileMenuItem>
              
              {user ? (
                <>
                  <MobileMenuItem
                    onClick={() => { navigate('/my'); setMobileMenuOpen(false); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserOutlined /> 마이페이지
                  </MobileMenuItem>
                  <MobileMenuItem
                    onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SettingOutlined /> 설정
                  </MobileMenuItem>
                  <MobileMenuItem
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogoutOutlined /> 로그아웃
                  </MobileMenuItem>
                </>
              ) : (
                <MobileMenuItem
                  onClick={() => { showAuthModal?.(); setMobileMenuOpen(false); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: 'var(--gradient-aurora)', color: 'white' }}
                >
                  로그인 / 회원가입
                </MobileMenuItem>
              )}
            </MobileMenuItems>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  )
}

export default ModernHeader