'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useStore, FeatureItem, defaultFeatures } from '@/lib/store'
import { 
  ArrowUpDown, 
  Maximize2, 
  Minimize2, 
  GripVertical, 
  Clock, 
  Newspaper, 
  RefreshCcw,
  Calendar,
  Users,
  Briefcase,
  Bell,
  ListTodo
} from 'lucide-react'

function getFeatureIcon(id: string) {
  switch (id) {
    case 'prayer':
      return <Clock className="h-4 w-4" />
    case 'news':
      return <Newspaper className="h-4 w-4" />
    case 'calendar':
      return <Calendar className="h-4 w-4" />
    case 'staff':
      return <Users className="h-4 w-4" />
    case 'assets':
      return <Briefcase className="h-4 w-4" />
    case 'announcements':
      return <Bell className="h-4 w-4" />
    case 'activity':
      return <ListTodo className="h-4 w-4" />
    default:
      return null
  }
}

function SortableItem({ 
  feature, 
  onToggle,
  onWidthChange
}: { 
  feature: FeatureItem
  onToggle: (id: string) => void
  onWidthChange: (id: string, width: 'full' | 'half') => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: feature.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const icon = getFeatureIcon(feature.id)

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-card border rounded-md shadow-sm group hover:bg-accent/5"
    >
      <div className="flex items-center gap-4">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-move p-1 hover:bg-accent rounded opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="font-medium">{feature.content}</span>
          <span className="text-xs text-muted-foreground">
            (order: {feature.order}, width: {feature.width})
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onWidthChange(feature.id, feature.width === 'full' ? 'half' : 'full')}
          className="text-muted-foreground hover:text-foreground"
          title={feature.width === 'full' ? 'Change to half width' : 'Change to full width'}
        >
          {feature.width === 'full' ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            id={`switch-${feature.id}`}
            checked={feature.enabled}
            onCheckedChange={() => onToggle(feature.id)}
          />
          <Label htmlFor={`switch-${feature.id}`} className="text-sm">
            {feature.enabled ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
      </div>
    </li>
  )
}

export default function ControlPanel() {
  const { features, setFeatures, toggleFeature, resetFeatures, updateFeatureWidth } = useStore()
  const [debugInfo, setDebugInfo] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = features.findIndex((item) => item.id === active.id)
      const newIndex = features.findIndex((item) => item.id === over.id)
      
      // Update the order of features
      const newFeatures = arrayMove(features, oldIndex, newIndex).map((feature, index) => ({
        ...feature,
        order: index
      }))
      
      setFeatures(newFeatures)
    }
  }

  const handleForceReset = () => {
    // Force reset to default features
    setFeatures(defaultFeatures)
    // Clear local storage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('department-features-storage')
      window.location.reload()
    }
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Control Panel</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugInfo(!debugInfo)}
          >
            {debugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
          </Button>
          <Button 
            onClick={handleForceReset}
            variant="outline"
            size="sm"
            className="bg-destructive/10 hover:bg-destructive/20 text-destructive"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Force Reset
          </Button>
        </div>
      </div>

      {debugInfo && (
        <Card>
          <CardContent className="pt-6">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(features, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">
            Layout Management
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop items to reorder, toggle visibility, or change width of sections.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-6 text-sm text-muted-foreground border-b pb-4">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4" />
                <span>Drag to reorder</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                <span>Toggle width</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch className="pointer-events-none" />
                <span>Toggle visibility</span>
              </div>
            </div>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={features}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {features
                    .sort((a, b) => a.order - b.order)
                    .map((feature) => (
                      <SortableItem 
                        key={feature.id} 
                        feature={feature} 
                        onToggle={toggleFeature}
                        onWidthChange={updateFeatureWidth}
                      />
                    ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
