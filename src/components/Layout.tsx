import React from 'react'
import { Layout, Typography, Space, Button, Avatar, Dropdown, Menu, Switch } from 'antd'
import { TrophyOutlined, FireOutlined, UserOutlined, SearchOutlined, PlusOutlined, LogoutOutlined, SettingOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationDropdown from './NotificationDropdown'
import ImprovedAuthModal from './ImprovedAuthModal'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

const AppLayout: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const [showAuthModal, setShowAuthModal] = React.useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          background: '#fff', 
          padding: '0 50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Space 
          align="center" 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <TrophyOutlined style={{ fontSize: 28, color: '#faad14' }} />
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            THEGOAT123
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            근본 투표 배틀
          </Text>
        </Space>
        
        <Space size="middle">
          <Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
          />
          
          <Button 
            type="text" 
            icon={<SearchOutlined />}
            onClick={() => navigate('/search')}
          >
            검색
          </Button>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/create-poll')}
          >
            투표 만들기
          </Button>
          
          {user ? (
            <>
              <NotificationDropdown />
              
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item 
                      key="mypage"
                      icon={<UserOutlined />}
                      onClick={() => navigate('/my')}
                    >
                      마이페이지
                    </Menu.Item>
                    <Menu.Item 
                      key="settings"
                      icon={<SettingOutlined />}
                      onClick={() => navigate('/settings')}
                    >
                      설정
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      key="logout"
                      icon={<LogoutOutlined />}
                      onClick={signOut}
                    >
                      로그아웃
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomRight"
              >
                <Avatar 
                  src={(user as any).avatar_url}
                  icon={!(user as any).avatar_url && <UserOutlined />}
                  style={{ cursor: 'pointer' }}
                >
                  {!(user as any).avatar_url && (user as any).name?.[0]}
                </Avatar>
              </Dropdown>
            </>
          ) : (
            <Button type="primary" onClick={() => setShowAuthModal(true)}>
              로그인
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        <Space direction="vertical" size={0}>
          <Text type="secondary">
            THEGOAT123 - Greatest Of All Time 투표 배틀
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © 2025 THEGOAT123. 모든 투표는 익명으로 진행됩니다.
          </Text>
        </Space>
      </Footer>
      
      <ImprovedAuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </Layout>
  )
}

export default AppLayout