import { useShadowStore } from '../store/shadowStore'
import { Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Header() {
  const { darkMode, toggleDarkMode } = useShadowStore()

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#030712] flex items-center justify-between px-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-[0px_4px_8px_0px_#00000040,0px_4px_8px_0px_#00000040,0px_4px_8px_0px_#00000040,inset_0px_5px_2px_-2px_#B9B9B940]"></div>
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