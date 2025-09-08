import React, { createContext, useContext, useEffect, useState } from 'react'
import { ConfigProvider, theme } from 'antd'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString())
    
    // HTML 요소에 dark 클래스 추가/제거
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#141414'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f0f2f5'
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
            ...(isDarkMode && {
              colorBgContainer: '#1f1f1f',
              colorBgElevated: '#2a2a2a',
              colorBgLayout: '#141414',
            })
          }
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeContext