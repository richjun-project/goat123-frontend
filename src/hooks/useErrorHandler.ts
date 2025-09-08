import { useCallback } from 'react'
import { message } from 'antd'

interface ErrorOptions {
  silent?: boolean
  fallbackMessage?: string
  onError?: (error: Error) => void
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, options: ErrorOptions = {}) => {
    const { silent = false, fallbackMessage = '오류가 발생했습니다', onError } = options
    
    console.error('Error caught:', error)
    
    if (onError) {
      onError(error as Error)
    }
    
    if (!silent) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : fallbackMessage
      
      // Supabase 에러 처리
      if (errorMessage.includes('duplicate key')) {
        message.error('이미 존재하는 데이터입니다')
      } else if (errorMessage.includes('violates foreign key')) {
        message.error('참조하는 데이터가 존재하지 않습니다')
      } else if (errorMessage.includes('JWT')) {
        message.error('인증이 만료되었습니다. 다시 로그인해주세요')
      } else if (errorMessage.includes('Network')) {
        message.error('네트워크 연결을 확인해주세요')
      } else {
        message.error(errorMessage)
      }
    }
  }, [])
  
  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: ErrorOptions
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      try {
        return await fn(...args)
      } catch (error) {
        handleError(error, options)
        return undefined
      }
    }
  }, [handleError])
  
  return { handleError, wrapAsync }
}

export default useErrorHandler