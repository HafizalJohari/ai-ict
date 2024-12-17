import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Announcements from '@/components/Announcements'

export default function AnnouncementsPage() {
  return (
    <main className="w-full p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary text-slate-950">Announcements</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary text-slate-950">Department Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <Announcements />
        </CardContent>
      </Card>
    </main>
  )
}

