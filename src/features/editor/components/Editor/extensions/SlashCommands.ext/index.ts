import { CommandsList, type CommandsListHandle } from '@extensions/SlashCommands.ext/CommandsList'
import { items } from '@extensions/SlashCommands.ext/items'
import type { SlashCommandItem } from '@extensions/SlashCommands.ext/types'
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
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        char: '/',
        startOfLine: true,

        items: ({ query }) => {
          const q = query.trim().toLowerCase()
          if (!q) return items
          return items.filter((item) => item.title.toLowerCase().startsWith(q))
        },

        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },

        allow: ({ state }) => {
          const node = state.selection.$from.node()
          return !!node && node.textBetween(0, 1) === '/'
        },

        render: () => {
          let renderer: ReactRenderer<CommandsListHandle> | null = null
          let popup: Instance<TippyProps> | null = null

          return {
            onStart: (props) => {
              renderer = new ReactRenderer(CommandsList, {
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

              // If we have a list, let it handle navigation.
              const handled = renderer?.ref?.onKeyDown?.(event as KeyboardEvent) ?? false
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
