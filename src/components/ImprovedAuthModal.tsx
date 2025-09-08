import React, { useState } from 'react'
import { Modal, Form, Input, Button, Tabs, Space, Divider, Typography, Alert, Checkbox } from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  GoogleOutlined, 
  MessageOutlined,
  MailOutlined,
  SafetyOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import styled from 'styled-components'

const { Text, Title } = Typography

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
  }
  .ant-modal-body {
    padding: 0;
  }
`

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  text-align: center;
  color: white;
`

const ModalBody = styled.div`
  padding: 24px;
`

const SocialButton = styled(Button)`
  height: 44px;
  font-size: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const StyledInput = styled(Input)`
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  
  &:focus, &:hover {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`

const StyledPasswordInput = styled(Input.Password)`
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  
  &:focus, &:hover {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`

const PrimaryButton = styled(Button)`
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b4199 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`

const DemoInfo = styled(Alert)`
  border-radius: 8px;
  margin-bottom: 16px;
`

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialTab?: 'login' | 'signup'
}

const ImprovedAuthModal: React.FC<AuthModalProps> = ({ open, onClose, initialTab = 'login' }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loginForm] = Form.useForm()
  const [signupForm] = Form.useForm()

  const handleLogin = async (values: any) => {
    setLoading(true)
    try {
      await signIn(values.email, values.password)
      loginForm.resetFields()
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
      signupForm.resetFields()
      onClose()
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }



  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={440}
      closable={true}
      maskClosable={true}
    >
      <ModalHeader>
        <TrophyOutlined style={{ fontSize: 48, marginBottom: 8 }} />
        <Title level={3} style={{ color: 'white', margin: '8px 0 4px' }}>
          THEGOAT123
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
          최고의 선택을 찾아보세요
        </Text>
      </ModalHeader>
      
      <ModalBody>
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as 'login' | 'signup')}
          centered
          items={[
            {
              key: 'login',
              label: '로그인',
              children: (
                <>
                  <DemoInfo
                    message="빠른 시작"
                    description="Google 계정으로 간편하게 로그인하거나 새로 회원가입하세요"
                    type="info"
                    showIcon
                  />
                  <Form
                    form={loginForm}
                    layout="vertical"
                    onFinish={handleLogin}
                    autoComplete="off"
                  >
                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: '이메일을 입력해주세요' },
                        { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
                      ]}
                    >
                      <StyledInput 
                        prefix={<MailOutlined style={{ color: '#8b92a8' }} />}
                        placeholder="이메일"
                        autoComplete="email"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[
                        { required: true, message: '비밀번호를 입력해주세요' }
                      ]}
                    >
                      <StyledPasswordInput 
                        prefix={<LockOutlined style={{ color: '#8b92a8' }} />}
                        placeholder="비밀번호"
                        autoComplete="current-password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Checkbox>로그인 상태 유지</Checkbox>
                        <a style={{ color: '#667eea' }}>비밀번호 찾기</a>
                      </Space>
                    </Form.Item>

                    <Form.Item>
                      <PrimaryButton 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={loading}
                      >
                        로그인
                      </PrimaryButton>
                    </Form.Item>

                    <Divider style={{ margin: '16px 0' }}>
                      <Text type="secondary">간편 로그인</Text>
                    </Divider>

                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <SocialButton 
                        block 
                        icon={<GoogleOutlined />}
                        onClick={handleGoogleLogin}
                        loading={loading}
                        style={{ 
                          background: '#fff', 
                          border: '1px solid #dadce0',
                          color: '#3c4043'
                        }}
                      >
                        Google로 계속하기
                      </SocialButton>
                    </Space>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                      <Text type="secondary">
                        아직 회원이 아니신가요?{' '}
                        <a 
                          onClick={() => setActiveTab('signup')}
                          style={{ color: '#667eea', fontWeight: 600 }}
                        >
                          회원가입
                        </a>
                      </Text>
                    </div>
                  </Form>
                </>
              )
            },
            {
              key: 'signup',
              label: '회원가입',
              children: (
                <Form
                  form={signupForm}
                  layout="vertical"
                  onFinish={handleSignUp}
                  autoComplete="off"
                >
                  <Form.Item
                    name="name"
                    rules={[
                      { required: true, message: '이름을 입력해주세요' },
                      { min: 2, message: '이름은 2자 이상이어야 합니다' }
                    ]}
                  >
                    <StyledInput 
                      prefix={<UserOutlined style={{ color: '#8b92a8' }} />}
                      placeholder="이름"
                      autoComplete="name"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '이메일을 입력해주세요' },
                      { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
                    ]}
                  >
                    <StyledInput 
                      prefix={<MailOutlined style={{ color: '#8b92a8' }} />}
                      placeholder="이메일"
                      autoComplete="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '비밀번호를 입력해주세요' },
                      { min: 6, message: '비밀번호는 6자 이상이어야 합니다' },
                      { 
                        pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])/,
                        message: '비밀번호는 영문과 숫자를 포함해야 합니다'
                      }
                    ]}
                  >
                    <StyledPasswordInput 
                      prefix={<LockOutlined style={{ color: '#8b92a8' }} />}
                      placeholder="비밀번호 (영문+숫자 6자 이상)"
                      autoComplete="new-password"
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
                    <StyledPasswordInput 
                      prefix={<SafetyOutlined style={{ color: '#8b92a8' }} />}
                      placeholder="비밀번호 확인"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    name="agree"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value ? Promise.resolve() : Promise.reject(new Error('약관에 동의해주세요')),
                      },
                    ]}
                  >
                    <Checkbox>
                      <Text type="secondary">
                        <a style={{ color: '#667eea' }}>이용약관</a> 및{' '}
                        <a style={{ color: '#667eea' }}>개인정보처리방침</a>에 동의합니다
                      </Text>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <PrimaryButton 
                      type="primary" 
                      htmlType="submit" 
                      block 
                      loading={loading}
                    >
                      회원가입
                    </PrimaryButton>
                  </Form.Item>

                  <Divider style={{ margin: '16px 0' }}>
                    <Text type="secondary">또는</Text>
                  </Divider>

                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <SocialButton 
                      block 
                      icon={<GoogleOutlined />}
                      onClick={handleGoogleLogin}
                      loading={loading}
                      style={{ 
                        background: '#fff', 
                        border: '1px solid #dadce0',
                        color: '#3c4043'
                      }}
                    >
                      Google로 간편 가입
                    </SocialButton>
                  </Space>

                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Text type="secondary">
                      이미 계정이 있으신가요?{' '}
                      <a 
                        onClick={() => setActiveTab('login')}
                        style={{ color: '#667eea', fontWeight: 600 }}
                      >
                        로그인
                      </a>
                    </Text>
                  </div>
                </Form>
              )
            }
          ]}
        />
      </ModalBody>
    </StyledModal>
  )
}

export default ImprovedAuthModal