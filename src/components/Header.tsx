import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useShadowStore } from '../store/shadowStore'
import { Sun, Moon, Undo2, Redo2, Info, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import SeoSections from "./SeoSections"

const LS_OPENED_ONCE = "shadow_about_opened_once"
const LS_DONT_SHOW = "shadow_about_dont_show"
const LS_ASKED = "shadow_about_asked"

export default function Header() {
  const { darkMode, toggleDarkMode, undo, redo, canUndo, canRedo } = useShadowStore()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [aboutAsked, setAboutAsked] = useState(false)
  const [aboutDontShow, setAboutDontShow] = useState(false)

  useEffect(() => {
    const dontShow = localStorage.getItem(LS_DONT_SHOW) === "true"
    const asked = localStorage.getItem(LS_ASKED) === "true"
    const openedOnce = localStorage.getItem(LS_OPENED_ONCE) === "true"

    setAboutDontShow(dontShow)
    setAboutAsked(asked)

    if (!openedOnce && !dontShow) {
      setAboutOpen(true)
      localStorage.setItem(LS_OPENED_ONCE, "true")
    }
  }, [])

  const promptDontShowAgain = () => {
    if (aboutAsked || aboutDontShow) return
    setAboutAsked(true)
    localStorage.setItem(LS_ASKED, "true")

    toast("Show the About drawer on startup?", {
      description: "You can change this later by clearing site data.",
      action: {
        label: "Don't show again",
        onClick: () => {
          setAboutDontShow(true)
          localStorage.setItem(LS_DONT_SHOW, "true")
        },
      },
      cancel: {
        label: "Keep showing",
        onClick: () => {
          setAboutDontShow(false)
          localStorage.setItem(LS_DONT_SHOW, "false")
        },
      },
    })
  }

  const handleAboutOpenChange = (open: boolean) => {
    setAboutOpen(open)
    if (!open) promptDontShowAgain()
  }

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#030712] flex items-center justify-between px-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-[0px_4px_8px_0px_#00000040,0px_4px_8px_0px_#00000040,0px_4px_8px_0px_#00000040,inset_0px_5px_2px_-2px_#B9B9B940]"></div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Shadow Generator
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Undo"
          onClick={undo}
          disabled={!canUndo()}
          className="cursor-pointer duration-300"
        >
          <Undo2 size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Redo"
          onClick={redo}
          disabled={!canRedo()}
          className="cursor-pointer duration-300"
        >
          <Redo2 size={18} />
        </Button>

        <Drawer open={aboutOpen} onOpenChange={handleAboutOpenChange}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="About Shadow Generator"
              className="cursor-pointer gap-2"
            >
              <Info size={16} />
              About
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] overflow-hidden">
            <DrawerHeader className="border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DrawerTitle>About Shadow Generator</DrawerTitle>
                  <DrawerDescription>
                    Beginner guide, tips, and SEO-friendly documentation.
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close About"
                    className="shrink-0"
                  >
                    <X size={18} />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="overflow-y-auto">
              <SeoSections />
            </div>
          </DrawerContent>
        </Drawer>

        <Button
          variant="outline"
          size="icon"
          aria-label="Change Theme"
          onClick={toggleDarkMode}
          className="cursor-pointer duration-300"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>
    </header>
  )
}
