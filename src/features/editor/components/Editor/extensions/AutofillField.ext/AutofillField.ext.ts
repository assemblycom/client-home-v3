import { mergeAttributes, Node } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react'
import { Suggestion, type SuggestionProps } from '@tiptap/suggestion'
import tippy, { type GetReferenceClientRect, type Instance, type Props as TippyProps } from 'tippy.js'

const autofillSuggestionKey = new PluginKey('autofillSuggestion')

import type { FieldItem } from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { AutofillFieldNodeView } from './AutofillFieldNodeView'
import { AutofillSuggestionMenu, type AutofillSuggestionMenuHandle } from './AutofillSuggestionMenu'

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
      Suggestion<FieldItem>({
        editor: this.editor,
        pluginKey: autofillSuggestionKey,
        char: '{{',

        // Items are managed by AutofillSuggestionMenu via React Query hooks.
        // Returning a non-empty array keeps the popup visible while typing.
        items: (): FieldItem[] => [{ value: '', label: '', name: '', icon: 'Profile', entityType: 'client' }],

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
            onStart: (props: SuggestionProps<FieldItem>) => {
              renderer = new ReactRenderer(AutofillSuggestionMenu, {
                props,
                editor: props.editor,
              })

              const getReferenceClientRect = (props.clientRect ?? fallbackRect) as GetReferenceClientRect

              popup = normalizeTippy(
                tippy(document.body, {
                  getReferenceClientRect,
                  content: renderer.element,
                  showOnCreate: true,
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

            onUpdate: (props: SuggestionProps<FieldItem>) => {
              renderer?.updateProps(props)
              popup?.setProps({
                getReferenceClientRect: (props.clientRect ?? fallbackRect) as GetReferenceClientRect,
              })
              popup?.show()
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
