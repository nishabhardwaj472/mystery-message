'use client'

import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

import { Button } from "./ui/button"
import { X } from "lucide-react"
import { ApiResponse } from "@/types/ApiResponse"
import axios from "axios"

type Message = {
  _id: string
  content: string
  createdAt: string
}

type MessageCardProps = {
  message: Message
  onMessageDelete: (messageId: string) => void
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`, {
        withCredentials: true
      })
      toast.success("Success", {
        description: response.data.message
      })
      onMessageDelete(message._id)
    } catch (error) {
      toast.error("Error deleting message")
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Message</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this message.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <p>{message.content}</p>
      </CardContent>
      <CardFooter>
        <small>{new Date(message.createdAt).toLocaleString()}</small>
      </CardFooter>
    </Card>
  )
}

export default MessageCard
