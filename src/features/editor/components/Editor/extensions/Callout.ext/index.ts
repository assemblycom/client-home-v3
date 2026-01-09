import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Callout, type CalloutOptions } from './Callout'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: () => ReturnType
    }
  }
}

export const CalloutExt = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
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
})
