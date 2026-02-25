import { mergeAttributes, Node } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react'
import { Suggestion, type SuggestionProps } from '@tiptap/suggestion'
import tippy, { type GetReferenceClientRect, type Instance, type Props as TippyProps } from 'tippy.js'

const autofillSuggestionKey = new PluginKey('autofillSuggestion')

import { AutofillFieldNodeView } from './AutofillFieldNodeView'
import { AutofillSuggestionMenu, type AutofillSuggestionMenuHandle } from './AutofillSuggestionMenu'
import { type AutofillItem, fetchAutofillItems } from './autofill.utils'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    autofillField: {
      insertAutofillField: (attrs: { value: string }) => ReturnType
    }
  }
}

const normalizeTippy = (v: Instance<TippyProps> | Array<Instance<TippyProps>>) => (Array.isArray(v) ? v[0] : v)

const fallbackRect: GetReferenceClientRect = () => new DOMRect(0, 0, 0, 0)

export const AutofillFieldExt = Node.create({
  name: 'autofillField',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      value: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-value'),
        renderHTML: (attributes) => ({ 'data-value': attributes.value }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'autofill-field[data-value]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['autofill-field', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AutofillFieldNodeView)
  },

  addCommands() {
    return {
      insertAutofillField:
        (attrs) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent([
              { type: this.name, attrs },
              { type: 'text', text: ' ' },
            ])
            .run(),
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<AutofillItem>({
        editor: this.editor,
        pluginKey: autofillSuggestionKey,
        char: '{{',

        items: async ({ query, editor }) => {
          const token = editor.storage.token?.token as string | undefined
          if (!token) return []
          return await fetchAutofillItems(token, query)
        },

        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent([
              { type: this.name, attrs: { value: props.value } },
              { type: 'text', text: ' ' },
            ])
            .run()
        },

        render: () => {
          let renderer: ReactRenderer<AutofillSuggestionMenuHandle> | null = null
          let popup: Instance<TippyProps> | null = null

          return {
            onStart: (props: SuggestionProps<AutofillItem>) => {
              renderer = new ReactRenderer(AutofillSuggestionMenu, {
                props,
                editor: props.editor,
              })

              const getReferenceClientRect = (props.clientRect ?? fallbackRect) as GetReferenceClientRect

              popup = normalizeTippy(
                tippy(document.body, {
                  getReferenceClientRect,
                  content: renderer.element,
                  showOnCreate: props.items.length > 0,
                  interactive: true,
                  trigger: 'manual',
                  offset: [0, 5],
                  placement: 'bottom-start',
                  popperOptions: {
                    strategy: 'fixed',
                    modifiers: [
                      {
                        name: 'flip',
                        options: { fallbackPlacements: ['top-start'] },
                      },
                    ],
                  },
                }),
              )
            },

            onUpdate: (props: SuggestionProps<AutofillItem>) => {
              renderer?.updateProps(props)
              popup?.setProps({
                getReferenceClientRect: (props.clientRect ?? fallbackRect) as GetReferenceClientRect,
              })
              if (props.items.length > 0) popup?.show()
              else popup?.hide()
            },

            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                popup?.hide()
                return true
              }
              return renderer?.ref?.onKeyDown(event as KeyboardEvent) ?? false
            },

            onExit: () => {
              popup?.destroy()
              popup = null
              renderer?.destroy()
              renderer = null
            },
          }
        },
      }),
    ]
  },
})
