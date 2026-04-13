import type { Editor } from '@tiptap/core'
import { create } from 'zustand'

interface EditorState {
  editor: Editor | null
  setEditor: (editor: Editor) => void
  destroyEditor: () => void

  showEmbedInput: boolean
  setShowEmbedInput: (showEmbedInput: boolean) => void

  showLinkInput: boolean
  setShowLinkInput: (showLinkInput: boolean) => void
  linkHasTextSelection: boolean
  setLinkHasTextSelection: (hasSelection: boolean) => void
  linkEditHref: string | null
  setLinkEditHref: (href: string | null) => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  editor: null,
  setEditor: (editor: Editor) => set({ editor }),
  destroyEditor: () => set({ editor: null }),

  showEmbedInput: false,
  setShowEmbedInput: (showEmbedInput: boolean) => set({ showEmbedInput }),

  showLinkInput: false,
  setShowLinkInput: (showLinkInput: boolean) => set({ showLinkInput }),
  linkHasTextSelection: false,
  setLinkHasTextSelection: (hasSelection: boolean) => set({ linkHasTextSelection: hasSelection }),
  linkEditHref: null,
  setLinkEditHref: (href: string | null) => set({ linkEditHref: href }),
}))

export const editorStore = useEditorStore
