import { useEffect, useState } from "react"
import { useShadowStore } from "./store/shadowStore"
import { Monitor, Smartphone, Tablet } from "lucide-react"

import LeftSidebar from "./components/LeftSidebar"
import Canvas from "./components/Canvas"
import RightSidebar from "./components/RightSidebar"
import Header from "./components/Header"
import { ToastContainer } from "./components/ui/toast"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable"

function MobileBlocker() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <Smartphone className="w-8 h-8 text-gray-400" />
            <Tablet className="w-8 h-8 text-gray-400" />
          </div>
          <Monitor className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Desktop Only
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Shadow Generator is currently optimized for desktop use only. Mobile and tablet versions are under development.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Please visit us on a desktop or laptop computer for the best experience.
          </p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Coming soon to mobile devices
        </div>
      </div>
    </div>
  )
}

function App() {
  const { addShadow, cards, activeCardId } = useShadowStore()
  const [isMobile, setIsMobile] = useState(false)
  
  const activeCard = cards.find(c => c.id === activeCardId)
  const shadows = activeCard?.shadows || []

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  useEffect(() => {
    if (shadows.length === 0 && activeCard) addShadow()
  }, [shadows.length, addShadow, activeCard])

  if (isMobile) {
    return <MobileBlocker />
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <ResizablePanelGroup
        className="flex-1 overflow-hidden"
      >
        {/* LEFT */}
        <ResizablePanel defaultSize={20} minSize={200} maxSize={400}>
          <LeftSidebar />
        </ResizablePanel>

        <ResizableHandle className="focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0" />

        {/* CENTER */}
        <ResizablePanel defaultSize={60}>
          <Canvas />
        </ResizablePanel>

        <ResizableHandle />

        {/* RIGHT */}
        <ResizablePanel defaultSize={20} minSize={240} maxSize={400}>
          <RightSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <ToastContainer />
    </div>
  )
}

export default App
