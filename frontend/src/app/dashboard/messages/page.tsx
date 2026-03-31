'use client'
// src/app/dashboard/messages/page.tsx

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/auth.store'
import { useConversation } from '@/hooks/useSocket'
import { Conversation, Message, formatDate, LISTING_TYPE_LABELS } from '@/types'
import { Send, Paperclip, ChevronLeft } from 'lucide-react'
import clsx from 'clsx'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [isTyping, setIsTyping]         = useState(false)
  const messagesEndRef                  = useRef<HTMLDivElement>(null)
  const typingTimer                     = useRef<ReturnType<typeof setTimeout>>()

  const { joinConversation, sendMessage, startTyping, stopTyping, onNewMessage, onTyping } =
    useConversation(activeConvId ?? '')

  // Charger les conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/messages/conversations')
      return data
    },
  })

  // Charger les messages d'une conversation
  const loadMessages = async (convId: string) => {
    setActiveConvId(convId)
    const { data } = await api.get(`/messages/conversations/${convId}`)
    setMessages(data)
    setTimeout(() => joinConversation(), 100)
  }

  // Écouter les nouveaux messages
  useEffect(() => {
    if (!activeConvId) return
    const off = onNewMessage((msg: Message) => {
      setMessages((prev) => [...prev, msg])
    })
    return off
  }, [activeConvId])

  // Écouter l'indicateur "en train d'écrire"
  useEffect(() => {
    if (!activeConvId) return
    const off = onTyping(({ typing }: { typing: boolean }) => {
      setIsTyping(typing)
    })
    return off
  }, [activeConvId])

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return
    sendMessage(input.trim())
    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        conversationId: activeConvId,
        senderId: user!.id,
        sender: { id: user!.id, fullName: user!.fullName, avatarUrl: user?.avatarUrl },
        content: input.trim(),
        createdAt: new Date().toISOString(),
      } as Message,
    ])
    setInput('')
    stopTyping()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    startTyping()
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => stopTyping(), 1500)
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  const getOtherUser = (conv: Conversation) =>
    conv.userAId === user?.id ? conv.userB : conv.userA

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const AVATAR_COLORS: Record<string, string> = {
    EMPLOI:   'bg-accent-50 text-accent-600',
    STAGE:    'bg-green-50 text-green-700',
    LOGEMENT: 'bg-brand-50 text-brand-600',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── LISTE CONVERSATIONS ── */}
        <div className={clsx(
          'w-full md:w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0',
          activeConvId && 'hidden md:flex'
        )}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">
                Aucune conversation pour l'instant.
              </div>
            )}
            {conversations.map((conv) => {
              const other = getOtherUser(conv)
              const lastMsg = conv.messages?.[0]
              const isActive = conv.id === activeConvId
              const typeColor = AVATAR_COLORS[conv.listing?.type ?? 'EMPLOI']

              return (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={clsx(
                    'w-full text-left p-4 flex gap-3 hover:bg-gray-50 transition-colors',
                    isActive && 'bg-brand-50'
                  )}
                >
                  {/* Avatar */}
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                    typeColor
                  )}>
                    {getInitials(other?.fullName ?? '?')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {other?.fullName}
                      </span>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatDate(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.listing && (
                        <span className="mr-1">
                          [{LISTING_TYPE_LABELS[conv.listing.type]}]
                        </span>
                      )}
                      {lastMsg?.content ?? 'Démarrer la conversation'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── FENÊTRE CHAT ── */}
        <div className={clsx(
          'flex-1 flex flex-col',
          !activeConvId && 'hidden md:flex'
        )}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                  AVATAR_COLORS[activeConv.listing?.type ?? 'EMPLOI']
                )}>
                  {getInitials(getOtherUser(activeConv)?.fullName ?? '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getOtherUser(activeConv)?.fullName}
                  </p>
                  {activeConv.listing && (
                    <p className="text-xs text-gray-400 truncate">
                      {activeConv.listing.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Contexte annonce */}
              {activeConv.listing && (
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center gap-2">
                  <span className={clsx(
                    'text-xs font-medium px-2 py-0.5 rounded',
                    AVATAR_COLORS[activeConv.listing.type]
                  )}>
                    {LISTING_TYPE_LABELS[activeConv.listing.type]}
                  </span>
                  <span className="text-xs text-gray-600 truncate">{activeConv.listing.title}</span>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id
                  return (
                    <div key={msg.id} className={clsx('flex gap-2', isMe && 'flex-row-reverse')}>
                      {/* Avatar petit */}
                      {!isMe && (
                        <div className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 self-end',
                          AVATAR_COLORS[activeConv.listing?.type ?? 'EMPLOI']
                        )}>
                          {getInitials(msg.sender?.fullName ?? '?')}
                        </div>
                      )}
                      <div className={clsx('max-w-xs', isMe && 'items-end flex flex-col')}>
                        <div className={clsx(
                          'px-3 py-2 rounded-2xl text-sm leading-relaxed',
                          isMe
                            ? 'bg-brand text-white rounded-br-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">
                          {formatDate(msg.createdAt)}
                          {isMe && msg.readAt && (
                            <span className="ml-1 text-brand-400">✓✓</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )
                })}

                {/* Indicateur "en train d'écrire" */}
                {isTyping && (
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="bg-white border-t border-gray-100 p-4">
                <div className="flex gap-2 items-end">
                  <button className="text-gray-400 hover:text-brand p-2 flex-shrink-0 transition-colors">
                    <Paperclip size={16} />
                  </button>
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={1}
                    className="flex-1 resize-none input py-2.5 text-sm"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                      input.trim()
                        ? 'bg-brand text-white hover:bg-brand-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* État vide */
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-brand" />
                </div>
                <h3 className="font-medium text-gray-700 mb-2">Vos messages</h3>
                <p className="text-sm text-gray-400">
                  Sélectionnez une conversation pour commencer à écrire.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
