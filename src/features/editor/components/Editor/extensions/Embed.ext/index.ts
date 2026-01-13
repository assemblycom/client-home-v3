import { Embed } from '@extensions/Embed.ext/Embed'
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string }) => ReturnType
    }
  }
}

export interface EmbedOptions {
  allowFullscreen: boolean
  HTMLAttributes: {
    [key: string]: string
  }
}

export const EmbedExt = Node.create<EmbedOptions>({
  name: 'embed',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      width: {
        default: 400,
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: 200,
        renderHTML: (attributes) => {
          return {
            height: attributes.height,
          }
        },
      },
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'embed',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['embed', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Embed)
  },

  addCommands() {
    return {
      setEmbed:
        (options: { src: string }) =>
        ({ tr, dispatch }) => {
          const { selection } = tr
          const node = this.type.create(options)

          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node)
          }

          return true
        },
    }
  },
})
