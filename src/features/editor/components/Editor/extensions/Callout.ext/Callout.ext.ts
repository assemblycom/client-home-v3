import { Callout } from '@extensions/Callout.ext/CalloutComponent'
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: () => ReturnType
    }
  }
}

export type CalloutOptions = {
  wrapperClass?: string
  contentClass?: string
}

export const CalloutExt = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  // See: https://prosemirror.net/docs/guide/#schema.content_expressions
  // NOTE: Zero or more inline nodes here.
  // Using inline* instead of inline+, since inline+ requires at least one child and adds extra line at bottom.
  content: 'inline*',

  addOptions: () => ({
    wrapperClass: 'callout',
    contentClass: 'callout__content',
  }),

  parseHTML: () => [{ tag: 'callout' }],
  renderHTML: ({ HTMLAttributes }) => ['callout', mergeAttributes(HTMLAttributes), 0],
  addNodeView: () => ReactNodeViewRenderer(Callout),

  addCommands: () => ({
    setCallout:
      () =>
      ({ chain }) =>
        chain().setNode('callout').run(),
  }),

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state } = this.editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty) return false

        let calloutDepth: number | null = null
        for (let d = $from.depth; d >= 0; d--) {
          if ($from.node(d).type.name === 'callout') {
            calloutDepth = d
            break
          }
        }

        if (calloutDepth === null) return false

        const calloutNode = $from.node(calloutDepth)

        if (calloutNode.textContent.length === 0) {
          const pos = $from.before(calloutDepth)
          const tr = state.tr.delete(pos, pos + calloutNode.nodeSize)
          this.editor.view.dispatch(tr)
          return true
        }

        const isAtStart = $from.pos === $from.start(calloutDepth)
        if (!isAtStart) return false

        return this.editor.chain().focus().setNode('paragraph').run()
      },
    }
  },
})
