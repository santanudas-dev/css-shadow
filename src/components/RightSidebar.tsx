import { useShadowStore } from '../store/shadowStore'
import { Plus, Layers, GripVertical, Copy, Magnet } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { FloatingColorPicker } from './FloatingColorPicker'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type RGBA = {
  r: number
  g: number
  b: number
  a: number
}

type HSVA = {
  h: number
  s: number
  v: number
  a: number
}

type FormattedColor = string | RGBA | HSVA

const PRESETS = [
  {
    name: 'Soft',
    shadows: [
      {
        id: '',
        name: 'Shadow 1',
        offsetX: 0,
        offsetY: 4,
        blur: 8,
        spread: 0,
        color: '#00000026',
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: 'Medium',
    shadows: [
      {
        id: '',
        name: 'Shadow 1',
        offsetX: 0,
        offsetY: 10,
        blur: 15,
        spread: -3,
        color: '#0000001a',
        inset: false,
        enabled: true,
      },
      {
        id: '',
        name: 'Shadow 2',
        offsetX: 0,
        offsetY: 4,
        blur: 6,
        spread: -2,
        color: '#0000000d',
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: 'Large',
    shadows: [
      {
        id: '',
        name: 'Shadow 1',
        offsetX: 0,
        offsetY: 20,
        blur: 25,
        spread: -5,
        color: '#0000001a',
        inset: false,
        enabled: true,
      },
      {
        id: '',
        name: 'Shadow 2',
        offsetX: 0,
        offsetY: 10,
        blur: 10,
        spread: -5,
        color: '#00000014',
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: 'Neumorphic',
    shadows: [
      {
        id: '',
        name: 'Light',
        offsetX: -8,
        offsetY: -8,
        blur: 16,
        spread: 0,
        color: '#ffffff80',
        inset: false,
        enabled: true,
      },
      {
        id: '',
        name: 'Dark',
        offsetX: 8,
        offsetY: 8,
        blur: 16,
        spread: 0,
        color: '#00000026',
        inset: false,
        enabled: true,
      },
    ],
  },
]

interface SortableLayerProps {
  shadow: any
  isActive: boolean
  onSelect: () => void
}

function SortableLayer({ shadow, isActive, onSelect }: SortableLayerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shadow.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${isActive
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical size={16} />
      </div>
      <button
        onClick={onSelect}
        className="flex-1 text-left"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {shadow.name}
          </span>
          <span
            className={`text-xs ${shadow.enabled
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-400'
              }`}
          >
            {shadow.enabled ? '●' : '○'}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
          {shadow.offsetX}px {shadow.offsetY}px {shadow.blur}px{' '}
          {shadow.spread}px
        </div>
      </button>
    </div>
  )
}

export default function RightSidebar() {
  const {
    cards,
    activeCardId,
    activeShadowId,
    addShadow,
    setActiveShadow,
    canvasBgColor,
    setCanvasBgColor,
    loadPreset,
  } = useShadowStore()

  const activeCard = cards.find(c => c.id === activeCardId)
  const shadows = activeCard?.shadows || []
  const cardBgColor = activeCard?.bgColor || '#ffffff'
  const cardWidth = activeCard?.width || 300
  const cardHeight = activeCard?.height || 200
  const cardRadius = activeCard?.radius || 16

  const setCardBgColor = useShadowStore(state => state.setCardBgColor)
  const setCardDimensions = useShadowStore(state => state.setCardDimensions)
  const setCardRadius = useShadowStore(state => state.setCardRadius)

  const [activeTab, setActiveTab] = useState<'layers' | 'presets' | 'export'>(
    'layers'
  )

  const layersRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && activeCardId) {
      const oldIndex = shadows.findIndex((s) => s.id === active.id)
      const newIndex = shadows.findIndex((s) => s.id === over.id)

      const newShadows = arrayMove(shadows, oldIndex, newIndex)
      
      useShadowStore.setState(state => ({
        cards: state.cards.map(c => 
          c.id === activeCardId 
            ? { ...c, shadows: newShadows }
            : c
        )
      }))
    }
  }

  const generateCSS = () => {
    const enabledShadows = shadows.filter((s) => s.enabled)
    if (enabledShadows.length === 0) return 'box-shadow: none;'

    const shadowStrings = enabledShadows.map((s) => {
      const inset = s.inset ? 'inset ' : ''
      return `${inset}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`
    })

    return `box-shadow: ${shadowStrings.join(', ')};`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCSS())
  }

  useEffect(() => {
    const el = layersRef.current
    if (!el) return

    el.scrollTop = el.scrollHeight
  }, [shadows.length])

  const [magnetOn, setMagnetOn] = useState(false)
  const [cardBgColorPickerOpen, setCardBgColorPickerOpen] = useState(false)
  const [canvasBgColorPickerOpen, setCanvasBgColorPickerOpen] = useState(false)
  const cardBgColorAnchorRef = useRef<HTMLDivElement | null>(null)
  const canvasBgColorAnchorRef = useRef<HTMLDivElement | null>(null)

  const handleCardBgColorChange = useCallback((color: FormattedColor) => {
    const colorString = typeof color === 'string' ? color : 
      'r' in color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` :
      `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`
    setCardBgColor(colorString)
  }, [setCardBgColor])

  const handleCanvasBgColorChange = useCallback((color: FormattedColor) => {
    const colorString = typeof color === 'string' ? color : 
      'r' in color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` :
      `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`
    setCanvasBgColor(colorString)
  }, [setCanvasBgColor])

  return (
    <div className="w-full h-full min-w-50 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1117] transition-all duration-300 flex flex-col">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'layers'
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Layers
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'presets'
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Presets
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'export'
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          Export
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {activeTab === 'layers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Layers size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Shadow Layers
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {shadows.length} {shadows.length === 1 ? 'layer' : 'layers'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => addShadow()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title="Add Shadow Layer"
              >
                <Plus size={16} />
              </Button>
            </div>

            {shadows.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <Layers size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  No shadow layers yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  Create your first shadow to get started
                </p>
                <Button
                  onClick={() => addShadow()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus size={14} className="mr-1" />
                  Add Shadow
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={shadows.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div ref={layersRef} className="space-y-2 max-h-75 overflow-y-scroll layers">
                    {shadows.map((shadow) => (
                      <SortableLayer
                        key={shadow.id}
                        shadow={shadow}
                        isActive={activeShadowId === shadow.id}
                        onSelect={() => setActiveShadow(shadow.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <div className="pt-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Card Settings {activeCard && `(${activeCard.name})`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Customize appearance and dimensions
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Background
                </label>
                <div className="flex gap-2">
                  <div
                    ref={cardBgColorAnchorRef}
                    onClick={() => setCardBgColorPickerOpen(true)}
                    className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded"
                    style={{ backgroundColor: cardBgColor }}
                  />
                  <Input
                    type="text"
                    value={cardBgColor}
                    onChange={(e) => setCardBgColor(e.target.value)}
                    className='focus-visible:ring-blue-600 focus-visible:ring-1'
                  />
                </div>
                {cardBgColorPickerOpen && (
                  <FloatingColorPicker
                    anchorRef={cardBgColorAnchorRef}
                    value={cardBgColor}
                    onChange={handleCardBgColorChange}
                    onChangeEnd={handleCardBgColorChange}
                    onClose={() => setCardBgColorPickerOpen(false)}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canvas Background
                </label>
                <div className="flex gap-2">
                  <div
                    ref={canvasBgColorAnchorRef}
                    onClick={() => setCanvasBgColorPickerOpen(true)}
                    className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded"
                    style={{ backgroundColor: canvasBgColor }}
                  />
                  <Input
                    type="text"
                    value={canvasBgColor}
                    onChange={(e) => setCanvasBgColor(e.target.value)}
                    className='focus-visible:ring-blue-600 focus-visible:ring-1'
                  />
                </div>
                {canvasBgColorPickerOpen && (
                  <FloatingColorPicker
                    anchorRef={canvasBgColorAnchorRef}
                    value={canvasBgColor}
                    onChange={handleCanvasBgColorChange}
                    onChangeEnd={handleCanvasBgColorChange}
                    onClose={() => setCanvasBgColorPickerOpen(false)}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Width: {cardWidth}px
                </label>
                <Slider min={100} max={600} step={1} value={[cardWidth]} onValueChange={([value]) =>
                  setCardDimensions(value, cardHeight)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height: {cardHeight}px
                </label>
                <Slider min={100} max={600} step={1} value={[cardHeight]} onValueChange={([value]) =>
                  setCardDimensions(cardWidth, value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Border Radius: {cardRadius}px
                </label>
                <Slider min={0} max={100} step={1} value={[cardRadius]} onValueChange={([value]) =>
                  setCardRadius(value)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className='flex items-center justify-between mb-4'>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Shadow Presets
              </h3>
              <button
                onClick={() => setMagnetOn((v) => !v)}
                title="Append preset instead of replacing"
                className={`p-2 rounded-md border cursor-pointer
      ${magnetOn
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-600'
                  }`}
              >
                <Magnet size={16} />
              </button>
            </div>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset.shadows, magnetOn)}
                className="w-full p-2 cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 text-left transition-colors group"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {preset.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {preset.shadows.length} shadow
                  {preset.shadows.length > 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'export' && (
          <Card className="bg-background">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Export CSS
                </CardTitle>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={copyToClipboard}
                  className="gap-2 cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <ScrollArea className="h-30 rounded-md border bg-muted">
                <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap wrap-break-word">
                  <code>{generateCSS()}</code>
                </pre>
              </ScrollArea>

              <p className="mt-2 text-xs text-muted-foreground">
                Click "Copy" to copy the CSS to your clipboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
