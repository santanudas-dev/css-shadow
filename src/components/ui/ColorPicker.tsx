import React, { useState, useEffect, useRef, useCallback } from 'react';

const PRESET_SWATCHES = [
  '#005697FF', '#2E8B57FF', '#C0C0C0FF', '#800080FF',
  '#B8860BFF', '#CD5C5CFF', '#2C2C2CFF', '#FFD700FF',
  '#F0F8FFFF', '#4682B4FF', '#D2B48CFF', '#A0522DFF',
  '#000000FF', '#FFFFFFFF', '#FF4500FF', '#ADFF2FFF'
];

declare global {
  interface Window {
    EyeDropper?: {
      new(): {
        open: () => Promise<{ sRGBHex: string }>
      }
    }
  }
}


type ColorFormat = "HEX" | "HEXA" | "RGB" | "RGBA" | "HSVA" | "OBJECT"

type RGBA = {
  r: number
  g: number
  b: number
  a: number
}
type HSVA = { h: number; s: number; v: number; a: number }

type FormattedColor = string | HSVA | RGBA

type ColorPickerProps = {
  initialColor?: RGBA
  onPickEnd?: (color: FormattedColor) => void
  onChange?: (color: FormattedColor) => void
  format?: ColorFormat
  presetSwatches?: string[]
  showEyedropper?: boolean
  showPreview?: boolean
  showInputs?: boolean
  showSwatches?: boolean
  className?: string
  classNames?: Record<string, string>
}

type DragTarget = "color" | "hue" | "alpha" | null


export const ColorPicker = ({
  initialColor = { r: 0, g: 0, b: 0, a: 1 },
  onPickEnd,
  onChange,
  format = 'HEX',
  presetSwatches = PRESET_SWATCHES,
  showEyedropper = true,
  showPreview = true,
  showInputs = true,
  showSwatches = false,
  className = '',
  classNames = {}
}: ColorPickerProps) => {
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 0, a: 1 });
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState<DragTarget>(null)
  const [isInitialized, setIsInitialized] = useState(false);
  const isInternalUpdate = useRef(false);

  const colorAreaRef = useRef<HTMLDivElement | null>(null)
  const hueSliderRef = useRef<HTMLDivElement | null>(null)
  const alphaSliderRef = useRef<HTMLDivElement | null>(null)

  // Color conversion functions
  const hsvaToRgba = useCallback((h: number, s: number, v: number, a: number) => {
    let r, g, b;
    if (s === 0) {
      r = g = b = v;
    } else {
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);

      switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
        default: r = g = b = 0;
      }
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a
    };
  }, []);

  const rgbaToHsva = useCallback((r: number, g: number, b: number, a: number) => {
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h, s, v = max;

    if (delta === 0) {
      h = s = 0;
    } else {
      s = delta / max;
      switch (max) {
        case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
        case g: h = (b - r) / delta + 2; break;
        case b: h = (r - g) / delta + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    return { h, s, v, a };
  }, []);

  type RGBA = {
    r: number
    g: number
    b: number
    a: number
  }


  const rgbaToHexa = useCallback(({ r, g, b, a }: RGBA) => {
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
    return (toHex(r) + toHex(g) + toHex(b) + alphaHex).toUpperCase();
  }, []);

  const hexaToRgba = useCallback((hex: string) => {
    hex = hex.replace('#', '').toUpperCase();
    if (hex.length === 6) hex += 'FF';
    if (!/^[0-9A-F]{8}$/.test(hex)) return null;

    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: parseInt(hex.substring(6, 8), 16) / 255
    };
  }, []);

  const getFormattedColor = useCallback((fmt: string, currentHsva = hsva) => {
    const rgba = hsvaToRgba(currentHsva.h, currentHsva.s, currentHsva.v, currentHsva.a);
    const hex = rgbaToHexa(rgba);

    switch (fmt.toUpperCase()) {
      case 'HEX':
        return '#' + hex;
      case 'HEXA':
        return '#' + hex;
      case 'RGBA':
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${currentHsva.a.toFixed(2)})`;
      case 'RGB':
        return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
      case 'HSVA':
        return {
          h: Math.round(currentHsva.h * 360),
          s: Math.round(currentHsva.s * 100),
          v: Math.round(currentHsva.v * 100),
          a: currentHsva.a
        };
      case 'OBJECT':
        return { r: rgba.r, g: rgba.g, b: rgba.b, a: currentHsva.a };
      default:
        return '#' + hex;
    }
  }, [hsvaToRgba, rgbaToHexa]);

  // Initialize color from prop
  useEffect(() => {
    if (initialColor && !isInternalUpdate.current) {
      const newHsva = rgbaToHsva(
        initialColor.r || 0,
        initialColor.g || 0,
        initialColor.b || 0,
        initialColor.a !== undefined ? initialColor.a : 1
      );
      setHsva(newHsva);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
    isInternalUpdate.current = false;
  }, [initialColor, rgbaToHsva, isInitialized]);




  const rgba = hsvaToRgba(hsva.h, hsva.s, hsva.v, hsva.a);
  const hex = rgbaToHexa(rgba);
  const hueRgb = hsvaToRgba(hsva.h, 1, 1, 1);
  const hueHex = rgbaToHexa(hueRgb);

  // Drag handlers
  const handleDrag = useCallback(
    (
      e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
      ref: React.RefObject<HTMLDivElement | null>,
      updateFn: (x: number, y: number) => void
    ) => {
      e.preventDefault()
      if (!ref.current) return

      let clientX: number
      let clientY: number

      if ("touches" in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      const rect = ref.current.getBoundingClientRect()
      let x = (clientX - rect.left) / rect.width
      let y = (clientY - rect.top) / rect.height

      x = Math.min(1, Math.max(0, x))
      y = Math.min(1, Math.max(0, y))

      updateFn(x, y)
    },
    []
  )



  const handleColorAreaDrag = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    handleDrag(e, colorAreaRef, (x, y) => {
      isInternalUpdate.current = true;
      const newHsva = { ...hsva, s: x, v: 1 - y };
      setHsva(newHsva);
      
      // Call onChange after state update
      if (onChange) {
        setTimeout(() => {
          const formattedColor = getFormattedColor(format, newHsva);
          onChange(formattedColor);
        }, 0);
      }
    });
  }, [handleDrag, onChange, format, getFormattedColor, hsva]);

  const handleHueDrag = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    handleDrag(e, hueSliderRef, (x) => {
      isInternalUpdate.current = true;
      const newHsva = { ...hsva, h: x };
      setHsva(newHsva);
      
      // Call onChange after state update
      if (onChange) {
        setTimeout(() => {
          const formattedColor = getFormattedColor(format, newHsva);
          onChange(formattedColor);
        }, 0);
      }
    });
  }, [handleDrag, onChange, format, getFormattedColor, hsva]);

  const handleAlphaDrag = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    handleDrag(e, alphaSliderRef, (x) => {
      isInternalUpdate.current = true;
      const newHsva = { ...hsva, a: x };
      setHsva(newHsva);
      
      // Call onChange after state update
      if (onChange) {
        setTimeout(() => {
          const formattedColor = getFormattedColor(format, newHsva);
          onChange(formattedColor);
        }, 0);
      }
    });
  }, [handleDrag, onChange, format, getFormattedColor, hsva]);

  // Handle drag end for onPickEnd callback
  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
    if (onPickEnd && typeof onPickEnd === 'function') {
      // Use current hsva state for onPickEnd
      setTimeout(() => {
        const formattedColor = getFormattedColor(format, hsva);
        onPickEnd(formattedColor);
      }, 0);
    }
  }, [onPickEnd, format, getFormattedColor, hsva]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging === 'color') handleColorAreaDrag(e as any);
      else if (isDragging === 'hue') handleHueDrag(e as any);
      else if (isDragging === 'alpha') handleAlphaDrag(e as any);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleColorAreaDrag, handleHueDrag, handleAlphaDrag, handleDragEnd]);

  // Input handlers
  const handleRgbaInput = useCallback((field: "r" | "g" | "b" | "a", value: string) => {
    const num = parseInt(value) || 0;
    const newRgba = { ...rgba, [field]: field === 'a' ? Math.min(100, Math.max(0, num)) / 100 : Math.min(255, Math.max(0, num)) };
    if (field !== 'a') newRgba.a = rgba.a;
    const newHsva = rgbaToHsva(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
    setHsva(newHsva);
    
    if (onPickEnd && typeof onPickEnd === 'function') {
      const formattedColor = getFormattedColor(format, newHsva);
      onPickEnd(formattedColor);
    }
  }, [rgba, rgbaToHsva, onPickEnd, format, getFormattedColor]);

  const handleHexInput = useCallback((value: string) => {
    const newRgba = hexaToRgba(value);
    if (newRgba) {
      const newHsva = rgbaToHsva(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
      setHsva(newHsva);
      
      if (onPickEnd && typeof onPickEnd === 'function') {
        const formattedColor = getFormattedColor(format, newHsva);
        onPickEnd(formattedColor);
      }
    }
  }, [hexaToRgba, rgbaToHsva, onPickEnd, format, getFormattedColor]);

  const handleSwatchClick = useCallback((swatchHex: string) => {
    const newRgba = hexaToRgba(swatchHex);
    if (newRgba) {
      const newHsva = rgbaToHsva(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
      setHsva(newHsva);
      
      if (onPickEnd && typeof onPickEnd === 'function') {
        const formattedColor = getFormattedColor(format, newHsva);
        onPickEnd(formattedColor);
      }
    }
  }, [hexaToRgba, rgbaToHsva, onPickEnd, format, getFormattedColor]);

  const handleCopyColor = () => {
    const colorToCopy = '#' + hex;
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = colorToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setMessage(`Copied: ${colorToCopy}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }

    document.body.removeChild(tempTextArea);
  };

  const handleEyedropper = async () => {
    if (!('EyeDropper' in window)) {
      setMessage('Eyedropper not supported in this browser.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const eyeDropper = new window.EyeDropper!()
    setMessage('Picking color... Click anywhere to select.');

    try {
      const { sRGBHex } = await eyeDropper.open();
      const hex8 = sRGBHex.length === 7 ? sRGBHex + 'FF' : sRGBHex.substring(1);
      const newRgba = hexaToRgba(hex8);
      if (newRgba) {
        setHsva(rgbaToHsva(newRgba.r, newRgba.g, newRgba.b, newRgba.a));
      }
      setMessage('');
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setMessage("Color selection canceled.")
      } else {
        setMessage("Error during color selection.")
      }
      setTimeout(() => setMessage(""), 3000)
    }

  };

  return (
    <>
      <style>{`
        .cp-container * { box-sizing: border-box; }
        .cp-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #2b2b2b;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8);
          user-select: none;
          color: #fff;
          max-width: 340px;
          width: 100%;
        }
        .cp-color-area-wrapper {
          position: relative;
          width: 100%;
          height: 180px;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
          border: 1px solid #3c3c3c;
        }
        .cp-color-area, .cp-color-area-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: crosshair;
        }
        .cp-color-area {
          background: linear-gradient(to right, white, transparent);
        }
        .cp-color-area-overlay {
          background: linear-gradient(to top, black, transparent);
        }
        .cp-color-indicator {
          position: absolute;
          width: 14px;
          height: 14px;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 0 1px #000, 0 0 4px rgba(0, 0, 0, 0.5);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .cp-control-panel {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .cp-eyedropper-btn {
          background-color: #3c3c3c;
          border: none;
          color: #e3e3e3;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          line-height: 0;
          flex-shrink: 0;
        }
        .cp-eyedropper-btn:hover {
          background-color: #555;
          color: #fff;
        }
        .cp-eyedropper-btn svg {
          width: 20px;
          height: 20px;
        }
        .cp-color-preview {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid #000;
          box-shadow: 0 0 0 1px #444;
          flex-shrink: 0;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .cp-color-preview:hover {
          transform: scale(1.05);
          box-shadow: 0 0 0 1px #444, 0 0 8px rgba(255, 255, 255, 0.2);
        }
        .cp-sliders-wrapper {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cp-slider-bar {
          height: 12px;
          border-radius: 6px;
          position: relative;
          cursor: pointer;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
          border: 1px solid #444;
        }
        .cp-hue-slider {
          background: linear-gradient(to right, red 0%, yellow 17%, lime 33%, cyan 50%, blue 67%, magenta 83%, red 100%);
        }
        .cp-alpha-slider {
          background-image: linear-gradient(45deg, #444 25%, transparent 25%),
            linear-gradient(-45deg, #444 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #444 75%),
            linear-gradient(-45deg, transparent 75%, #444 75%);
          background-size: 12px 12px;
          background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
        }
        .cp-alpha-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 6px;
        }
        .cp-slider-indicator {
          position: absolute;
          top: 50%;
          width: 10px;
          height: 22px;
          background-color: #fff;
          border-radius: 3px;
          border: 2px solid #000;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }
        .cp-color-inputs {
          display: flex;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 20px;
        }
        .cp-color-inputs label {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          color: #aaa;
          width: 18%;
        }
        .cp-color-inputs label:last-child {
          width: 30%;
        }
        .cp-color-inputs input {
          background-color: #3c3c3c;
          color: #fff;
          border: 1px solid #555;
          border-radius: 6px;
          padding: 6px 4px;
          margin-top: 6px;
          width: 100%;
          text-align: center;
          font-size: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cp-hex-input {
          text-align: left !important;
          padding-left: 8px !important;
          font-family: monospace !important;
        }
        .cp-color-inputs input:focus {
          outline: none;
          border-color: #797979;
          box-shadow: 0 0 0 2px rgba(121, 121, 121, 0.3);
        }
        .cp-color-inputs input[type=number]::-webkit-inner-spin-button,
        .cp-color-inputs input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        .cp-color-inputs input[type=number] {
          -moz-appearance: textfield !important;
        }
        .cp-swatch-palette {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid #3c3c3c;
        }
        .cp-swatch {
          width: 100%;
          padding-top: 100%;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid #555;
          transition: transform 0.1s, box-shadow 0.2s;
          position: relative;
        }
        .cp-swatch:hover {
          transform: scale(1.1);
          border-color: #fff;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
        }
        .cp-message-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.9);
          color: #fff;
          padding: 15px 25px;
          border-radius: 8px;
          z-index: 1000;
          font-size: 14px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }
      `}</style>

      <div className={`cp-container ${className} ${classNames.container || ''}`}>
        <div className={`cp-color-area-wrapper ${classNames.colorAreaWrapper || ''}`}>
          <div
            ref={colorAreaRef}
            className={`cp-color-area ${classNames.colorArea || ''}`}
            style={{ backgroundColor: `#${hueHex.substring(0, 6)}` }}
            onMouseDown={(e) => { handleColorAreaDrag(e); setIsDragging('color'); }}
            onTouchStart={(e) => { handleColorAreaDrag(e); setIsDragging('color'); }}
          >
            <div className={`cp-color-area-overlay ${classNames.colorAreaOverlay || ''}`}></div>
            <div
              className={`cp-color-indicator ${classNames.colorIndicator || ''}`}
              style={{
                left: `${hsva.s * 100}%`,
                top: `${(1 - hsva.v) * 100}%`,
                backgroundColor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 1)`,
                borderColor: (hsva.v * hsva.s > 0.5) ? '#000' : '#fff'
              }}
            ></div>
          </div>
        </div>

        <div className={`cp-control-panel ${classNames.controlPanel || ''}`}>
          {showEyedropper && (
            <button
              className={`cp-eyedropper-btn ${classNames.eyedropperBtn || ''}`}
              onClick={handleEyedropper}
              title="Pick color from browser viewport"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M162.82-162.82V-288.2l355.39-355.11L441.1-720l21.95-22.31 98.23 96.67L705.5-790.12q3.53-3.42 7.73-5.26 4.2-1.85 8.33-1.85 4.56 0 8.45 1.85 3.89 1.84 8.45 5.3l51.62 52.39q3.46 4.05 5.3 7.8 1.85 3.74 1.85 8.14 0 4.19-1.85 8.44-1.84 4.25-5.28 7.83L644.65-560.04l97.95 98.64-22.6 22.61-78.23-77.59L288.2-162.82H162.82Zm32.44-32.44h82.09l343.19-344.28-81-81-344.28 343.19v82.09Z" />
              </svg>
            </button>
          )}

          {showPreview && (
            <div
              className={`cp-color-preview ${classNames.colorPreview || ''}`}
              style={{ backgroundColor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${hsva.a})` }}
              onClick={handleCopyColor}
              title="Click to copy color value (#RRGGBBAA)"
            ></div>
          )}

          <div className={`cp-sliders-wrapper ${classNames.slidersWrapper || ''}`}>
            <div
              ref={hueSliderRef}
              className={`cp-slider-bar cp-hue-slider ${classNames.hueSlider || ''}`}
              onMouseDown={(e) => { handleHueDrag(e); setIsDragging('hue'); }}
              onTouchStart={(e) => { handleHueDrag(e); setIsDragging('hue'); }}
            >
              <div className={`cp-slider-indicator ${classNames.hueIndicator || ''}`} style={{ left: `${hsva.h * 100}%` }}></div>
            </div>

            <div
              ref={alphaSliderRef}
              className={`cp-slider-bar cp-alpha-slider ${classNames.alphaSlider || ''}`}
              onMouseDown={(e) => { handleAlphaDrag(e); setIsDragging('alpha'); }}
              onTouchStart={(e) => { handleAlphaDrag(e); setIsDragging('alpha'); }}
            >
              <div
                className={`cp-alpha-gradient ${classNames.alphaGradient || ''}`}
                style={{ background: `linear-gradient(to right, #${hex.substring(0, 6)}00, #${hex.substring(0, 6)}FF)` }}
              ></div>
              <div className={`cp-slider-indicator ${classNames.alphaIndicator || ''}`} style={{ left: `${hsva.a * 100}%` }}></div>
            </div>
          </div>
        </div>

        {showInputs && (
          <div className={`cp-color-inputs ${classNames.colorInputs || ''}`}>
            <label className={classNames.inputLabel || ''}>
              R
              <input
                type="number"
                value={rgba.r}
                onChange={(e) => handleRgbaInput('r', e.target.value)}
                min="0"
                max="255"
                className={classNames.input || ''}
              />
            </label>
            <label className={classNames.inputLabel || ''}>
              G
              <input
                type="number"
                value={rgba.g}
                onChange={(e) => handleRgbaInput('g', e.target.value)}
                min="0"
                max="255"
                className={classNames.input || ''}
              />
            </label>
            <label className={classNames.inputLabel || ''}>
              B
              <input
                type="number"
                value={rgba.b}
                onChange={(e) => handleRgbaInput('b', e.target.value)}
                min="0"
                max="255"
                className={classNames.input || ''}
              />
            </label>
            <label className={classNames.inputLabel || ''}>
              A%
              <input
                type="number"
                value={Math.round(hsva.a * 100)}
                onChange={(e) => handleRgbaInput('a', e.target.value)}
                min="0"
                max="100"
                className={classNames.input || ''}
              />
            </label>
            <label className={classNames.inputLabel || ''}>
              Hex
              <input
                type="text"
                className={`cp-hex-input ${classNames.hexInput || ''}`}
                value={hex}
                onChange={(e) => handleHexInput(e.target.value)}
                maxLength={8}
              />
            </label>
          </div>
        )}

        {showSwatches && (
          <div className={`cp-swatch-palette ${classNames.swatchPalette || ''}`}>
            {presetSwatches.map((swatchHex, idx) => (
              <div
                key={idx}
                className={`cp-swatch ${classNames.swatch || ''}`}
                style={{ backgroundColor: `#${swatchHex.substring(1, 7)}` }}
                onClick={() => handleSwatchClick(swatchHex)}
                title={swatchHex}
              ></div>
            ))}
          </div>
        )}
      </div>

      {message && <div className={`cp-message-box ${classNames.messageBox || ''}`}>{message}</div>}
    </>
  );
};
