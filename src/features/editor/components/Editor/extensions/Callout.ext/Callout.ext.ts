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
})
