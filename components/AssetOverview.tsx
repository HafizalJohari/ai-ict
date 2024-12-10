'use client'

import { useStore } from '@/lib/store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function AssetOverview() {
  const assets = useStore((state) => state.assets)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500 hover:bg-green-600'
      case 'In Use': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'Maintenance': return 'bg-red-500 hover:bg-red-600'
      case 'Reserved': return 'bg-blue-500 hover:bg-blue-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No assets available</p>
      </div>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Asset</TableHead>
              <TableHead className="w-[20%]">Type</TableHead>
              <TableHead className="w-[20%]">Status</TableHead>
              <TableHead className="w-[30%]">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(asset => (
              <TableRow key={asset.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>
                  <Badge 
                    className={`${getStatusColor(asset.status)} text-white transition-colors`}
                  >
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>{asset.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

