import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Result, Button } from 'antd'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 50 }}>
          <Result
            status="error"
            title="앱 로딩 중 오류가 발생했습니다"
            subTitle={
              <>
                <p>{this.state.error?.message}</p>
                {process.env.NODE_ENV === 'development' && (
                  <details style={{ whiteSpace: 'pre-wrap', marginTop: 20, textAlign: 'left' }}>
                    <summary>에러 상세 정보</summary>
                    <pre style={{ fontSize: 12, background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
                      {this.state.error && this.state.error.toString()}
                      <br />
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </>
            }
            extra={[
              <Button type="primary" key="home" onClick={this.handleReset}>
                홈으로 돌아가기
              </Button>,
              <Button key="refresh" onClick={() => window.location.reload()}>
                새로고침
              </Button>
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary