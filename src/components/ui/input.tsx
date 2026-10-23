"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  value?: string;
  motionProps?: HTMLMotionProps<"input">;
}

interface CharItem {
  id: string;
  char: string;
}

/**
  Preserves unique IDs for unchanged character positions (common prefix/suffix)
  so editing/deleting in the middle does not re-animate trailing letters.
 */
function syncCharItems(prevItems: CharItem[], newText: string): CharItem[] {
  const newChars = newText.split("");
  if (prevItems.length === 0) {
    return newChars.map((char) => ({
      id: Math.random().toString(36).substring(2, 9),
      char,
    }));
  }

  // Common prefix length
  let prefixLen = 0;
  while (
    prefixLen < prevItems.length &&
    prefixLen < newChars.length &&
    prevItems[prefixLen].char === newChars[prefixLen]
  ) {
    prefixLen++;
  }

  // Common suffix length
  let suffixLen = 0;
  while (
    suffixLen < prevItems.length - prefixLen &&
    suffixLen < newChars.length - prefixLen &&
    prevItems[prevItems.length - 1 - suffixLen].char ===
      newChars[newChars.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const prefix = prevItems.slice(0, prefixLen);
  const suffix = prevItems.slice(prevItems.length - suffixLen);

  const middleNewChars = newChars.slice(
    prefixLen,
    newChars.length - suffixLen,
  );
  const middleNewItems = middleNewChars.map((char) => ({
    id: Math.random().toString(36).substring(2, 9),
    char,
  }));

  return [...prefix, ...middleNewItems, ...suffix];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      value = "",
      onChange,
      placeholder,
      motionProps,
      onScroll,
      ...props
    },
    ref,
  ) => {
    const text = String(value ?? "");
    const reduceMotion = useReducedMotion();

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const overlayRef = React.useRef<HTMLDivElement | null>(null);

    const [charItems, setCharItems] = React.useState<CharItem[]>([]);

    // Update characters while keeping keys intact for un-edited text
    React.useEffect(() => {
      setCharItems((prev) => syncCharItems(prev, text));
    }, [text]);

    // Keep visual overlay scroll position perfectly matched with native input
    const syncScroll = React.useCallback(() => {
      if (inputRef.current && overlayRef.current) {
        overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
      }
    }, []);

    React.useLayoutEffect(() => {
      syncScroll();
    }, [text, syncScroll]);

    // Handle forwarded ref + internal inputRef together
    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref],
    );

    return (
      <div className="group relative w-full">
        {/* Visual animated text overlay with scroll sync */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-10",
            "flex items-center overflow-x-hidden whitespace-pre [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "px-3 py-1  text-base leading-none tracking-normal md:text-sm",
            className,
          )}
        >
          {text.length === 0 ? (
            placeholder && (
              <motion.span
                key="placeholder"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="font-sans text-muted-foreground"
              >
                {placeholder}
              </motion.span>
            )
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {charItems.map(({ id, char }) => (
                <motion.span
                  key={id}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 5,
                          filter: "blur(2px)",
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: -3,
                          filter: "blur(2px)",
                        }
                  }
                  transition={{
                    opacity: { duration: 0.15, ease: "easeOut" },
                    y: {
                      type: "spring",
                      stiffness: 420,
                      damping: 30,
                    },
                    filter: { duration: 0.15 },
                  }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Native functional input */}
        <motion.input
          {...props}
          {...motionProps}
          ref={setRef}
          type={type}
          step={1}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            syncScroll();
          }}
          onScroll={(e) => {
            onScroll?.(e);
            syncScroll();
          }}
          placeholder={placeholder}
          data-slot="input"
          className={cn(
            "relative h-10 w-full min-w-0 rounded-lg border",
            "border-black/10 bg-white/70 px-3 py-1",
            "text-base text-transparent caret-foreground leading-none tracking-normal md:text-sm",
            "shadow-sm shadow-black/[0.02]",
            "outline-none selection:bg-primary/20",
            "transition-[border-color,box-shadow,background-color] duration-300 ease-out",
            "placeholder:text-transparent",
            "focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/10",
            "dark:border-white/10 dark:bg-white/[0.035]",
            "dark:focus-visible:border-white/20",
            "disabled:pointer-events-none disabled:opacity-50 rounded-xs",
            className,
            motionProps?.className,
          )}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };