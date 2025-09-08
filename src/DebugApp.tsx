import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function DebugApp() {
  const [status, setStatus] = useState('Loading...')
  const [polls, setPolls] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        setStatus('Connecting to Supabase...')
        
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .limit(3)
        
        if (error) {
          setError(`Database error: ${error.message}`)
          setStatus('Error!')
        } else {
          setPolls(data || [])
          setStatus(`Success! Found ${data?.length || 0} polls`)
        }
      } catch (err: any) {
        setError(`Connection error: ${err.message}`)
        setStatus('Failed!')
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>🔍 Debug Mode</h1>
      <p>Status: <strong>{status}</strong></p>
      
      {error && (
        <div style={{ background: '#fee', padding: 10, borderRadius: 5, margin: '10px 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {polls.length > 0 && (
        <div>
          <h2>Polls found:</h2>
          <ul>
            {polls.map(poll => (
              <li key={poll.id}>
                {poll.title} ({poll.poll_type})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <hr />
      <p>Environment:</p>
      <ul>
        <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
        <li>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
      </ul>
    </div>
  )
}

export default DebugApp