'use client'

import { useStore, type Asset } from '@/lib/store'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin } from 'lucide-react'

export default function AssetOverview() {
  const { assets } = useStore()

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'Sedang Digunakan':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'Penyelenggaraan':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'Ditempah':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getTypeIcon = (type: Asset['type']) => {
    switch (type) {
      case 'Peralatan':
        return '🔧'
      case 'Bilik':
        return '🚪'
      case 'Kenderaan':
        return '🚗'
      default:
        return '📦'
    }
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center space-y-2">
          <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Tiada aset tersedia</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex flex-col space-y-2 p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getTypeIcon(asset.type)}</span>
                <h3 className="font-medium text-slate-100">{asset.name}</h3>
              </div>
              {asset.description && (
                <p className="text-sm text-slate-400">{asset.description}</p>
              )}
            </div>
            <Badge variant="outline" className={getStatusColor(asset.status)}>
              {asset.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            <span>{asset.location}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

