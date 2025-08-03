'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/ApiResponse'
import { Button } from '@/components/ui/button'

export default function SendMessagePage() {
  const { username } = useParams<{ username: string }>()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [acceptingMessages, setAcceptingMessages] = useState<boolean | null>(null)

  useEffect(() => {
    if (!username) return
    // Fetch status only once
    if (acceptingMessages === null) {
      axios.get<ApiResponse>(`/api/user-status/${username}`)
        .then(res => setAcceptingMessages(res.data.isAcceptingMessages ?? false))
        .catch(() => setAcceptingMessages(false))
    }
  }, [username, acceptingMessages])

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post<ApiResponse>('/api/send-messages', {
        username,
        content: message,
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Message sent successfully')
        setMessage('')
      } else {
        toast.error(response.data.message || 'Failed to send message')
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(
        axiosError.response?.data.message || 'Something went wrong'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (acceptingMessages === false) {
    return <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold">This user is not accepting messages</h1>
    </div>
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Send a message to {username}</h1>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Write your message..."
        className="w-full border rounded p-2 mb-4"
      />
      <Button onClick={handleSendMessage} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>
    </div>
  )
}
