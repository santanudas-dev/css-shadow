// File: src/store/shadowStore.ts
import { create } from 'zustand'

export interface Shadow {
  id: string
  name: string
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  inset: boolean
  enabled: boolean
}

export interface Card {
  id: string
  name: string
  shadows: Shadow[]
  bgColor: string
  width: number
  height: number
  radius: number
}

interface ShadowState {
  cards: Card[]
  activeCardId: string | null
  activeShadowId: string | null
  darkMode: boolean
  canvasBgColor: string
  zoom: number
  addCard: () => void
  removeCard: (id: string) => void
  setActiveCard: (id: string) => void
  addShadow: () => void
  removeShadow: (id: string) => void
  updateShadow: (id: string, updates: Partial<Shadow>) => void
  setActiveShadow: (id: string) => void
  toggleDarkMode: () => void
  setCardBgColor: (color: string) => void
  setCanvasBgColor: (color: string) => void
  setCardDimensions: (width: number, height: number) => void
  setCardRadius: (radius: number) => void
  duplicateShadow: (id: string) => void
  loadPreset: (shadows: Shadow[], append?: boolean) => void
  setZoom: (zoom: number) => void
}

let shadowCounter = 0
let cardCounter = 0

export const useShadowStore = create<ShadowState>((set, get) => {
  const initialCard = {
    id: `card-${Date.now()}-${cardCounter++}`,
    name: 'Card 1',
    shadows: [],
    bgColor: '#ffffff',
    width: 300,
    height: 200,
    radius: 16
  }
  
  return {
    cards: [initialCard],
    activeCardId: initialCard.id,
    activeShadowId: null,
    darkMode: false,
    canvasBgColor: '#f3f4f6',
    zoom: 1,

  addCard: () => {
    const state = get()
    if (state.cards.length >= 2) {
      ;(window as any).showToast?.('Maximum 2 cards allowed', 'warning')
      return
    }
    
    const newCard: Card = {
      id: `card-${Date.now()}-${cardCounter++}`,
      name: `Card ${state.cards.length + 1}`,
      shadows: [],
      bgColor: '#ffffff',
      width: 300,
      height: 200,
      radius: 16
    }
    set({
      cards: [...state.cards, newCard],
      activeCardId: newCard.id
    })
    ;(window as any).showToast?.(`${newCard.name} created`, 'success')
  },

  removeCard: (id: string) => {
    const state = get()
    if (state.cards.length <= 1) {
      ;(window as any).showToast?.('Cannot delete the last card', 'warning')
      return
    }
    
    const cardToDelete = state.cards.find(c => c.id === id)
    const newCards = state.cards.filter(c => c.id !== id)
    const newActiveCard = state.activeCardId === id ? newCards[0] : state.cards.find(c => c.id === state.activeCardId)
    const newActiveShadowId = newActiveCard?.shadows.length ? newActiveCard.shadows[newActiveCard.shadows.length - 1].id : null
    
    set({
      cards: newCards,
      activeCardId: newActiveCard?.id || null,
      activeShadowId: newActiveShadowId
    })
    ;(window as any).showToast?.(`${cardToDelete?.name || 'Card'} deleted`, 'info')
  },

  setActiveCard: (id: string) => {
    const state = get()
    const card = state.cards.find(c => c.id === id)
    if (!card) return
    
    // Set active card and select last shadow if available
    const lastShadowId = card.shadows.length > 0 ? card.shadows[card.shadows.length - 1].id : null
    set({ activeCardId: id, activeShadowId: lastShadowId })
  },
  addShadow: () => {
    const state = get()
    const activeCard = state.cards.find(c => c.id === state.activeCardId)
    if (!activeCard) return

    const newShadow: Shadow = {
      id: `shadow-${Date.now()}-${shadowCounter++}`,
      name: `Shadow ${activeCard.shadows.length + 1}`,
      offsetX: 0,
      offsetY: 4,
      blur: 8,
      spread: 0,
      color: '#00000040',
      inset: false,
      enabled: true,
    }
    
    set({
      cards: state.cards.map(c => 
        c.id === state.activeCardId 
          ? { ...c, shadows: [...c.shadows, newShadow] }
          : c
      ),
      activeShadowId: newShadow.id,
    })
  },

  removeShadow: (id: string) => {
    const state = get()
    const activeCard = state.cards.find(c => c.id === state.activeCardId)
    if (!activeCard || activeCard.shadows.length <= 1) {
      ;(window as any).showToast?.('Cannot delete the last shadow', 'warning')
      return
    }

    const shadowToDelete = activeCard.shadows.find(s => s.id === id)
    const index = activeCard.shadows.findIndex((s) => s.id === id)
    const newShadows = activeCard.shadows.filter((s) => s.id !== id)

    let newActiveShadowId: string | null = state.activeShadowId
    if (state.activeShadowId === id) {
      if (index > 0) {
        newActiveShadowId = newShadows[index - 1].id
      } else {
        newActiveShadowId = newShadows[0].id
      }
    }

    set({
      cards: state.cards.map(c => 
        c.id === state.activeCardId 
          ? { ...c, shadows: newShadows }
          : c
      ),
      activeShadowId: newActiveShadowId,
    })
    ;(window as any).showToast?.(`${shadowToDelete?.name || 'Shadow'} deleted`, 'info')
  },


  updateShadow: (id: string, updates: Partial<Shadow>) => {
    const state = get()
    set({
      cards: state.cards.map(c => 
        c.id === state.activeCardId 
          ? { ...c, shadows: c.shadows.map(s => s.id === id ? { ...s, ...updates } : s) }
          : c
      )
    })
  },

  setActiveShadow: (id: string) => {
    set({ activeShadowId: id })
  },

  toggleDarkMode: () => {
    const html = document.documentElement

    set((state) => {
      const nextDarkMode = !state.darkMode

      // sync with DOM
      html.classList.toggle("dark", nextDarkMode)

      return { darkMode: nextDarkMode }
    })
  },


  setCardBgColor: (color: string) => {
    const state = get()
    set({
      cards: state.cards.map(c => 
        c.id === state.activeCardId 
          ? { ...c, bgColor: color }
          : c
      )
    })
  },

  setCanvasBgColor: (color: string) => {
    set({ canvasBgColor: color })
  },

  setCardDimensions: (width: number, height: number) => {
    const state = get()
    set({
      cards: state.cards.map(c => 
        c.id === state.activeCardId 
          ? { ...c, width, height }
          : c
      )
    })
  },

  setCardRadius: (radius: number) => {
    const state = get()
    set({
      cards: state.cards.map(c => 
        c.id === state.activeCardId 
          ? { ...c, radius }
          : c
      )
    })
  },

  duplicateShadow: (id: string) => {
    const state = get()
    const activeCard = state.cards.find(c => c.id === state.activeCardId)
    if (!activeCard) return
    
    const shadow = activeCard.shadows.find((s) => s.id === id)
    if (!shadow) return

    const baseName = shadow.name.replace(/\sCopy(\s\(\d+\))?$/, '')
    const copyRegex = new RegExp(`^${baseName} Copy(?: \\((\\d+)\\))?$`)

    const copyNumbers = activeCard.shadows
      .map((s) => {
        const match = s.name.match(copyRegex)
        return match ? Number(match[1] || 0) : null
      })
      .filter((n): n is number => n !== null)

    const nextIndex = copyNumbers.length === 0 ? null : Math.max(...copyNumbers) + 1
    const newName = nextIndex === null ? `${baseName} Copy` : `${baseName} Copy (${nextIndex})`

    const newShadow: Shadow = {
      ...shadow,
      id: `shadow-${Date.now()}-${shadowCounter++}`,
      name: newName,
    }

    set({
      cards: state.cards.map(c => 
        c.id === state.activeCardId 
          ? { ...c, shadows: [...c.shadows, newShadow] }
          : c
      ),
      activeShadowId: newShadow.id,
    })
  },


  loadPreset: (presetShadows: Shadow[], append = false) => {
    const state = get()
    const activeCard = state.cards.find(c => c.id === state.activeCardId)
    if (!activeCard) return

    const newShadows = presetShadows.map((s) => ({
      ...s,
      id: `shadow-${Date.now()}-${shadowCounter++}`,
    }))

    if (append) {
      set({
        cards: state.cards.map(c => 
          c.id === state.activeCardId 
            ? { ...c, shadows: [...c.shadows, ...newShadows] }
            : c
        ),
        activeShadowId: newShadows[0]?.id ?? state.activeShadowId,
      })
    } else {
      set({
        cards: state.cards.map(c => 
          c.id === state.activeCardId 
            ? { ...c, shadows: newShadows }
            : c
        ),
        activeShadowId: newShadows[0]?.id ?? null,
      })
    }
  },

  setZoom: (zoom: number) => {
    set({ zoom })
  },

  }
})