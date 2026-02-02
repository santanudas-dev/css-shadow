// File: src/App.tsx
import { useEffect } from "react"
import { useShadowStore } from "./store/shadowStore"

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

function App() {
  const { addShadow, cards, activeCardId } = useShadowStore()
  const activeCard = cards.find(c => c.id === activeCardId)
  const shadows = activeCard?.shadows || []

  useEffect(() => {
    if (shadows.length === 0 && activeCard) addShadow()
  }, [shadows.length, addShadow, activeCard])

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
        <ResizablePanel defaultSize={20}  minSize={240} maxSize={400}>
          <RightSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <ToastContainer />
    </div>
  )
}

export default App
