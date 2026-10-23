import { useShadowStore } from '../store/shadowStore'
import type { Card, Shadow } from '../store/shadowStore'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Lock, Moon, Plus, Sun, Unlock } from 'lucide-react'
import { EditableNumber } from './EditableNumber'

interface MemoizedCardProps {
  card: Card
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  canDelete: boolean
  generateBoxShadow: (shadows: Shadow[]) => string
  darkMode: boolean
}

const MemoizedCard = ({ card, isActive, onSelect, onDelete, canDelete, generateBoxShadow, darkMode }: MemoizedCardProps) => (
  <div
    onClick={() => onSelect(card.id)}
    onContextMenu={(e) => {
      e.preventDefault()
      if (canDelete) onDelete(card.id)
    }}
    className={`cursor-pointer transition-all duration-200 relative group ${
      isActive
        ? 'ring-2 ring-blue-500 ring-offset-4'
        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
    }`}
    style={{
      width: `${card.width}px`,
      height: `${card.height}px`,
      backgroundColor: darkMode ? card.darkBgColor : card.bgColor,
      borderRadius: `${card.radius}px`,
      boxShadow: generateBoxShadow(card.shadows),
      transition:
        'box-shadow 0.25s ease, background-color 0.25s ease, width 0.25s ease, height 0.25s ease, border-radius 0.25s ease, ring 0.2s ease-out',
    }}
  >
    <div
      className={`absolute -top-8 left-0 text-sm font-semibold ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}
    >
      {card.name}
    </div>

    {canDelete && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(card.id)
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold"
        title="Delete Card"
      >
        ×
      </button>
    )}
  </div>
)

export default function Canvas() {
  const {
    cards,
    activeCardId,
    setActiveCard,
    addCard,
    removeCard,
    canvasBgColor,
    canvasDarkBgColor,
    darkMode,
    canvasDarkMode,
    canvasThemeLocked,
    toggleCanvasTheme,
    toggleCanvasThemeLock,
    zoom,
    setZoom,
  } = useShadowStore()
  const isCanvasDark = canvasThemeLocked ? darkMode : canvasDarkMode

  const canvasRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  const generateBoxShadow = useCallback((shadows: Shadow[]) => {
    const enabledShadows = shadows.filter((s) => s.enabled)
    if (enabledShadows.length === 0) return 'none'

    return enabledShadows
      .map((shadow) => {
        const inset = shadow.inset ? 'inset ' : ''
        return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
      })
      .join(', ')
  }, [])

  const handleCardSelect = useCallback((id: string) => {
    setActiveCard(id)
  }, [setActiveCard])

  const handleCardDelete = useCallback((id: string) => {
    removeCard(id)
  }, [removeCard])

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
      if (e.button === 1) {
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

  return (
    <div
      ref={canvasRef}
      className="w-full h-full flex-1 flex items-center justify-center overflow-hidden relative"
      style={{
        backgroundColor: isCanvasDark ? canvasDarkBgColor : canvasBgColor,
        transition: "background-color 0.25s ease",
      }}
    >
      <div className="absolute top-4 left-4 bg-black/20 text-white px-3 py-1 rounded-xs text-sm font-medium backdrop-blur-sm">
        <EditableNumber
          label="Zoom"
          value={Math.round(zoom * 100)}
          unit="%"
          min={10}
          max={500}
          onChange={(value) => setZoom(value / 100)}
        />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleCanvasThemeLock}
          aria-label={canvasThemeLocked ? 'Unlock canvas theme from global theme' : 'Lock canvas theme to global theme'}
          aria-pressed={canvasThemeLocked}
          className={`cursor-pointer rounded-xs border p-2 backdrop-blur-sm transition-colors ${
            isCanvasDark
              ? 'border-white/20 bg-black/40 text-gray-200 hover:bg-black/60'
              : 'border-black/15 bg-white/80 text-gray-700 hover:bg-white'
          }`}
          title={canvasThemeLocked ? 'Canvas follows global theme' : 'Canvas theme is independent'}
        >
          {canvasThemeLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
        <button
          onClick={toggleCanvasTheme}
          aria-label={`Change canvas theme (currently ${isCanvasDark ? 'dark' : 'light'})`}
          className={`cursor-pointer rounded-xs border p-2 backdrop-blur-sm transition-colors ${
            isCanvasDark
              ? 'border-white/20 bg-black/40 text-gray-200 hover:bg-black/60'
              : 'border-black/15 bg-white/80 text-gray-700 hover:bg-white'
          }`}
          title={canvasThemeLocked ? 'Change canvas and global theme' : 'Change canvas theme'}
        >
          {isCanvasDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={addCard}
          disabled={cards.length >= 2}
          className={`${
            cards.length >= 2
              ? 'opacity-50 cursor-not-allowed'
              : 'opacity-100 cursor-pointer hover:bg-blue-700'
          } bg-blue-600 text-white px-3 py-2 rounded-xs transition-colors flex items-center gap-2 text-sm font-medium`}
          title="Add Card (Max 2)"
        >
          <Plus size={16} />
          Add Card
        </button>
      </div>

      <div
        className="flex gap-12 items-center justify-center"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center',
          cursor: isPanning ? 'grabbing' : 'default'
        }}
      >
        {cards.map((card) => (
          <MemoizedCard
            key={card.id}
            card={card}
            darkMode={isCanvasDark}
            isActive={activeCardId === card.id}
            onSelect={handleCardSelect}
            onDelete={handleCardDelete}
            canDelete={cards.length > 1}
            generateBoxShadow={generateBoxShadow}
          />
        ))}
      </div>

      <div
        className={`absolute bottom-4 left-4 backdrop-blur-sm px-3 py-2 rounded-xs text-xs space-y-1 ${
          isCanvasDark
            ? 'bg-white/10 text-gray-300'
            : 'bg-black/10 text-gray-600'
        }`}
      >
        <div className="font-medium">Canvas Controls:</div>
        <div>Ctrl+Wheel: Zoom • Middle Mouse: Pan</div>
        <div>Ctrl+0: Reset • Right Click: Delete Card</div>
      </div>
    </div>
  )
}