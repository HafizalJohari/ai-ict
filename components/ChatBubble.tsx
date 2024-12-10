'use client'

import { useState } from 'react'
import { X, Send, Loader2, MessageCircle } from 'lucide-react'
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
    <div className="fixed bottom-12 left-12 flex items-end">
      {showAlert && (
        <div className="absolute bottom-32 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-6 flex items-center gap-6 mb-4">
          <div className="relative">
            <Image
              src="/media/sara.png"
              alt="Sara AI Assistant"
              width={72}
              height={72}
              className="rounded-full ring-2 ring-white/50"
              priority
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg text-white font-medium">Perlukan bantuan?</p>
            <Button 
              variant="default" 
              className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full flex items-center gap-3 px-6 py-4 text-base border border-white/30"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-5 w-5" />
              Chat dengan Sara
            </Button>
          </div>
          {/* Triangle pointer */}
          <div className="absolute -bottom-3 left-16 w-6 h-6 bg-white/20 backdrop-blur-lg border-r border-b border-white/30 transform rotate-45" />
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        setShowAlert(false)
      }}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="h-36 w-36 rounded-full shadow-2xl bg-white/20 hover:bg-white/30 backdrop-blur-lg transition-all duration-300 hover:scale-110 p-0 overflow-hidden border border-white/30"
            onMouseEnter={() => setShowAlert(true)}
            onMouseLeave={() => !isOpen && setShowAlert(false)}
          >
            <Image
              src="/media/sara.png"
              alt="Sara AI Assistant"
              width={128}
              height={128}
              className="object-cover rounded-full ring-4 ring-white/50"
              priority
            />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <Image
                src="/media/sara.png"
                alt="Sara AI Assistant"
                width={32}
                height={32}
                className="rounded-full"
                priority
              />
              <span className="text-xl font-medium">Sara - Pembantu Pintar ICT PPD JB</span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-lg">
                 <h3 className="text-xl">Salam! Saya Sara, pembantu pintar di ICT PPD JB. Boleh saya bantu?</h3>
                 <br></br><br></br><p className="text-sm">Penafian: Seperti AI lain, Sara boleh melakukan kesilapan. Sila semak maklumat penting. Segala maklumat diperoleh melalui chatbot AI ini adalah bagi tujuan panduan umum sahaja dan bukan pandangan profesional. <br></br><br></br> Pihak PPDJB tidak akan bertanggungjawab atas sebarang kesilapan atau kesan yang timbul daripada penggunaan maklumat ini.</p>
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
                      className={`rounded-xl px-6 py-4 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-base whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-6 py-4 bg-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-6">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Taip mesej anda..."
                className="min-h-[80px] max-h-[160px] text-base"
              />
              <Button
                size="icon"
                className="h-12 w-12"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Tekan Enter untuk hantar, Shift + Enter untuk baris baru
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 