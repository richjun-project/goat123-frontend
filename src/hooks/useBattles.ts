import { useState, useEffect } from 'react'
import type { Battle } from '../types'
import { battleService, subscribeToAllBattles, subscribeToRealtimeUpdates } from '../services/battles'

// 모든 배틀 가져오기
export const useBattles = (category?: string) => {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        setLoading(true)
        const data = await battleService.getAllBattles(category)
        setBattles(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchBattles()

    // Realtime 구독
    const subscription = subscribeToAllBattles((updatedBattles) => {
      if (category && category !== 'all') {
        setBattles(updatedBattles.filter(b => b.category === category))
      } else {
        setBattles(updatedBattles)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [category])

  return { battles, loading, error }
}

// HOT 배틀 가져오기
export const useHotBattle = () => {
  const [battle, setBattle] = useState<Battle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchHotBattle = async () => {
      try {
        setLoading(true)
        const data = await battleService.getHotBattle()
        setBattle(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchHotBattle()

    // 30초마다 HOT 배틀 업데이트 체크
    const interval = setInterval(fetchHotBattle, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!battle) return

    // Realtime 구독
    const subscription = subscribeToRealtimeUpdates(battle.id, (updatedBattle) => {
      setBattle(updatedBattle)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [battle?.id])

  return { battle, loading, error }
}

// TOP 3 배틀 가져오기
export const useTopBattles = () => {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTopBattles = async () => {
      try {
        setLoading(true)
        const data = await battleService.getTopBattles()
        setBattles(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopBattles()

    // 1분마다 TOP 3 업데이트
    const interval = setInterval(fetchTopBattles, 60000)

    return () => clearInterval(interval)
  }, [])

  return { battles, loading, error }
}

// 특정 배틀 가져오기
export const useBattle = (id: string) => {
  const [battle, setBattle] = useState<Battle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        setLoading(true)
        const data = await battleService.getBattleById(id)
        setBattle(data)
        
        // 조회수 증가
        await battleService.incrementViewCount(id)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchBattle()
  }, [id])

  useEffect(() => {
    if (!battle) return

    // Realtime 구독
    const subscription = subscribeToRealtimeUpdates(battle.id, (updatedBattle) => {
      setBattle(updatedBattle)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [battle?.id])

  return { battle, loading, error }
}