// src/hooks/useSocket.ts
// Hook pour la messagerie temps réel via Socket.io

'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/lib/auth.store'

let socket: Socket | null = null

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !token || initialized.current) return

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('[Socket] Connecté')
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Déconnecté')
    })

    initialized.current = true

    return () => {
      socket?.disconnect()
      initialized.current = false
    }
  }, [isAuthenticated, token])

  return socket
}

// Hook pour une conversation spécifique
export const useConversation = (conversationId: string) => {
  const socketRef = useRef(useSocket())

  const joinConversation = () => {
    socketRef.current?.emit('join:conversation', conversationId)
  }

  const sendMessage = (content: string, attachmentUrl?: string) => {
    socketRef.current?.emit('message:send', {
      conversationId,
      content,
      attachmentUrl,
    })
  }

  const startTyping = () => {
    socketRef.current?.emit('typing:start', conversationId)
  }

  const stopTyping = () => {
    socketRef.current?.emit('typing:stop', conversationId)
  }

  const onNewMessage = (callback: (message: any) => void) => {
    socketRef.current?.on('message:new', callback)
    return () => socketRef.current?.off('message:new', callback)
  }

  const onTyping = (callback: (data: any) => void) => {
    socketRef.current?.on('typing:update', callback)
    return () => socketRef.current?.off('typing:update', callback)
  }

  return { joinConversation, sendMessage, startTyping, stopTyping, onNewMessage, onTyping }
}
