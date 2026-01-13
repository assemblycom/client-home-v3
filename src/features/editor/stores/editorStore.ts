import type { Editor } from '@tiptap/core'
import { create } from 'zustand'

interface EditorState {
  editor: Editor | null
  setEditor: (editor: Editor) => void
  destroyEditor: () => void

  showEmbedInput: boolean
  setShowEmbedInput: (showEmbedInput: boolean) => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  editor: null,
  setEditor: (editor: Editor) => set({ editor }),
  destroyEditor: () => set({ editor: null }),

  showEmbedInput: false,
  setShowEmbedInput: (showEmbedInput: boolean) => set({ showEmbedInput }),
}))

export const editorStore = useEditorStore
