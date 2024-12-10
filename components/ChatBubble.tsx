'use client'

import { useState } from 'react'
import { X, Send, Loader2, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBubble() {
  // Component enabled
  const [isEnabled] = useState(true)

  if (!isEnabled) {
    return null
  }

  const [isOpen, setIsOpen] = useState(false)
  const [showAlert, setShowAlert] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    setShowAlert(false)

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Maaf, saya menghadapi masalah. Sila cuba lagi.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="fixed bottom-6 left-6 flex items-end">
      {showAlert && (
        <div className="absolute bottom-20 bg-white rounded-3xl shadow-lg p-4 flex items-center gap-4 mb-2">
          <div className="relative">
            <Image
              src="/media/sara.png"
              alt="Sara AI Assistant"
              width={48}
              height={48}
              className="rounded-full"
              priority
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-600">Perlukan bantuan?</p>
            <Button 
              variant="default" 
              className="bg-black text-white hover:bg-black/90 rounded-full flex items-center gap-2"
              onClick={() => setIsOpen(true)}
            >
              <PhoneCall className="h-4 w-4" />
              Bercakap dengan Sara
            </Button>
          </div>
          {/* Triangle pointer */}
          <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white transform rotate-45" />
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        setShowAlert(false)
      }}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-transparent hover:bg-transparent transition-transform hover:scale-110 p-0 overflow-hidden"
            onMouseEnter={() => setShowAlert(true)}
            onMouseLeave={() => !isOpen && setShowAlert(false)}
          >
            <Image
              src="/media/sara.png"
              alt="Sara AI Assistant"
              width={56}
              height={56}
              className="object-cover"
              priority
            />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-4 py-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Image
                src="/media/sara.png"
                alt="Sara AI Assistant"
                width={24}
                height={24}
                className="rounded-full"
                priority
              />
              Sara - Pembantu ICT PPD JB
            </DialogTitle>
          </DialogHeader>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  Salam! Saya Sara, pembantu ICT PPD JB. Ada yang boleh saya bantu?
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Taip mesej anda..."
                className="min-h-[60px] max-h-[120px]"
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tekan Enter untuk hantar, Shift + Enter untuk baris baru
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 