import { create } from 'zustand'

export interface NewsArticle {
  id: number
  title: string
  link: string
  image?: string
  date: string
  excerpt?: string
  source: string
}

interface NewsStore {
  articles: NewsArticle[]
  isLoading: boolean
  error: string | null
  fetchNews: () => Promise<void>
}

export const useNewsStore = create<NewsStore>((set) => ({
  articles: [],
  isLoading: false,
  error: null,
  fetchNews: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/news')
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      set({ articles: data.articles, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  }
})) 