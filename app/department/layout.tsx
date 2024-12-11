'use client'

import { useStore } from '@/lib/store'
import ChatBubble from '@/components/ChatBubble'

export default function DepartmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { chatBubbleSize } = useStore()

  return (
    <div className="min-h-screen bg-black">
      {children}
      <ChatBubble size={chatBubbleSize} />
    </div>
  )
} 