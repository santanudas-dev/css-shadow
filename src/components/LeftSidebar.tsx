import { useShadowStore } from '../store/shadowStore'
import { Trash2, Copy } from 'lucide-react'
import { Slider } from "@/components/ui/slider"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from './ui/button'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Switch } from "@/components/ui/switch"

import { useRef, useState, useCallback } from "react"
import { FloatingColorPicker } from "./FloatingColorPicker"

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

export default function LeftSidebar() {
  const {
    cards,
    activeCardId,
    activeShadowId,
    updateShadow,
    removeShadow,
    duplicateShadow,
  } = useShadowStore()

  const activeCard = cards.find(c => c.id === activeCardId)
  const shadows = activeCard?.shadows || []
  const activeShadow = shadows.find((s) => s.id === activeShadowId)
  const colorAnchorRef = useRef<HTMLDivElement | null>(null)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  const handleColorChange = useCallback((color: FormattedColor) => {
    if (activeShadow) {
      const colorString = typeof color === 'string' ? color : 
        'r' in color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` :
        `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`
      updateShadow(activeShadow.id, { color: colorString });
    }
  }, [activeShadow, updateShadow]);

  const handleColorPickerClose = useCallback(() => {
    setColorPickerOpen(false);
  }, []);

  const handleColorSwatchClick = useCallback(() => {
    setColorPickerOpen(true);
  }, []);

  if (!activeShadow) {
    return (
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No shadow selected
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-w-50 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1117] p-6 overflow-y-auto transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Properties
        </h2>
        <div className="flex gap-2">
          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => duplicateShadow(activeShadow.id)}
                variant="outline"
                className='cursor-pointer'
              >
                <Copy size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Duplicate</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => removeShadow(activeShadow.id)}
                className='hover:text-red-600 hover:bg-red-600/10 cursor-pointer'
                variant={"outline"}
              >
                <Trash2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-5">
        <Field>
          <FieldLabel htmlFor="shadow-name">Name</FieldLabel>
          <Input
            id="shadow-name"
            type="text"
            placeholder="Shadow name"
            value={activeShadow.name}
            onChange={(e) =>
              updateShadow(activeShadow.id, { name: e.target.value })
            }
            className='focus-visible:ring-blue-600 focus-visible:ring-1'
          />
        </Field>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Offset X: {activeShadow.offsetX}px
          </label>
          <Slider min={-100} max={100} step={1} value={[activeShadow.offsetX]} onValueChange={([value]) =>
            updateShadow(activeShadow.id, {
              offsetX: value,
            })
          } />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Offset Y: {activeShadow.offsetY}px
          </label>
          <Slider min={-100} max={100} step={1} value={[activeShadow.offsetY]} onValueChange={([value]) =>
            updateShadow(activeShadow.id, {
              offsetY: value,
            })
          } />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Blur: {activeShadow.blur}px
          </label>
          <Slider min={0} max={100} step={1} value={[activeShadow.blur]} onValueChange={([value]) =>
            updateShadow(activeShadow.id, {
              blur: value,
            })
          } />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Spread: {activeShadow.spread}px
          </label>
          <Slider min={-50} max={50} step={1} value={[activeShadow.spread]} onValueChange={([value]) =>
            updateShadow(activeShadow.id, {
              spread: value,
            })
          } />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex gap-2 items-center">
            <div
              ref={colorAnchorRef}
              onClick={handleColorSwatchClick}
              className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded"
              style={{ backgroundColor: activeShadow.color }}
            />
            <Input
              type="text"
              value={activeShadow.color}
              onChange={(e) =>
                updateShadow(activeShadow.id, { color: e.target.value })
              }
              className="focus-visible:ring-blue-600 focus-visible:ring-1"
            />
          </div>
          {colorPickerOpen && (
            <FloatingColorPicker
              anchorRef={colorAnchorRef}
              value={activeShadow.color}
              onChange={handleColorChange}
              onChangeEnd={handleColorChange}
              onClose={handleColorPickerClose}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Opacity: {Math.round((parseInt(activeShadow.color.substring(7) || 'ff', 16) / 255) * 100)}%
          </label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[
              Math.round(
                (parseInt(activeShadow.color.substring(7) || "ff", 16) / 255) * 100
              ),
            ]}
            onValueChange={([value]) => {
              const alphaHex = Math.round((value / 100) * 255)
                .toString(16)
                .padStart(2, "0")

              updateShadow(activeShadow.id, {
                color: activeShadow.color.substring(0, 7) + alphaHex,
              })
            }}
            className="text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Inset
          </label>
          <Switch
            checked={activeShadow.inset}
            onCheckedChange={(checked) =>
              updateShadow(activeShadow.id, { inset: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enabled
          </label>
          <Switch
            checked={activeShadow.enabled}
            onCheckedChange={(checked) =>
              updateShadow(activeShadow.id, { enabled: checked })
            }
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>
    </div>
  )
}