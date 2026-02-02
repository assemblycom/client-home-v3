import { Extension } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'

type OneLineOptions = {
  allowHardBreak?: boolean
}

export const OneLineExt = Extension.create<OneLineOptions>({
  name: 'oneLine',

  addOptions() {
    return {
      // Future-proofing in case reqs change in the future to allow for a line break
      allowHardBreak: false,
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => true, // swallow Enter

      ...(this.options.allowHardBreak
        ? {}
        : {
            'Shift-Enter': () => true, // swallow Shift+Enter too
          }),
    }
  },

  addProseMirrorPlugins() {
    const { allowHardBreak } = this.options

    return [
      new (require('prosemirror-state').Plugin)({
        props: {
          // Prevent inserting multi-line content via paste
          handlePaste(view: EditorView, event: ClipboardEvent) {
            const text = event.clipboardData?.getData('text/plain')
            if (!text) return false

            // If pasted text contains any newline, normalize to a single space
            if (/\r|\n/.test(text)) {
              event.preventDefault()

              const normalized = text
                .replace(/\r\n|\r|\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()

              view.dispatch(view.state.tr.insertText(normalized))
              return true
            }

            return false
          },

          // Extra guard: block any text input that includes newlines (mobile/IME edge cases)
          handleTextInput(view: EditorView, from: number, to: number, text: string) {
            if (/\r|\n/.test(text)) {
              const normalized = text
                .replace(/\r\n|\r|\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
              view.dispatch(view.state.tr.insertText(normalized, from, to))
              return true
            }
            return false
          },

          handleDrop(view: EditorView, event: DragEvent) {
            const text = event.dataTransfer?.getData('text/plain')
            if (!text) return false
            if (/\r|\n/.test(text)) {
              event.preventDefault()
              const normalized = text
                .replace(/\r\n|\r|\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
              view.dispatch(view.state.tr.insertText(normalized))
              return true
            }
            return false
          },

          // Block inserting a line break ENTIRELY
          handleKeyDown(view: EditorView, event: KeyboardEvent) {
            if (!allowHardBreak && event.key === 'Enter') return true
            return false
          },
        },
      }),
    ]
  },
})
