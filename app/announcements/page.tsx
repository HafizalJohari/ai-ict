import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Announcements from '@/components/Announcements'

export default function AnnouncementsPage() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Announcements</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Department Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <Announcements />
        </CardContent>
      </Card>
    </main>
  )
}

