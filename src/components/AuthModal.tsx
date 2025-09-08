import React, { useState } from 'react'
import { Modal, Form, Input, Button, Tabs, Space, Divider, Typography } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Text } = Typography

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialTab?: 'login' | 'signup'
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, initialTab = 'login' }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleLogin = async (values: any) => {
    setLoading(true)
    try {
      await signIn(values.email, values.password)
      onClose()
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (values: any) => {
    setLoading(true)
    try {
      await signUp(values.email, values.password, values.name)
      onClose()
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
      onClose()
    } catch (error) {
      // Error handled in context
    }
  }


  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => setActiveTab(key as 'login' | 'signup')}
        centered
        items={[
          {
            key: 'login',
            label: '로그인',
            children: (
              <Form
                layout="vertical"
                onFinish={handleLogin}
                style={{ marginTop: 20 }}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '이메일을 입력해주세요' },
                    { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />}
                    placeholder="이메일"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '비밀번호를 입력해주세요' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="비밀번호"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    size="large"
                    loading={loading}
                  >
                    로그인
                  </Button>
                </Form.Item>

                <Divider>또는</Divider>

                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    block 
                    size="large"
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                    style={{ background: '#fff', borderColor: '#dadce0' }}
                  >
                    Google로 계속하기
                  </Button>
                </Space>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Text type="secondary">
                    계정이 없으신가요?{' '}
                    <a onClick={() => setActiveTab('signup')}>회원가입</a>
                  </Text>
                </div>
              </Form>
            )
          },
          {
            key: 'signup',
            label: '회원가입',
            children: (
              <Form
                layout="vertical"
                onFinish={handleSignUp}
                style={{ marginTop: 20 }}
              >
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: '이름을 입력해주세요' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />}
                    placeholder="이름"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '이메일을 입력해주세요' },
                    { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />}
                    placeholder="이메일"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '비밀번호를 입력해주세요' },
                    { min: 6, message: '비밀번호는 6자 이상이어야 합니다' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="비밀번호 (6자 이상)"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '비밀번호를 다시 입력해주세요' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('비밀번호가 일치하지 않습니다'))
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="비밀번호 확인"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    size="large"
                    loading={loading}
                  >
                    회원가입
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">
                    이미 계정이 있으신가요?{' '}
                    <a onClick={() => setActiveTab('login')}>로그인</a>
                  </Text>
                </div>
              </Form>
            )
          }
        ]}
      />
    </Modal>
  )
}

export default AuthModal