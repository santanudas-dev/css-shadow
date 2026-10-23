import { useShadowStore } from "../store/shadowStore";
import { Trash2, Copy } from "lucide-react";
import { Slider } from "@/components/ui/slider";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Switch } from "@/components/ui/switch";

import { useRef, useState, useCallback } from "react";
import { FloatingColorPicker } from "./FloatingColorPicker";
import { EditableNumber } from "./EditableNumber";

type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type HSVA = {
  h: number;
  s: number;
  v: number;
  a: number;
};

type FormattedColor = string | RGBA | HSVA;

function getOpacity(color: string) {
  const hex = color.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i);
  if (hex) {
    const digits = hex[1];
    const alpha =
      digits.length === 4
        ? digits[3] + digits[3]
        : digits.length === 8
          ? digits.slice(6)
          : "ff";
    return Math.round((parseInt(alpha, 16) / 255) * 100);
  }

  const colorMix = color.match(
    /^color-mix\(in srgb,\s*.+?\s+([\d.]+)%,\s*transparent\)$/i,
  );
  if (colorMix) {
    return Math.round(Math.min(100, Math.max(0, Number(colorMix[1]))));
  }

  const colorFunction = color.match(/^(rgba?|hsla?)\((.+)\)$/i);
  if (colorFunction) {
    const [channels, slashAlpha] = colorFunction[2].split("/");
    const values = channels.includes(",")
      ? channels.split(",")
      : channels.trim().split(/\s+/);
    const alpha = slashAlpha?.trim() ?? (values.length === 4 ? values[3] : "1");
    const parsedAlpha = parseFloat(alpha);
    if (Number.isFinite(parsedAlpha)) {
      return Math.round(
        Math.min(1, Math.max(0, alpha.endsWith("%") ? parsedAlpha / 100 : parsedAlpha)) *
          100,
      );
    }
  }

  return 100;
}

function setColorOpacity(color: string, opacity: number) {
  const normalizedOpacity = Math.min(100, Math.max(0, opacity)) / 100;
  const hex = color.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = digits
        .split("")
        .map((digit) => digit + digit)
        .join("");
    }
    const rgb = digits.length === 8 ? digits.slice(0, 6) : digits;
    const alpha = Math.round(normalizedOpacity * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${rgb}${alpha}`;
  }

  const colorMix = color.match(
    /^color-mix\(in srgb,\s*(.+?)\s+[\d.]+%,\s*transparent\)$/i,
  );
  if (colorMix) {
    return `color-mix(in srgb, ${colorMix[1]} ${opacity}%, transparent)`;
  }

  const colorFunction = color.match(/^(rgba?|hsla?)\((.+)\)$/i);
  if (colorFunction) {
    const channels = colorFunction[2].split("/")[0];
    const values = channels.includes(",")
      ? channels.split(",").slice(0, 3)
      : channels.trim().split(/\s+/).slice(0, 3);
    const functionName = colorFunction[1].toLowerCase().startsWith("hsl")
      ? "hsla"
      : "rgba";
    return `${functionName}(${values.join(", ")}, ${normalizedOpacity})`;
  }

  return `color-mix(in srgb, ${color} ${opacity}%, transparent)`;
}

export default function LeftSidebar() {
  const {
    cards,
    activeCardId,
    activeShadowId,
    updateShadow,
    removeShadow,
    duplicateShadow,
  } = useShadowStore();

  const activeCard = cards.find((c) => c.id === activeCardId);
  const shadows = activeCard?.shadows || [];
  const activeShadow = shadows.find((s) => s.id === activeShadowId);
  const colorAnchorRef = useRef<HTMLDivElement | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleColorChange = useCallback(
    (color: FormattedColor) => {
      if (activeShadow) {
        const colorString =
          typeof color === "string"
            ? color
            : "r" in color
              ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
              : `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`;
        updateShadow(activeShadow.id, { color: colorString });
      }
    },
    [activeShadow, updateShadow],
  );

  const handleColorPickerClose = useCallback(() => {
    setColorPickerOpen(false);
  }, []);

  const handleColorSwatchClick = useCallback(() => {
    setColorPickerOpen(true);
  }, []);

  if (!activeShadow) {
    return (
      <div className="h-full min-h-0 w-full min-w-50 overflow-y-auto overscroll-contain border-r border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 no-scrollbar">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No shadow selected
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 min-w-50 overflow-y-auto overscroll-contain border-r border-black/10 bg-[#FAFAFA] p-6 dark:border-white/10 dark:bg-[#252525] no-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Properties
        </h2>
        <div className="flex gap-2">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => duplicateShadow(activeShadow.id)}
                variant="outline"
                className="cursor-pointer rounded-xs dark:bg-[#0e130f] hover:dark:bg-[#0e130f]/50"
              >
                <Copy size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-none py-1">
              <p>Duplicate</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => removeShadow(activeShadow.id)}
                className="hover:text-red-600 hover:bg-red-600/10 cursor-pointer  rounded-xs dark:bg-[#0e130f] dark:hover:bg-red-600/10 dark:hover:border-red-600/10"
                variant={"outline"}
              >
                <Trash2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-none py-1">
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
            className="focus-visible:ring-blue-600 focus-visible:ring-1"
          />
        </Field>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            <EditableNumber
              label="Offset X"
              value={activeShadow.offsetX}
              unit="px"
              min={-100}
              max={100}
              onChange={(offsetX) =>
                updateShadow(activeShadow.id, { offsetX })
              }
            />
          </label>
          <Slider
            min={-100}
            max={100}
            step={0.1}
            value={[activeShadow.offsetX]}
            onValueChange={([value]) =>
              updateShadow(activeShadow.id, {
                offsetX: value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            <EditableNumber
              label="Offset Y"
              value={activeShadow.offsetY}
              unit="px"
              min={-100}
              max={100}
              onChange={(offsetY) =>
                updateShadow(activeShadow.id, { offsetY })
              }
            />
          </label>
          <Slider
            min={-100}
            max={100}
            step={0.1}
            value={[activeShadow.offsetY]}
            onValueChange={([value]) =>
              updateShadow(activeShadow.id, {
                offsetY: value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            <EditableNumber
              label="Blur"
              value={activeShadow.blur}
              unit="px"
              min={0}
              max={100}
              onChange={(blur) => updateShadow(activeShadow.id, { blur })}
            />
          </label>
          <Slider
            min={0}
            max={100}
            step={0.1}
            value={[activeShadow.blur]}
            onValueChange={([value]) =>
              updateShadow(activeShadow.id, {
                blur: value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            <EditableNumber
              label="Spread"
              value={activeShadow.spread}
              unit="px"
              min={-50}
              max={50}
              onChange={(spread) => updateShadow(activeShadow.id, { spread })}
            />
          </label>
          <Slider
            min={-50}
            max={50}
            step={0.1}
            value={[activeShadow.spread]}
            onValueChange={([value]) =>
              updateShadow(activeShadow.id, {
                spread: value,
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex gap-2 items-center">
            <div
              ref={colorAnchorRef}
              onClick={handleColorSwatchClick}
              className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded transition-colors duration-200"
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
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            <EditableNumber
              label="Opacity"
              value={getOpacity(activeShadow.color)}
              unit="%"
              min={0}
              max={100}
              onChange={(value) => {
                updateShadow(activeShadow.id, {
                  color: setColorOpacity(activeShadow.color, value),
                });
              }}
            />
          </label>
          <Slider
            min={0}
            max={100}
            step={0.1}
            value={[
              getOpacity(activeShadow.color),
            ]}
            onValueChange={([value]) => {
              updateShadow(activeShadow.id, {
                color: setColorOpacity(activeShadow.color, value),
              });
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
  );
}
