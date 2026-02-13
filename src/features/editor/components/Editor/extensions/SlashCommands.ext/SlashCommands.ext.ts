import { SlashMenuAdapter } from '@extensions/SlashCommands.ext/SlashMenuAdapter'
import { Extension, ReactRenderer } from '@tiptap/react'
import { Suggestion } from '@tiptap/suggestion'
import tippy, { type GetReferenceClientRect, type Instance, type Props as TippyProps } from 'tippy.js'

const normalizeTippyInstance = (value: Instance<TippyProps> | Array<Instance<TippyProps>>) =>
  Array.isArray(value) ? value[0] : value

const fallbackClientRect: GetReferenceClientRect = () => new DOMRect(0, 0, 0, 0)

export const SlashCommandsExt = Extension.create({
  name: 'slashCommands',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: true,

        items: ({ query }) => {
          return [{ query }]
        },

        command: () => {
          // Command execution is handled by SlashMenuAdapter
        },

        allow: ({ state }) => {
          const node = state.selection.$from.node()
          return !!node && node.textBetween(0, 1) === '/'
        },

        render: () => {
          let renderer: ReactRenderer | null = null
          let popup: Instance<TippyProps> | null = null

          return {
            onStart: (props) => {
              renderer = new ReactRenderer(SlashMenuAdapter, {
                props,
                editor: props.editor,
              })

              const getReferenceClientRect = (props.clientRect ?? fallbackClientRect) as GetReferenceClientRect

              popup = normalizeTippyInstance(
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
                        options: {
                          allowedAutoPlacements: ['top-start', 'bottom-start'],
                          fallbackPlacements: ['top-start', 'bottom-start'],
                        },
                      },
                    ],
                  },
                }),
              )
            },

            onUpdate: (props) => {
              renderer?.updateProps(props)

              popup?.setProps({
                getReferenceClientRect: (props.clientRect ?? fallbackClientRect) as GetReferenceClientRect,
              })
            },

            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                popup?.hide()
                return true
              }
              // We have a renderer component, handles navigation on its own.
              // biome-ignore lint/suspicious/noExplicitAny: ReactRenderer ref type is not exported
              const handled = (renderer?.ref as any)?.onKeyDown?.(event as KeyboardEvent) ?? false
              return handled
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
