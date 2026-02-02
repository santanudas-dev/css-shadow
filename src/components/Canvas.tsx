import { useShadowStore } from '../store/shadowStore'
import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'

export default function Canvas() {
  const {
    cards,
    activeCardId,
    setActiveCard,
    addCard,
    removeCard,
    canvasBgColor,
    zoom,
    setZoom,
  } = useShadowStore()

  const canvasRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  // Figma-like zoom and pan controls
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(Math.min(Math.max(zoom + delta, 0.1), 5))
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault()
        setIsPanning(true)
        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x
        const deltaY = e.clientY - lastPanPoint.y
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsPanning(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setZoom(1)
        setPan({ x: 0, y: 0 })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        setZoom(Math.min(zoom + 0.1, 5))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        setZoom(Math.max(zoom - 0.1, 0.1))
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [zoom, setZoom, isPanning, lastPanPoint])

  const generateBoxShadow = (shadows: any[]) => {
    const enabledShadows = shadows.filter((s) => s.enabled)
    if (enabledShadows.length === 0) return 'none'

    return enabledShadows
      .map((shadow) => {
        const inset = shadow.inset ? 'inset ' : ''
        return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
      })
      .join(', ')
  }

  return (
    <div
      ref={canvasRef}
      className="w-full h-full flex-1 flex items-center justify-center overflow-hidden relative"
      style={{ backgroundColor: canvasBgColor }}
    >
      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 bg-black/20 text-white px-3 py-1 rounded-md text-sm font-medium">
        {Math.round(zoom * 100)}%
      </div>

      {/* Add card button */}
      <button
        onClick={addCard}
        disabled={cards.length >= 2}
        className={`absolute top-4 right-4 ${cards.length >= 2 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} bg-blue-600  hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        title="Add Card (Max 2)`}
      >
        <Plus size={16} />
        Add Card
      </button>

      {/* Cards container */}
      <div
        className="flex gap-12 items-center justify-center"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center',
          cursor: isPanning ? 'grabbing' : 'default'
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveCard(card.id)}
            onContextMenu={(e) => {
              e.preventDefault()
              if (cards.length > 1) removeCard(card.id)
            }}
            className={`cursor-pointer transition-all duration-200 relative group ${activeCardId === card.id
                ? 'ring-2 ring-blue-500 ring-offset-4'
                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }`}
            style={{
              width: `${card.width}px`,
              height: `${card.height}px`,
              backgroundColor: card.bgColor,
              borderRadius: `${card.radius}px`,
              boxShadow: generateBoxShadow(card.shadows),
              transition: 'box-shadow 0.1s ease-out, ring 0.2s ease-out',
            }}
          >
            {/* Card label */}
            <div className="absolute -top-8 left-0 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {card.name}
            </div>

            {/* Delete button on hover */}
            {cards.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeCard(card.id)
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold"
                title="Delete Card"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-black/10 dark:bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 space-y-1">
        <div className="font-medium">Canvas Controls:</div>
        <div>Ctrl+Wheel: Zoom • Middle Mouse: Pan</div>
        <div>Ctrl+0: Reset • Right Click: Delete Card</div>
      </div>
    </div>
  )
}