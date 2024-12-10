'use client'

interface Asset {
  id: string
  name: string
  type: string
  status: 'Available' | 'In Use' | 'Maintenance'
  user?: string
}

const assets: Asset[] = [
  { id: 'LP001', name: 'Laptop Dell XPS', type: 'Laptop', status: 'Available' },
  { id: 'PR001', name: 'Meeting Room A', type: 'Room', status: 'In Use', user: 'Team Alpha' },
  { id: 'PJ001', name: 'Projector HD', type: 'Equipment', status: 'Available' },
  { id: 'LP002', name: 'Laptop ThinkPad', type: 'Laptop', status: 'Maintenance' },
  { id: 'PR002', name: 'Meeting Room B', type: 'Room', status: 'Available' },
]

const getStatusColor = (status: Asset['status']) => {
  switch (status) {
    case 'Available':
      return 'text-green-500'
    case 'In Use':
      return 'text-yellow-500'
    case 'Maintenance':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export default function AssetAvailability() {
  return (
    <div className="space-y-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center justify-between p-3 bg-card rounded-lg border"
        >
          <div>
            <h3 className="font-medium">{asset.name}</h3>
            <p className="text-sm text-muted-foreground">{asset.type}</p>
          </div>
          <div className="text-right">
            <p className={`font-medium ${getStatusColor(asset.status)}`}>
              {asset.status}
            </p>
            {asset.user && (
              <p className="text-sm text-muted-foreground">{asset.user}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

