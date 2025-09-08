import { useState, useEffect } from 'react'
import type { Poll } from '../types'
import { pollService, subscribeToPollUpdates, subscribeToAllPolls } from '../services/polls'

// 모든 투표 가져오기
export const usePolls = (category?: string, pollType?: 'versus' | 'multiple') => {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true)
        const data = await pollService.getAllPolls(category, pollType)
        setPolls(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()

    // Realtime 구독
    const subscription = subscribeToAllPolls((updatedPolls) => {
      let filtered = updatedPolls
      
      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category)
      }
      
      if (pollType) {
        filtered = filtered.filter(p => p.poll_type === pollType)
      }
      
      setPolls(filtered)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [category, pollType])

  return { polls, loading, error }
}

// HOT 투표 가져오기
export const useHotPolls = () => {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchHotPolls = async () => {
      try {
        setLoading(true)
        const data = await pollService.getHotPolls()
        setPolls(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchHotPolls()

    // 30초마다 HOT 투표 업데이트 체크
    const interval = setInterval(fetchHotPolls, 30000)

    return () => clearInterval(interval)
  }, [])

  return { polls, loading, error }
}

// TOP 3 투표 가져오기
export const useTopPolls = () => {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTopPolls = async () => {
      try {
        setLoading(true)
        const data = await pollService.getTopPolls()
        setPolls(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopPolls()

    // 1분마다 TOP 3 업데이트
    const interval = setInterval(fetchTopPolls, 60000)

    return () => clearInterval(interval)
  }, [])

  return { polls, loading, error }
}

// 특정 투표 가져오기
export const usePoll = (id: string) => {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPoll = async (skipViewCount = false) => {
    try {
      setLoading(true)
      setError(null)
      const data = await pollService.getPollById(id)
      setPoll(data)
      
      // 첫 로드 시에만 조회수 증가
      if (!skipViewCount) {
        await pollService.incrementViewCount(id)
      }
    } catch (err) {
      console.error('Failed to fetch poll:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPoll()
  }, [id])

  useEffect(() => {
    if (!poll) return

    // Realtime 구독
    const subscription = subscribeToPollUpdates(poll.id, (updatedPoll) => {
      setPoll(updatedPoll)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [poll?.id])

  // refresh 함수 반환
  const refresh = () => fetchPoll(true)

  return { poll, loading, error, refresh }
}