import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import TestPage from './pages/TestPage'
import 'antd/dist/reset.css'

function SimpleApp() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TestPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default SimpleApp