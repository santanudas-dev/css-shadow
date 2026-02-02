import { Minus, Plus } from 'lucide-react'
import { Button } from './button'

interface StepperProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
  isMobile?: boolean
}

export function Stepper({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  unit = 'px', 
  onChange, 
  isMobile 
}: StepperProps) {
  const increment = () => {
    const newValue = Math.min(value + step, max)
    onChange(newValue)
  }

  const decrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
  }

  if (isMobile) {
    return (
      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={decrement}
            disabled={value <= min}
            className="h-8 w-8 p-0 rounded-full"
          >
            <Minus size={14} />
          </Button>
          <span className="min-w-[60px] text-center text-sm font-mono">
            {value}{unit}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={increment}
            disabled={value >= max}
            className="h-8 w-8 p-0 rounded-full"
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>
    )
  }

  // Desktop version with slider
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}: {value}{unit}
      </label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={decrement}
          disabled={value <= min}
          className="h-6 w-6 p-0"
        >
          <Minus size={12} />
        </Button>
        <div className="flex-1 mx-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={increment}
          disabled={value >= max}
          className="h-6 w-6 p-0"
        >
          <Plus size={12} />
        </Button>
      </div>
    </div>
  )
}