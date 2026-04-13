import Link from '@tiptap/extension-link'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const LinkExt = Link.extend({
  inclusive: false,

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? []

    // Prevent browser default navigation when clicking links in the editor
    const preventClickPlugin = new Plugin({
      key: new PluginKey('linkClickPrevention'),
      props: {
        handleClick: (view, _pos, event) => {
          const target = event.target as HTMLElement
          const link = target.closest('a')
          if (link && view.editable) {
            event.preventDefault()
            return true
          }
          return false
        },
      },
    })

    return [...parentPlugins, preventClickPlugin]
  },
}).configure({
  openOnClick: false,
  autolink: true,
  linkOnPaste: true,
  HTMLAttributes: {
    class: 'cop-text-link cursor-pointer',
    rel: 'noopener noreferrer',
    target: '_blank',
  },
})
