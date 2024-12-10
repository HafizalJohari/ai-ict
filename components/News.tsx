'use client'

import { useState, useEffect } from 'react'
import { Newspaper, ExternalLink, Loader2, Laptop, GraduationCap } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
}

export default function News() {
  const [techNews, setTechNews] = useState<NewsItem[]>([])
  const [eduNews, setEduNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true)
        
        // Fetch technology news
        const techResponse = await fetch('https://newsapi.org/v2/top-headlines?' + new URLSearchParams({
          country: 'us',
          category: 'technology',
          apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY || '',
          pageSize: '5'
        }))

        // Fetch education news
        const eduResponse = await fetch('https://newsapi.org/v2/everything?' + new URLSearchParams({
          q: 'education malaysia',
          language: 'en',
          sortBy: 'publishedAt',
          apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY || '',
          pageSize: '5'
        }))

        if (!techResponse.ok || !eduResponse.ok) {
          throw new Error('Failed to fetch news')
        }

        const techData = await techResponse.json()
        const eduData = await eduResponse.json()

        setTechNews(techData.articles)
        setEduNews(eduData.articles)
      } catch (err) {
        console.error('Error fetching news:', err)
        setError('Failed to load news')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
    // Refresh news every 30 minutes
    const intervalId = setInterval(fetchNews, 1800000)
    return () => clearInterval(intervalId)
  }, [])

  const renderNewsItems = (items: NewsItem[]) => {
    // Duplicate items to create seamless loop
    const duplicatedItems = [...items, ...items]
    
    return (
      <div className="relative h-[200px] overflow-hidden">
        <div className="animate-marquee-up absolute w-full">
          {duplicatedItems.map((item, index) => (
            <article
              key={`${index}-${item.title}`}
              className="group relative rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors mb-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <h3 className="font-medium text-sm text-slate-100 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Newspaper className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{item.source.name}</span>
                    <span>•</span>
                    <time dateTime={item.publishedAt} className="truncate">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4 text-slate-400 hover:text-slate-100" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-2 text-sm">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="tech" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-3">
        <TabsTrigger value="tech" className="flex items-center gap-2 text-xs">
          <Laptop className="h-3 w-3" />
          <span>Tech</span>
        </TabsTrigger>
        <TabsTrigger value="edu" className="flex items-center gap-2 text-xs">
          <GraduationCap className="h-3 w-3" />
          <span>Education</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tech">
        {renderNewsItems(techNews)}
      </TabsContent>
      
      <TabsContent value="edu">
        {renderNewsItems(eduNews)}
      </TabsContent>
    </Tabs>
  )
} 