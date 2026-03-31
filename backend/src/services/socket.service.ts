// src/services/socket.service.ts
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const setupSocketHandlers = (io: Server) => {
  // Authentification WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Token manquant.'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      socket.data.userId = decoded.id
      next()
    } catch {
      next(new Error('Token invalide.'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    console.log(`[Socket] User connecté : ${userId}`)

    // Rejoindre sa salle personnelle
    socket.join(`user:${userId}`)

    // Rejoindre une conversation
    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conv:${conversationId}`)
    })

    // Envoyer un message
    socket.on('message:send', async (data: {
      conversationId: string
      content: string
      attachmentUrl?: string
    }) => {
      try {
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            attachmentUrl: data.attachmentUrl,
          },
          include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        })

        // Diffuser à tous dans la conversation
        io.to(`conv:${data.conversationId}`).emit('message:new', message)

        // Notifier le destinataire même s'il n'est pas dans la conv
        const conversation = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
        })
        if (conversation) {
          const recipientId =
            conversation.userAId === userId
              ? conversation.userBId
              : conversation.userAId
          io.to(`user:${recipientId}`).emit('notification:message', {
            conversationId: data.conversationId,
            senderId: userId,
            preview: data.content.substring(0, 60),
          })
        }
      } catch (err) {
        socket.emit('error', { message: 'Erreur envoi message.' })
      }
    })

    // Indicateur "en train d'écrire..."
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('typing:update', {
        userId,
        typing: true,
      })
    })

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('typing:update', {
        userId,
        typing: false,
      })
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] User déconnecté : ${userId}`)
    })
  })
}
