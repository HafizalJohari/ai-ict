import { NextResponse } from 'next/server'
import { parseString } from 'xml2js'
import { promisify } from 'util'

const parseXML = promisify(parseString)

interface RSSItem {
  title: string[]
  link: string[]
  description: string[]
  pubDate: string[]
  enclosure?: Array<{
    $: {
      url: string
    }
  }>
}

interface RSSFeed {
  rss: {
    channel: Array<{
      item: RSSItem[]
    }>
  }
}

export async function GET() {
  try {
    const response = await fetch('https://rss.astroawani.com/rss/latest/public', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xml = await response.text()
    const result = await parseXML(xml) as RSSFeed
    
    const items = result.rss.channel[0].item
    
    const articles = items
      .slice(0, 5)
      .map((item: RSSItem, index: number) => {
        return {
          id: index,
          title: item.title[0],
          link: item.link[0],
          image: item.enclosure?.[0]?.['$']?.url || null,
          date: new Date(item.pubDate[0]).toLocaleDateString('ms-MY', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          excerpt: item.description[0],
          source: 'Astro Awani'
        }
      })

    if (articles.length === 0) {
      return NextResponse.json({ 
        error: 'No news found at the moment.' 
      }, { status: 404 })
    }

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ 
      error: `Failed to fetch news: ${(error as Error).message}` 
    }, { status: 500 })
  }
} 