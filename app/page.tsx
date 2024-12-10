import StaffPresence from '@/components/StaffPresence'
import ActivitySchedule from '@/components/ActivitySchedule'
import Announcements from '@/components/Announcements'
import AssetManagement from '@/components/AssetManagement'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Department Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">Staff Presence</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffPresence />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">Activity Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivitySchedule />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <Announcements />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">Asset Management</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetManagement />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

