import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { message } from 'antd'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // users 테이블에 프로필 생성/업데이트
        createOrUpdateUserProfile(session.user)
      }
      setLoading(false)
    })

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        createOrUpdateUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // users 테이블에 프로필 생성/업데이트
  const createOrUpdateUserProfile = async (user: User) => {
    try {
      // 먼저 사용자가 존재하는지 확인
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116는 "no rows returned" 에러
        console.error('Error checking user existence:', selectError)
        return
      }

      // 사용자가 없으면 생성, 있으면 업데이트
      if (!existingUser) {
        // INSERT 시도
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
          
          // RLS 정책 문제일 경우, 서비스 키로 재시도 필요 (백엔드에서 처리하도록 권장)
          // 여기서는 로그만 남김
          if (insertError.code === '42501') {
            console.log('RLS policy issue - user profile creation may need to be handled server-side')
          }
        }
      } else {
        // UPDATE 시도
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error)
    }
  }

  // 이메일/비밀번호로 로그인
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      message.success('로그인되었습니다')
    } catch (error: any) {
      message.error(error.message || '로그인에 실패했습니다')
      throw error
    }
  }

  // 회원가입
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          },
          emailRedirectTo: window.location.origin
        }
      })
      if (error) throw error
      
      // 회원가입 후 자동 로그인
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) {
          message.warning('회원가입은 완료되었습니다. 로그인해주세요.')
        } else {
          message.success('회원가입이 완료되었습니다!')
        }
      }
    } catch (error: any) {
      message.error(error.message || '회원가입에 실패했습니다')
      throw error
    }
  }

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error: any) {
      message.error(error.message || 'Google 로그인에 실패했습니다')
      throw error
    }
  }


  // 로그아웃
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      message.success('로그아웃되었습니다')
    } catch (error: any) {
      message.error(error.message || '로그아웃에 실패했습니다')
      throw error
    }
  }

  // 프로필 업데이트
  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      
      // Auth 메타데이터도 업데이트
      await supabase.auth.updateUser({
        data: { ...data }
      })

      message.success('프로필이 업데이트되었습니다')
    } catch (error: any) {
      message.error(error.message || '프로필 업데이트에 실패했습니다')
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}