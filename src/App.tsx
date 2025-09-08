import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import UltraModernLayout from './components/UltraModernLayout'
import UltraHomePage from './pages/UltraHomePage'
import PollDetailPage from './pages/PollDetailPage'
import CreatePollPage from './pages/CreatePollPage'
import EditPollPage from './pages/EditPollPage'
import MyPage from './pages/MyPage'
import SearchPage from './pages/SearchPage'
import PollStatsPage from './pages/PollStatsPage'
import { GlobalStyles } from './styles/globalStyles'
import 'antd/dist/reset.css'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <GlobalStyles />
            <BrowserRouter>
            <Routes>
            <Route path="/" element={<UltraModernLayout />}>
              <Route index element={<UltraHomePage />} />
              <Route path="poll/:id" element={<PollDetailPage />} />
              <Route path="poll/:id/edit" element={<EditPollPage />} />
              <Route path="poll/:id/stats" element={<PollStatsPage />} />
              <Route path="create-poll" element={<CreatePollPage />} />
              <Route path="my" element={<MyPage />} />
              <Route path="mypage" element={<MyPage />} />
              <Route path="search" element={<SearchPage />} />
              {/* Legacy routes for compatibility */}
              <Route path="battle/:id" element={<PollDetailPage />} />
              <Route path="create" element={<CreatePollPage />} />
            </Route>
          </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
