import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, Card, Typography, Button, Space } from 'antd'
import 'antd/dist/reset.css'

const { Title, Text } = Typography

function SimplePage() {
  return (
    <div style={{ padding: 20 }}>
      <Card>
        <Title level={2}>🎉 앱이 로드되었습니다!</Title>
        <Text>React Router와 Ant Design이 정상 작동합니다.</Text>
        <br /><br />
        <Space>
          <Button type="primary" onClick={() => window.location.href = '/'}>
            새로고침
          </Button>
          <Button onClick={() => alert('Button clicked!')}>
            클릭 테스트
          </Button>
        </Space>
      </Card>
    </div>
  )
}

function MinimalApp() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<SimplePage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default MinimalApp