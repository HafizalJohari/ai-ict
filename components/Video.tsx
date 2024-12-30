'use client'

import { useStore } from "@/lib/store"
import { Video as VideoIcon } from "lucide-react"

export default function Video() {
  const { videoSettings } = useStore()

  if (!videoSettings.enabled || !videoSettings.embedUrl) {
    return null
  }

  // Extract video ID from YouTube URL if it's a YouTube video
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = match?.[2]
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}${videoSettings.autoplay ? '?autoplay=1&mute=1' : ''}`
    }
    
    return url
  }

  const embedUrl = getYouTubeEmbedUrl(videoSettings.embedUrl)

  return (
    <div className="relative w-full h-full">
      <iframe
        src={embedUrl}
        className="w-full aspect-video rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
} 