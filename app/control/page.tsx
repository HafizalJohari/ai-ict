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
  ListTodo,
  MessageCircle,
  Timer,
  AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import CountdownManager from '@/components/CountdownManager'

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
    case 'countdown':
      return <Timer className="h-4 w-4" />
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

const ChatBubbleControl = () => {
  const { chatBubbleSize, setChatBubbleSize } = useStore()

  const sizeMap = {
    small: 0,
    medium: 50,
    large: 100
  }

  const handleSliderChange = (value: number[]) => {
    if (value[0] <= 25) setChatBubbleSize('small')
    else if (value[0] <= 75) setChatBubbleSize('medium')
    else setChatBubbleSize('large')
  }

  const getCurrentSliderValue = () => {
    return [sizeMap[chatBubbleSize]]
  }

  const getSizeLabel = () => {
    switch (chatBubbleSize) {
      case 'small': return '96px'
      case 'medium': return '128px'
      case 'large': return '160px'
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Chat Bubble Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Bubble Size</Label>
              <span className="text-sm text-muted-foreground">{getSizeLabel()}</span>
            </div>
            <Slider
              value={getCurrentSliderValue()}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Size Preview */}
          <div className="border rounded-lg p-6 flex items-center justify-center bg-slate-100">
            <div className="relative" style={{ width: getSizeLabel(), height: getSizeLabel() }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  rounded-full overflow-hidden border-4 border-white/50 shadow-lg
                  ${chatBubbleSize === 'small' ? 'w-24 h-24' : ''}
                  ${chatBubbleSize === 'medium' ? 'w-36 h-36' : ''}
                  ${chatBubbleSize === 'large' ? 'w-48 h-48' : ''}
                `}>
                  <Image
                    src="/media/sara.png"
                    alt="Sara Size Preview"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ControlPanel() {
  const { features, setFeatures, toggleFeature, resetFeatures, updateFeatureWidth } = useStore()
  const [debugInfo, setDebugInfo] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  
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
      
      const newFeatures = arrayMove(features, oldIndex, newIndex).map((feature, index) => ({
        ...feature,
        order: index
      }))
      
      setFeatures(newFeatures)
    }
  }

  const handleForceReset = () => {
    resetFeatures()
    setShowResetDialog(false)
    window.location.reload()
  }

  return (
    <main className="max-w-full p-4 space-y-6">
      <div className="flex justify-between items-center mb-8">
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
            onClick={() => setShowResetDialog(true)}
            variant="outline"
            size="sm"
            className="bg-destructive/10 hover:bg-destructive/20 text-destructive"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Force Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-6">
        <div className="space-y-6">
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
        </div>

        <div className="space-y-6">
          <ChatBubbleControl />
          <CountdownManager />
        </div>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Reset
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>Are you sure you want to reset the layout?</p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Note:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Assets settings will be preserved</li>
                  <li>Countdown data will be preserved</li>
                  <li>All other features will be reset to default</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleForceReset}
            >
              Reset Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

