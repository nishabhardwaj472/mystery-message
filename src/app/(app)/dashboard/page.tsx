'use client'

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { acceptingMessageSchema } from "@/schemas/acceptingMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type Message = {
  _id: string
  content: string
  createdAt: string
}

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [profileUrl, setProfileUrl] = useState("")

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptingMessageSchema)
  })

  const { register, watch, setValue, getValues } = form
  const acceptMessages = watch("acceptMessages")

  const fetchAcceptMessage = useCallback(async () => {
    if (!session) return
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages", { withCredentials: true })

      // ✅ Only set once on first load
      if (getValues("acceptMessages") === undefined) {
        setValue("acceptMessages", response.data.isAcceptingMessages ?? false)
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Error", {
        description: axiosError.response?.data.message || "Failed to fetch message settings"
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue, getValues, session])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    if (!session) return
    setIsLoading(true)
    setIsSwitchLoading(false)

    try {
      const response = await axios.get<ApiResponse>("/api/get-messages", { withCredentials: true })

      let fetchedMessages: Message[] = (response.data.messages || []).map((msg: any) => ({
        _id: String(msg._id),
        content: String(msg.content),
        createdAt: new Date(msg.createdAt).toISOString(),
      }))

      fetchedMessages = fetchedMessages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setMessages(fetchedMessages)

      if (refresh) {
        toast.success("Refreshed Messages", {
          description: "Showing latest messages"
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Error", {
        description: axiosError.response?.data.message || "Failed to fetch messages"
      })
    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (!session || !session.user) return
    fetchAcceptMessage()
    fetchMessages()
  }, [session, fetchAcceptMessage, fetchMessages])

  useEffect(() => {
    if (typeof window !== "undefined" && session?.user) {
      const username = (session.user as User)?.username || ""
      const baseUrl = `${window.location.protocol}//${window.location.host}`
      setProfileUrl(`${baseUrl}/u/${username}`)
    }
  }, [session])

  const handleSwitchChange = async () => {
    try {
      const newValue = !acceptMessages
      setValue("acceptMessages", newValue) // Update UI immediately
      const response = await axios.post<ApiResponse>(
        "/api/accept-messages",
        { acceptMessages: newValue },
        { withCredentials: true }
      )
      toast.success(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Error", {
        description: axiosError.response?.data.message || "Failed to update message settings"
      })
    }
  }

  const copyToClipboard = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl)
      toast.success("URL copied", {
        description: "Profile URL has been copied to clipboard"
      })
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message._id !== messageId))
  }

  if (!session || !session.user) {
    return <div>Please Login</div>
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault()
          fetchMessages(true)
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default Page
