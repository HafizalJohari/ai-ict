'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Newspaper, Video } from "lucide-react"
import { useStore } from "@/lib/store"

export default function MediaSettings() {
  const { newsSettings, videoSettings, updateNewsSettings, updateVideoSettings } = useStore()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2 text-slate-950">
            <Newspaper className="h-6 w-6" />
            News Feed Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="news-enabled">Enable News Feed</Label>
            <Switch
              id="news-enabled"
              checked={newsSettings.enabled}
              onCheckedChange={(checked) => updateNewsSettings({ enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-scroll">Auto Scroll</Label>
            <Switch
              id="auto-scroll"
              checked={newsSettings.autoScroll}
              onCheckedChange={(checked) => updateNewsSettings({ autoScroll: checked })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Refresh Interval (minutes)</Label>
              <span className="text-sm text-muted-foreground">{newsSettings.refreshInterval} min</span>
            </div>
            <Slider
              value={[newsSettings.refreshInterval]}
              onValueChange={([value]) => updateNewsSettings({ refreshInterval: value })}
              min={1}
              max={30}
              step={1}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Display Count</Label>
              <span className="text-sm text-muted-foreground">{newsSettings.displayCount} news</span>
            </div>
            <Slider
              value={[newsSettings.displayCount]}
              onValueChange={([value]) => updateNewsSettings({ displayCount: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2 text-slate-950">
            <Video className="h-6 w-6" />
            Video Feed Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="video-enabled">Enable Video Feed</Label>
            <Switch
              id="video-enabled"
              checked={videoSettings.enabled}
              onCheckedChange={(checked) => updateVideoSettings({ enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-url">Video URL</Label>
            <Input
              id="embed-url"
              placeholder="Enter YouTube video URL"
              value={videoSettings.embedUrl}
              onChange={(e) => updateVideoSettings({ embedUrl: e.target.value })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Paste a YouTube video URL (e.g., https://www.youtube.com/watch?v=xxxxx)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay">Autoplay</Label>
            <Switch
              id="autoplay"
              checked={videoSettings.autoplay}
              onCheckedChange={(checked) => updateVideoSettings({ autoplay: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 