'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const initialAssets = [
  { id: 1, name: 'Laptop', status: 'Available' },
  { id: 2, name: 'Projector', status: 'In Use' },
  { id: 3, name: 'Conference Room', status: 'Available' },
  { id: 4, name: 'Printer', status: 'Under Maintenance' },
]

export default function AssetManagement() {
  const [assets, setAssets] = useState(initialAssets)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500'
      case 'In Use': return 'bg-sky-500'
      case 'Under Maintenance': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const toggleAssetStatus = (id: number) => {
    setAssets(assets.map(asset => {
      if (asset.id === id) {
        const newStatus = asset.status === 'Available' ? 'In Use' : 'Available'
        return { ...asset, status: newStatus }
      }
      return asset
    }))
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Asset Management</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAssetStatus(asset.id)}
                    className="border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
                  >
                    {asset.status === 'Available' ? 'Reserve' : 'Release'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

