import { useShadowStore } from "../store/shadowStore";
import type { Shadow } from "../store/shadowStore";
import { Plus, Layers, GripVertical, Copy, Magnet, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { FloatingColorPicker } from "./FloatingColorPicker";
import { AnimatedNumber, EditableNumber } from "./EditableNumber";
import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
const EMPTY_SHADOWS: Shadow[] = [];
const SIDEBAR_TABS = ["layers", "presets", "export"] as const;

function TerminalCode({ code }: { code: string }) {
  const reduceMotion = useReducedMotion();
  const [typing, setTyping] = useState({ code, length: 0 });

  if (typing.code !== code) {
    setTyping({ code, length: reduceMotion ? code.length : 0 });
  }

  useEffect(() => {
    if (reduceMotion) return;

    let timeout = 0;
    const typeNextCharacters = () => {
      setTyping(current => {
        if (current.code !== code || current.length >= code.length) {
          return current;
        }

        const next = {
          ...current,
          length: Math.min(current.length + 1, code.length),
        };
        if (next.length < code.length) {
          timeout = window.setTimeout(typeNextCharacters, 40);
        }
        return next;
      });
    };

    timeout = window.setTimeout(typeNextCharacters, 40);

    return () => window.clearTimeout(timeout);
  }, [code, reduceMotion]);

  const visibleLength =
    reduceMotion || typing.code !== code ? code.length : typing.length;

  return (
    <>
      {code.slice(0, visibleLength)}
      <motion.span
        aria-hidden="true"
        animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.9, repeat: Infinity, ease: "linear" }
        }
        className="ml-0.5 inline-block h-[1em] w-px translate-y-0.5 bg-current"
      />
    </>
  );
}

const PRESETS = [
  {
    name: "Apple macOS Window",
    shadows: [
      {
        id: "apple-key",
        name: "Contact Key",
        offsetX: 0,
        offsetY: 2,
        blur: 8,
        spread: 0,
        color: "#0000001f", // 12% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "apple-ambient",
        name: "Ambient Fill",
        offsetX: 0,
        offsetY: 20,
        blur: 40,
        spread: -4,
        color: "#00000033", // 20% opacity
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: "Vercel Modern Card",
    shadows: [
      {
        id: "vercel-border",
        name: "Subtle Border",
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 1,
        color: "#0000000d", // 5% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "vercel-shadow-sm",
        name: "Key Shadow",
        offsetX: 0,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: "#00000008", // 3% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "vercel-shadow-lg",
        name: "Ambient Elevation",
        offsetX: 0,
        offsetY: 12,
        blur: 24,
        spread: -4,
        color: "#00000012", // 7% opacity
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: "Linear Dark Elevated",
    shadows: [
      {
        id: "linear-key",
        name: "Sharp Grounding",
        offsetX: 0,
        offsetY: 1,
        blur: 2,
        spread: 0,
        color: "#00000026", // 15% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "linear-mid",
        name: "Mid Depth",
        offsetX: 0,
        offsetY: 8,
        blur: 16,
        spread: -2,
        color: "#00000040", // 25% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "linear-ambient",
        name: "Deep Glow",
        offsetX: 0,
        offsetY: 24,
        blur: 48,
        spread: -12,
        color: "#00000066", // 40% opacity
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: "Stripe Multi-Tier",
    shadows: [
      {
        id: "stripe-1",
        name: "Near Shadow",
        offsetX: 0,
        offsetY: 4,
        blur: 6,
        spread: -1,
        color: "#32325d1a", // Tinted ambient
        inset: false,
        enabled: true,
      },
      {
        id: "stripe-2",
        name: "Far Elevation",
        offsetX: 0,
        offsetY: 13,
        blur: 27,
        spread: -5,
        color: "#32325d40",
        inset: false,
        enabled: true,
      },
      {
        id: "stripe-3",
        name: "Contact Core",
        offsetX: 0,
        offsetY: 8,
        blur: 16,
        spread: -8,
        color: "#0000004d",
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: "Raycast Command Bar",
    shadows: [
      {
        id: "raycast-border",
        name: "Top Highlight Ring",
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 1,
        color: "#ffffff1f", // Inset/Outset border highlight
        inset: false,
        enabled: true,
      },
      {
        id: "raycast-elevation-1",
        name: "Floating Shadow",
        offsetX: 0,
        offsetY: 16,
        blur: 32,
        spread: -8,
        color: "#00000080", // 50% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "raycast-elevation-2",
        name: "Far Atmosphere",
        offsetX: 0,
        offsetY: 32,
        blur: 64,
        spread: -16,
        color: "#00000066", // 40% opacity
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: "Google Material 3 (Level 3)",
    shadows: [
      {
        id: "m3-key",
        name: "Key Light",
        offsetX: 0,
        offsetY: 1,
        blur: 3,
        spread: 0,
        color: "#0000004d", // 30% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "m3-ambient",
        name: "Ambient Light",
        offsetX: 0,
        offsetY: 4,
        blur: 8,
        spread: 3,
        color: "#00000026", // 15% opacity
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: "GitHub Floating Popover",
    shadows: [
      {
        id: "github-border",
        name: "Subtle Ring",
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 1,
        color: "#1f232826",
        inset: false,
        enabled: true,
      },
      {
        id: "github-soft",
        name: "Soft Drop",
        offsetX: 0,
        offsetY: 8,
        blur: 24,
        spread: 0,
        color: "#8c959f33",
        inset: false,
        enabled: true,
      },
    ],
  },
  {
    name: "Indigo Glow (Modern SaaS)",
    shadows: [
      {
        id: "glow-core",
        name: "Color Ambient",
        offsetX: 0,
        offsetY: 12,
        blur: 32,
        spread: -4,
        color: "#4f46e540", // Indigo 600 at 25% opacity
        inset: false,
        enabled: true,
      },
      {
        id: "glow-ground",
        name: "Ground Shadow",
        offsetX: 0,
        offsetY: 4,
        blur: 12,
        spread: -2,
        color: "#0000001f",
        inset: false,
        enabled: true,
      },
    ],
  },
];

interface SortableLayerProps {
  shadow: Shadow;
  isSelected: boolean;
  onSelect: (event: MouseEvent<HTMLDivElement>) => void;
}

function SortableLayer({
  shadow,
  isSelected,
  onSelect,
}: SortableLayerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shadow.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex select-none items-center gap-2 p-3 rounded-xs border-2 transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          aria-pressed={isSelected}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {shadow.name}
          </span>
          <span
            className={`text-xs ${
              shadow.enabled
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400"
            }`}
          >
            {shadow.enabled ? "●" : "○"}
          </span>
        </button>
        <div className="mt-1 grid h-8 grid-cols-2 grid-rows-2 items-center gap-x-1 overflow-hidden text-xs leading-none text-gray-500 dark:text-gray-400 font-mono">
          <span className="flex min-w-0 items-center whitespace-nowrap" title="Offset X" aria-label={`Offset X: ${shadow.offsetX} pixels`}>
            X: <AnimatedNumber value={shadow.offsetX} unit="px" valueWidth={6} />
          </span>
          <span className="flex min-w-0 items-center whitespace-nowrap" title="Offset Y" aria-label={`Offset Y: ${shadow.offsetY} pixels`}>
            Y: <AnimatedNumber value={shadow.offsetY} unit="px" valueWidth={6} />
          </span>
          <span className="flex min-w-0 items-center whitespace-nowrap" title="Blur" aria-label={`Blur: ${shadow.blur} pixels`}>
            B: <AnimatedNumber value={shadow.blur} unit="px" valueWidth={6} />
          </span>
          <span className="flex min-w-0 items-center whitespace-nowrap" title="Spread" aria-label={`Spread: ${shadow.spread} pixels`}>
            S: <AnimatedNumber value={shadow.spread} unit="px" valueWidth={6} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RightSidebar() {
  const {
    cards,
    activeCardId,
    activeShadowId,
    addShadow,
    setActiveShadow,
    removeShadows,
    canvasBgColor,
    canvasDarkBgColor,
    setCanvasBgColor,
    setCanvasDarkBgColor,
    loadPreset,
  } = useShadowStore();

  const [selectedShadowIds, setSelectedShadowIds] = useState<string[]>(
    () => (activeShadowId ? [activeShadowId] : []),
  );
  const rangeAnchorId = useRef<string | null>(activeShadowId);
  const activeCard = cards.find((c) => c.id === activeCardId);
  const shadows = activeCard?.shadows ?? EMPTY_SHADOWS;
  const selectedIdsOnCard = useMemo(
    () => selectedShadowIds.filter(id => shadows.some(shadow => shadow.id === id)),
    [selectedShadowIds, shadows],
  );
  const cardBgColor = activeCard?.bgColor || "#ffffff";
  const cardDarkBgColor = activeCard?.darkBgColor || "#000000";
  const cardWidth = activeCard?.width || 300;
  const cardHeight = activeCard?.height || 200;
  const cardRadius = activeCard?.radius || 16;

  const setCardBgColor = useShadowStore((state) => state.setCardBgColor);
  const setCardDarkBgColor = useShadowStore(
    (state) => state.setCardDarkBgColor,
  );
  const setCardDimensions = useShadowStore((state) => state.setCardDimensions);
  const setCardRadius = useShadowStore((state) => state.setCardRadius);

  const [activeTab, setActiveTab] = useState<"layers" | "presets" | "export">(
    "layers",
  );
  const [exportFormat, setExportFormat] = useState<
    "css" | "tailwind" | "react" | "html"
  >("css");
  const tabIndex = SIDEBAR_TABS.indexOf(activeTab);
  const reduceMotion = useReducedMotion();

  const layersRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const changeTab = (nextTab: (typeof SIDEBAR_TABS)[number]) => {
    setActiveTab(nextTab);
  };

  useEffect(() => {
    let previousCardId = useShadowStore.getState().activeCardId;
    let previousShadowIds = new Set(
      useShadowStore.getState().cards.find(card => card.id === previousCardId)
        ?.shadows.map(shadow => shadow.id) ?? [],
    );
    return useShadowStore.subscribe(state => {
      const nextShadowIds = new Set(
        state.cards.find(card => card.id === state.activeCardId)
          ?.shadows.map(shadow => shadow.id) ?? [],
      );
      const cardChanged = state.activeCardId !== previousCardId;
      const activeShadowWasAdded =
        state.activeShadowId !== null &&
        nextShadowIds.has(state.activeShadowId) &&
        !previousShadowIds.has(state.activeShadowId);

      if (cardChanged || activeShadowWasAdded) {
        const selectedId = state.activeShadowId;
        setSelectedShadowIds(selectedId ? [selectedId] : []);
        rangeAnchorId.current = selectedId;
      }

      previousCardId = state.activeCardId;
      previousShadowIds = nextShadowIds;
    });
  }, []);

  const handleAddShadow = () => {
    addShadow();
    const newActiveShadowId = useShadowStore.getState().activeShadowId;
    if (newActiveShadowId) {
      setSelectedShadowIds([newActiveShadowId]);
      rangeAnchorId.current = newActiveShadowId;
    }
  };

  const handleLayerSelect = (
    shadowId: string,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    let nextSelection: string[];
    if (event.shiftKey) {
      const anchorIndex = shadows.findIndex(
        shadow => shadow.id === rangeAnchorId.current,
      );
      const clickedIndex = shadows.findIndex(shadow => shadow.id === shadowId);
      if (anchorIndex >= 0 && clickedIndex >= 0) {
        const start = Math.min(anchorIndex, clickedIndex);
        const end = Math.max(anchorIndex, clickedIndex);
        const range = shadows.slice(start, end + 1).map(shadow => shadow.id);
        nextSelection =
          event.ctrlKey || event.metaKey
            ? [...new Set([...selectedIdsOnCard, ...range])]
            : range;
      } else {
        nextSelection = [shadowId];
        rangeAnchorId.current = shadowId;
      }
    } else if (event.ctrlKey || event.metaKey) {
      nextSelection = selectedIdsOnCard.includes(shadowId)
        ? selectedIdsOnCard.filter(id => id !== shadowId)
        : [...selectedIdsOnCard, shadowId];
      rangeAnchorId.current = shadowId;
    } else {
      nextSelection = [shadowId];
      rangeAnchorId.current = shadowId;
    }
    setSelectedShadowIds(nextSelection);
    const nextActiveId = nextSelection.includes(shadowId)
      ? shadowId
      : nextSelection[nextSelection.length - 1];
    if (nextActiveId) setActiveShadow(nextActiveId);
  };

  const deleteSelectedShadows = useCallback(() => {
    if (selectedIdsOnCard.length === 0) return;
    removeShadows(selectedIdsOnCard);
    const nextActiveShadowId = useShadowStore.getState().activeShadowId;
    setSelectedShadowIds(nextActiveShadowId ? [nextActiveShadowId] : []);
    rangeAnchorId.current = nextActiveShadowId;
  }, [removeShadows, selectedIdsOnCard]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && activeCardId) {
      const movingIds = new Set(
        selectedIdsOnCard.includes(String(active.id))
          ? selectedIdsOnCard
          : [String(active.id)],
      );
      if (movingIds.has(String(over.id))) return;

      const originalTargetIndex = shadows.findIndex(
        shadow => shadow.id === String(over.id),
      );
      const firstMovingIndex = shadows.findIndex(shadow =>
        movingIds.has(shadow.id),
      );
      const movingShadows = shadows.filter(shadow => movingIds.has(shadow.id));
      const remainingShadows = shadows.filter(shadow => !movingIds.has(shadow.id));
      let insertIndex = remainingShadows.findIndex(
        shadow => shadow.id === String(over.id),
      );
      if (originalTargetIndex > firstMovingIndex) insertIndex += 1;
      insertIndex = Math.max(0, Math.min(insertIndex, remainingShadows.length));
      const newShadows = [
        ...remainingShadows.slice(0, insertIndex),
        ...movingShadows,
        ...remainingShadows.slice(insertIndex),
      ];

      useShadowStore.setState((state) => ({
        cards: state.cards.map((c) =>
          c.id === activeCardId ? { ...c, shadows: newShadows } : c,
        ),
      }));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = String(event.active.id);
    if (!selectedIdsOnCard.includes(draggedId)) {
      setSelectedShadowIds([draggedId]);
      rangeAnchorId.current = draggedId;
      setActiveShadow(draggedId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName) ||
          target.closest('[role="slider"]') !== null)
      ) {
        return;
      }

      if (selectedIdsOnCard.length > 0) {
        event.preventDefault();
        deleteSelectedShadows();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedShadows, selectedIdsOnCard]);

  const generateShadowValue = () => {
    const enabledShadows = shadows.filter((s) => s.enabled);
    if (enabledShadows.length === 0) return "none";

    const shadowStrings = enabledShadows.map((s) => {
      const inset = s.inset ? "inset " : "";
      return `${inset}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`;
    });

    return shadowStrings.join(", ");
  };

  const generateExport = () => {
    const shadowValue = generateShadowValue();
    switch (exportFormat) {
      case "tailwind":
        return shadowValue === "none"
          ? "shadow-none"
          : `shadow-[${shadowValue.replaceAll(" ", "_")}]`;
      case "react":
        return `style={{ boxShadow: ${JSON.stringify(shadowValue)} }}`;
      case "html":
        return `style="box-shadow: ${shadowValue};"`;
      default:
        return `box-shadow: ${shadowValue};`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateExport());
  };

  useEffect(() => {
    const el = layersRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [shadows.length]);

  const [magnetOn, setMagnetOn] = useState(false);
  const [cardBgColorPickerOpen, setCardBgColorPickerOpen] = useState(false);
  const [cardDarkBgColorPickerOpen, setCardDarkBgColorPickerOpen] =
    useState(false);
  const [canvasBgColorPickerOpen, setCanvasBgColorPickerOpen] = useState(false);
  const [canvasDarkBgColorPickerOpen, setCanvasDarkBgColorPickerOpen] =
    useState(false);
  const cardBgColorAnchorRef = useRef<HTMLDivElement | null>(null);
  const cardDarkBgColorAnchorRef = useRef<HTMLDivElement | null>(null);
  const canvasBgColorAnchorRef = useRef<HTMLDivElement | null>(null);
  const canvasDarkBgColorAnchorRef = useRef<HTMLDivElement | null>(null);

  const handleCardBgColorChange = useCallback(
    (color: FormattedColor) => {
      const colorString =
        typeof color === "string"
          ? color
          : "r" in color
            ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
            : `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`;
      setCardBgColor(colorString);
    },
    [setCardBgColor],
  );

  const handleCanvasBgColorChange = useCallback(
    (color: FormattedColor) => {
      const colorString =
        typeof color === "string"
          ? color
          : "r" in color
            ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
            : `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`;
      setCanvasBgColor(colorString);
    },
    [setCanvasBgColor],
  );

  const handleCardDarkBgColorChange = useCallback(
    (color: FormattedColor) => {
      const colorString =
        typeof color === "string"
          ? color
          : "r" in color
            ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
            : `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`;
      setCardDarkBgColor(colorString);
    },
    [setCardDarkBgColor],
  );

  const handleCanvasDarkBgColorChange = useCallback(
    (color: FormattedColor) => {
      const colorString =
        typeof color === "string"
          ? color
          : "r" in color
            ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
            : `hsla(${color.h}, ${color.s}%, ${color.v}%, ${color.a})`;
      setCanvasDarkBgColor(colorString);
    },
    [setCanvasDarkBgColor],
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-50 flex-col border-l border-black/10 bg-[#FAFAFA] dark:border-white/10 dark:bg-[#252525]">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => changeTab("layers")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "layers"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Layers
        </button>
        <button
          onClick={() => changeTab("presets")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "presets"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => changeTab("export")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "export"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Export
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <motion.div
          className="flex h-full w-[300%]"
          animate={{ x: `${-tabIndex * (100 / SIDEBAR_TABS.length)}%` }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
        <div
          aria-hidden={activeTab !== "layers"}
          inert={activeTab !== "layers"}
          className="h-full w-1/3 shrink-0 overflow-y-auto overscroll-contain p-6 no-scrollbar"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xs">
                  <Layers
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Shadow Layers
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center whitespace-nowrap">
                      <AnimatedNumber value={shadows.length} valueWidth={2} />
                      <span className="ml-1">
                        {shadows.length === 1 ? "layer" : "layers"}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAddShadow}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 rounded-xs text-white transition-colors"
                title="Add Shadow Layer"
              >
                <Plus size={16} />
              </Button>
            </div>
            {selectedIdsOnCard.length > 1 && (
              <div className="flex items-center justify-between rounded-xs border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                <span>{selectedIdsOnCard.length} layers selected</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteSelectedShadows}
                  className="h-8 gap-1 border-red-300 px-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            )}

            {shadows.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xs">
                <Layers size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  No shadow layers yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  Create your first shadow to get started
                </p>
                <Button
                  onClick={handleAddShadow}
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={shadows.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    ref={layersRef}
                    className="space-y-2 max-h-75 overflow-y-scroll layers"
                  >
                    {shadows.map((shadow) => (
                      <SortableLayer
                        key={shadow.id}
                        shadow={shadow}
                        isSelected={selectedIdsOnCard.includes(shadow.id)}
                        onSelect={(event) => handleLayerSelect(shadow.id, event)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <div className="pt-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xs">
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
                  Card Background (Light)
                </label>
                <div className="flex gap-2">
                  <div
                    ref={cardBgColorAnchorRef}
                    onClick={() => setCardBgColorPickerOpen(true)}
                    className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded transition-colors duration-200"
                    style={{ backgroundColor: cardBgColor }}
                  />
                  <Input
                    type="text"
                    value={cardBgColor}
                    onChange={(e) => setCardBgColor(e.target.value)}
                    className="focus-visible:ring-blue-600 focus-visible:ring-1"
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
                  Card Background (Dark)
                </label>
                <div className="flex gap-2">
                  <div
                    ref={cardDarkBgColorAnchorRef}
                    onClick={() => setCardDarkBgColorPickerOpen(true)}
                    className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded transition-colors duration-200"
                    style={{ backgroundColor: cardDarkBgColor }}
                  />
                  <Input
                    type="text"
                    value={cardDarkBgColor}
                    onChange={(e) => setCardDarkBgColor(e.target.value)}
                    className="focus-visible:ring-blue-600 focus-visible:ring-1"
                  />
                </div>
                {cardDarkBgColorPickerOpen && (
                  <FloatingColorPicker
                    anchorRef={cardDarkBgColorAnchorRef}
                    value={cardDarkBgColor}
                    onChange={handleCardDarkBgColorChange}
                    onChangeEnd={handleCardDarkBgColorChange}
                    onClose={() => setCardDarkBgColorPickerOpen(false)}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canvas Background (Light)
                </label>
                <div className="flex gap-2">
                  <div
                    ref={canvasBgColorAnchorRef}
                    onClick={() => setCanvasBgColorPickerOpen(true)}
                    className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded transition-colors duration-200"
                    style={{ backgroundColor: canvasBgColor }}
                  />
                  <Input
                    type="text"
                    value={canvasBgColor}
                    onChange={(e) => setCanvasBgColor(e.target.value)}
                    className="focus-visible:ring-blue-600 focus-visible:ring-1"
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
                  Canvas Background (Dark)
                </label>
                <div className="flex gap-2">
                  <div
                    ref={canvasDarkBgColorAnchorRef}
                    onClick={() => setCanvasDarkBgColorPickerOpen(true)}
                    className="w-12 h-10 cursor-pointer border border-gray-200 dark:border-gray-700 rounded transition-colors duration-200"
                    style={{ backgroundColor: canvasDarkBgColor }}
                  />
                  <Input
                    type="text"
                    value={canvasDarkBgColor}
                    onChange={(e) => setCanvasDarkBgColor(e.target.value)}
                    className="focus-visible:ring-blue-600 focus-visible:ring-1"
                  />
                </div>
                {canvasDarkBgColorPickerOpen && (
                  <FloatingColorPicker
                    anchorRef={canvasDarkBgColorAnchorRef}
                    value={canvasDarkBgColor}
                    onChange={handleCanvasDarkBgColorChange}
                    onChangeEnd={handleCanvasDarkBgColorChange}
                    onClose={() => setCanvasDarkBgColorPickerOpen(false)}
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <EditableNumber
                    label="Width"
                    value={cardWidth}
                    unit="px"
                    min={100}
                    max={600}
                    onChange={(width) =>
                      setCardDimensions(width, cardHeight)
                    }
                  />
                </label>
                <Slider
                  min={100}
                  max={600}
                  step={0.1}
                  value={[cardWidth]}
                  onValueChange={([value]) =>
                    setCardDimensions(value, cardHeight)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <EditableNumber
                    label="Height"
                    value={cardHeight}
                    unit="px"
                    min={100}
                    max={600}
                    onChange={(height) =>
                      setCardDimensions(cardWidth, height)
                    }
                  />
                </label>
                <Slider
                  min={100}
                  max={600}
                  step={0.1}
                  value={[cardHeight]}
                  onValueChange={([value]) =>
                    setCardDimensions(cardWidth, value)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <EditableNumber
                    label="Border Radius"
                    value={cardRadius}
                    unit="px"
                    min={0}
                    max={100}
                    onChange={setCardRadius}
                  />
                </label>
                <Slider
                  min={0}
                  max={100}
                  step={0.1}
                  value={[cardRadius]}
                  onValueChange={([value]) => setCardRadius(value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden={activeTab !== "presets"}
          inert={activeTab !== "presets"}
          className="h-full w-1/3 shrink-0 overflow-y-auto overscroll-contain p-6 no-scrollbar"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Shadow Presets
              </h3>
              <button
                onClick={() => setMagnetOn((v) => !v)}
                title="Append preset instead of replacing"
                className={`p-2 rounded-xs border cursor-pointer
      ${
        magnetOn
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-transparent text-gray-500 border-gray-300 dark:border-gray-600"
      }`}
              >
                <Magnet size={16} />
              </button>
            </div>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset.shadows, magnetOn)}
                className="w-full p-2 cursor-pointer rounded-xs border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 text-left transition-colors group"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {preset.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {preset.shadows.length} shadow
                  {preset.shadows.length > 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div
          aria-hidden={activeTab !== "export"}
          inert={activeTab !== "export"}
          className="h-full w-1/3 shrink-0 overflow-y-auto overscroll-contain p-6 no-scrollbar"
        >
          <Card className="border-border bg-card text-card-foreground shadow-sm rounded-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Export shadow
                </CardTitle>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={copyToClipboard}
                  className="gap-2 cursor-pointer rounded-xs"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div
                role="group"
                aria-label="Export format"
                className="mb-3 grid grid-cols-2 gap-2"
              >
                {(
                  [
                    ["css", "CSS"],
                    ["tailwind", "Tailwind"],
                    ["react", "React inline"],
                    ["html", "HTML inline"],
                  ] as const
                ).map(([format, label]) => (
                  <button
                    key={format}
                    type="button"
                    aria-pressed={exportFormat === format}
                    onClick={() => setExportFormat(format)}
                    className={`rounded-xs border px-2 py-1.5 text-xs font-medium transition-colors ${
                      exportFormat === format
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ScrollArea className="h-36 rounded-xs border border-border bg-muted">
                <pre className="whitespace-pre-wrap break-all p-4 font-mono text-xs text-foreground">
                  <code>
                    <TerminalCode code={generateExport()} />
                  </code>
                </pre>
              </ScrollArea>

              <p className="mt-2 text-xs text-muted-foreground">
                Copy the selected format for your project.
              </p>
            </CardContent>
          </Card>
        </div>
        </motion.div>
      </div>
    </div>
  );
}
