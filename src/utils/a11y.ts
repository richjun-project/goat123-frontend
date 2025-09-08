// 접근성 유틸리티 함수들

/**
 * 스크린 리더를 위한 실시간 알림
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.style.position = 'absolute'
  announcement.style.left = '-10000px'
  announcement.style.width = '1px'
  announcement.style.height = '1px'
  announcement.style.overflow = 'hidden'
  
  announcement.textContent = message
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * 키보드 네비게이션 헬퍼
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  callbacks: {
    onEnter?: () => void
    onSpace?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
  }
) => {
  switch (event.key) {
    case 'Enter':
      callbacks.onEnter?.()
      break
    case ' ':
      event.preventDefault()
      callbacks.onSpace?.()
      break
    case 'Escape':
      callbacks.onEscape?.()
      break
    case 'ArrowUp':
      event.preventDefault()
      callbacks.onArrowUp?.()
      break
    case 'ArrowDown':
      event.preventDefault()
      callbacks.onArrowDown?.()
      break
    case 'ArrowLeft':
      callbacks.onArrowLeft?.()
      break
    case 'ArrowRight':
      callbacks.onArrowRight?.()
      break
  }
}

/**
 * 포커스 트랩 (모달 등에서 사용)
 */
export const trapFocus = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable?.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable?.focus()
        e.preventDefault()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)
  firstFocusable?.focus()

  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * 색상 대비 체크
 */
export const checkColorContrast = (foreground: string, background: string): boolean => {
  // 간단한 명도 대비 체크 (실제로는 더 복잡한 계산 필요)
  const getLuminance = (color: string) => {
    const rgb = color.match(/\d+/g)
    if (!rgb) return 0
    const [r, g, b] = rgb.map(Number)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }
  
  const fgLuminance = getLuminance(foreground)
  const bgLuminance = getLuminance(background)
  const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)
  
  return contrast >= 4.5 // WCAG AA 기준
}

export default {
  announceToScreenReader,
  handleKeyboardNavigation,
  trapFocus,
  checkColorContrast
}