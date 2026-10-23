import { useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

interface EditableNumberProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
  valueWidth?: number;
}

interface AnimatedNumberProps {
  value: number;
  unit?: string;
  valueWidth?: number;
}

export function AnimatedNumber({
  value,
  unit = "",
  valueWidth,
}: AnimatedNumberProps) {
  const [previousValue, setPreviousValue] = useState(value);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const variants: Variants = {
    enter: (changeDirection: number) => ({
      opacity: 0,
      y: changeDirection > 0 ? "100%" : "-100%",
    }),
    center: { opacity: 1, y: "0%" },
    exit: (changeDirection: number) => ({
      opacity: 0,
      y: changeDirection > 0 ? "-100%" : "100%",
    }),
  };

  if (value !== previousValue) {
    setDirection(value > previousValue ? 1 : -1);
    setPreviousValue(value);
  }

  return (
    <span
      className="inline-grid h-[1em] shrink-0 overflow-hidden whitespace-nowrap align-middle leading-none"
      style={valueWidth ? { width: `${valueWidth}ch` } : undefined}
    >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.span
          key={value}
          custom={direction}
          variants={variants}
          initial={reduceMotion ? "center" : "enter"}
          animate="center"
          exit={reduceMotion ? undefined : "exit"}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
          className="col-start-1 row-start-1 whitespace-nowrap tabular-nums"
        >
          {value}
          {unit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function EditableNumber({
  label,
  value,
  unit = "",
  min,
  max,
  onChange,
  valueWidth,
}: EditableNumberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelEditRef = useRef(false);

  useLayoutEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    cancelEditRef.current = false;
    setDraft(String(value));
    setIsEditing(true);
  };

  const commit = () => {
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      setIsEditing(false);
      return;
    }
    const parsed = Number(draft);
    if (draft.trim() !== "" && Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
    setIsEditing(false);
  };

  return (
    <span className="inline-flex min-w-0 items-center whitespace-nowrap">
      {label && <span className="mr-1">{label}:</span>}
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          step="any"
          min={min}
          max={max}
          inputMode="decimal"
          value={draft}
          aria-label={`${label} value`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            } else if (event.key === "Escape") {
              cancelEditRef.current = true;
              setDraft(String(value));
              event.currentTarget.blur();
              setIsEditing(false);
            }
          }}
          className="numeric-input w-20 shrink-0 select-text rounded border border-blue-500 bg-white px-1 text-sm text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
        />
      ) : (
        <span
          onDoubleClick={startEditing}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              startEditing();
            }
          }}
          role="button"
          tabIndex={0}
          title="Double-click to enter a value"
          className="inline-flex cursor-text items-center focus-visible:outline focus-visible:outline-1 focus-visible:outline-blue-500"
        >
          <AnimatedNumber value={value} unit={unit} valueWidth={valueWidth} />
        </span>
      )}
    </span>
  );
}
