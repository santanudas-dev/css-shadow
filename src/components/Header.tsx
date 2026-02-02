// File: src/components/Header.tsx
import { useShadowStore } from '../store/shadowStore'
import { Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Header() {
  const { darkMode, toggleDarkMode } = useShadowStore()

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#030712] flex items-center justify-between px-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg"></div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Shadow Generator
        </h1>
      </div>
      <Button
        variant="outline" size="icon" aria-label="Change Theme"
        onClick={toggleDarkMode}
        className='cursor-pointer duration-300'
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </Button>
    </header>
  )
}