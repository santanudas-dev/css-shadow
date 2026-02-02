import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react"
import { ColorPicker } from "./ui/ColorPicker"

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

type FloatingColorPickerProps = {
  anchorRef: React.RefObject<HTMLElement | null>
  value: FormattedColor
  onChange?: (color: FormattedColor) => void
  onChangeEnd?: (color: FormattedColor) => void
  onClose: () => void
  className?: string
}

export const FloatingColorPicker = ({
  anchorRef,
  value,
  onChange,
  onChangeEnd,
  onClose,
  className,
}: FloatingColorPickerProps) => {
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const [style, setStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  })

  // Memoize the initial color to prevent unnecessary re-renders
  const initialColor = useMemo(() => {
    if (typeof value === "string") {
      // Parse hex string to RGBA
      const hex = value.replace('#', '').toUpperCase();
      if (hex.length === 6) {
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: 1
        };
      } else if (hex.length === 8) {
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: parseInt(hex.substring(6, 8), 16) / 255
        };
      }
    }
    return value as RGBA;
  }, [value]);

  /* -------------------------------------------------------
     POSITION CALCULATION (top / bottom auto)
     ------------------------------------------------------- */
  useLayoutEffect(() => {
    const anchor = anchorRef.current
    const picker = pickerRef.current
    if (!anchor || !picker) return

    const a = anchor.getBoundingClientRect()
    const p = picker.getBoundingClientRect()

    const spaceBelow = window.innerHeight - a.bottom
    const spaceAbove = a.top

    const placeBelow = spaceBelow >= p.height || spaceBelow > spaceAbove

    const top = placeBelow
      ? a.bottom + 8
      : a.top - p.height - 8

    let left = a.left
    if (left + p.width > window.innerWidth) {
      left = window.innerWidth - p.width - 8
    }

    setStyle({
      position: "fixed",
      top,
      left,
      zIndex: 1000,
      visibility: "visible",
    })
  }, [anchorRef])

  /* -------------------------------------------------------
     OUTSIDE CLICK CLOSE
     ------------------------------------------------------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose, anchorRef])

  /* -------------------------------------------------------
     ESC KEY CLOSE
     ------------------------------------------------------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div ref={pickerRef} style={style} className={className}>
      <ColorPicker
        initialColor={initialColor}
        format="HEXA"
        onChange={onChange}
        onPickEnd={onChangeEnd}
        showSwatches={false}
      />
    </div>
  )
}
