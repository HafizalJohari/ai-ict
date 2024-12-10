'use client'

export default function DepartmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  )
} 