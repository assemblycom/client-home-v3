import { create } from 'zustand'

interface EditorState {
  showEmbedInput: boolean
  setShowEmbedInput: (showEmbedInput: boolean) => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  editor: null,

  showEmbedInput: false,
  setShowEmbedInput: (showEmbedInput: boolean) => set({ showEmbedInput }),
}))

export const editorStore = useEditorStore
