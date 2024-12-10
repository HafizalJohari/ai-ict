'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { Clock, Link } from 'lucide-react'

interface PrayerTime {
  name: string
  time: string
}

interface PrayerData {
  hijri: string
  date: string
  day: string
  imsak: string
  fajr: string
  syuruk: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export default function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [currentDate, setCurrentDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = useMemo(() => {
    const zone = 'JHR02'
    return `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=month&zone=${zone}`
  }, [])

  const mapPrayerTimes = useCallback((prayerData: PrayerData): PrayerTime[] => {
    return [
      { name: 'Imsak', time: prayerData.imsak },
      { name: 'Subuh', time: prayerData.fajr },
      { name: 'Syuruk', time: prayerData.syuruk },
      { name: 'Zohor', time: prayerData.dhuhr },
      { name: 'Asar', time: prayerData.asr },
      { name: 'Maghrib', time: prayerData.maghrib },
      { name: 'Isyak', time: prayerData.isha }
    ]
  }, [])

  const fetchPrayerTimes = useCallback(async () => {
    try {
      setIsLoading(true)
      const today = new Date()

      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch prayer times')
      }

      const data = await response.json()
      
      if (data.status === 'OK!' && Array.isArray(data.prayerTime)) {
        const todayPrayerTime = data.prayerTime.find((time: PrayerData) => 
          time.date === format(today, 'dd-MMM-yyyy')
        )

        if (todayPrayerTime) {
          setCurrentDate(todayPrayerTime.date)
          setPrayerTimes(mapPrayerTimes(todayPrayerTime))
        } else {
          throw new Error('No prayer times found for today')
        }
      } else {
        throw new Error('Invalid data received from API')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times')
      console.error('Prayer times error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [apiUrl, mapPrayerTimes])

  const isCurrentPrayer = useCallback((time: string): boolean => {
    const now = new Date()
    const [hours, minutes] = time.split(':')
    const prayerTime = new Date()
    prayerTime.setHours(parseInt(hours), parseInt(minutes), 0)
    
    const nextPrayerIndex = prayerTimes.findIndex(prayer => {
      const [h, m] = prayer.time.split(':')
      const pTime = new Date()
      pTime.setHours(parseInt(h), parseInt(m), 0)
      return pTime > now
    })
    
    if (nextPrayerIndex === -1) {
      return time === prayerTimes[prayerTimes.length - 1]?.time
    }
    
    return nextPrayerIndex > 0 && time === prayerTimes[nextPrayerIndex - 1]?.time
  }, [prayerTimes])

  useEffect(() => {
    fetchPrayerTimes()
    const intervalId = setInterval(fetchPrayerTimes, 3600000)
    return () => clearInterval(intervalId)
  }, [fetchPrayerTimes])

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3">
        <p className="text-center text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-medium text-slate-200">
              Prayer Times - Johor Bahru by e-solat JAKIM
            </h2>
          </div>
          {currentDate && (
            <time className="text-xs text-slate-400" dateTime={currentDate}>
              {format(new Date(currentDate), 'EEEE, dd MMM yyyy')}
            </time>
          )}
        </div>

        {/* Prayer Times Grid */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
              {prayerTimes.map(({ name, time }) => {
                const isCurrent = isCurrentPrayer(time)
                return (
                  <div
                    key={name}
                    className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
                      isCurrent 
                        ? 'border-primary/50 bg-primary/20 hover:border-primary' 
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative px-2 py-2 text-center">
                      <div className={`text-xs font-medium ${
                        isCurrent ? 'text-primary-foreground' : 'text-slate-400'
                      }`}>
                        {name}
                      </div>
                      <div className={`mt-0.5 text-sm font-semibold ${
                        isCurrent ? 'text-primary' : 'text-slate-200'
                      }`}>
                        {time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 