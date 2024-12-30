'use client'

import { useEffect, useRef } from 'react'
import { useNewsStore } from '@/lib/newsStore'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function News() {
  const { articles, isLoading, error, fetchNews } = useNewsStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { newsSettings } = useStore()

  useEffect(() => {
    if (!newsSettings.enabled) return
    
    fetchNews()
    const interval = setInterval(fetchNews, newsSettings.refreshInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNews, newsSettings.refreshInterval, newsSettings.enabled])

  const handleRefresh = () => {
    fetchNews()
  }

  return (
    <Card className="col-span-full xl:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <Newspaper className="h-5 w-5" />
          Berita (Astro Awani)
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
          className={isLoading ? 'animate-spin' : ''}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] relative overflow-hidden">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="mt-2"
              >
                Cuba Semula
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              <p>Tiada berita terkini</p>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="mt-2"
              >
                Muat Semula
              </Button>
            </div>
          ) : (
            <>
              <div 
                ref={scrollRef}
                className={`space-y-4 ${newsSettings.autoScroll ? 'animate-marquee' : ''}`}
              >
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="border rounded-lg overflow-hidden hover:border-slate-400 transition-colors">
                      {article.image && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-medium text-slate-950 group-hover:text-slate-600 flex items-center gap-2">
                          {article.title}
                          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                          <span>{article.date}</span>
                          <span>{article.source}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Clone for seamless loop */}
              <div className="space-y-4 animate-marquee2">
                {articles.map((article) => (
                  <Link
                    key={`clone-${article.id}`}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="border rounded-lg overflow-hidden hover:border-slate-400 transition-colors">
                      {article.image && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-medium text-slate-950 group-hover:text-slate-600 flex items-center gap-2">
                          {article.title}
                          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                          <span>{article.date}</span>
                          <span>{article.source}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 