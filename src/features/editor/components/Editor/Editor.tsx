'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { uploadFileToSupabase } from '@editor/client.utils'
import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useAppControls } from '@editor/hooks/useAppControls'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditorProps {
  editable?: boolean
}

export const Editor = ({ editable = true }: EditorProps) => {
  const token = useAuthStore((store) => store.token)
  const content = useSettingsStore((store) => store.content)
  const setContent = useSettingsStore((store) => store.setContent)
  const backgroundColor = useSettingsStore((store) => store.backgroundColor)
  const { setEditor, destroyEditor, showEmbedInput, setShowEmbedInput } = useEditorStore(
    useShallow((s) => ({
      setEditor: s.setEditor,
      destroyEditor: s.destroyEditor,
      showEmbedInput: s.showEmbedInput,
      setShowEmbedInput: s.setShowEmbedInput,
    })),
  )

  const editor = useEditor({
    extensions: [
      ...extensions,
      FileHandlerExt.configure({
        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach((file) => {
            if (htmlContent) {
              // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
              return
            }

            const fileReader = new FileReader()

            fileReader.readAsDataURL(file)
            fileReader.onload = async () => {
              const randId = crypto.randomUUID()

              currentEditor
                .chain()
                .focus()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result,
                    title: randId,
                  },
                })
                .focus()
                .run()
              setContent(currentEditor.getHTML())
              const token = currentEditor.storage.token.token
              if (!token) {
                console.error('Could not upload to supabase due to missing token')
                return // Keep the blob image for now
              }

              const signedUrl = await uploadFileToSupabase(file, token)
              setContent(currentEditor.getHTML().replaceAll(fileReader.result as string, signedUrl))
            }
          })
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: {
      attributes: {
        class: `bg-[${backgroundColor}] text-custom-xs`, // TODO: Replace later with settings background color
      },
    },
    onCreate({ editor }) {
      editor.storage.token.token = token
    },
    onUpdate({ editor }) {
      setContent(editor.getHTML())
    },
  })

  useEffect(() => {
    editor?.commands.setContent(content)
  }, [content, editor])

  useEffect(() => {
    if (!editor) return

    editor.view.dom.style.backgroundColor = backgroundColor
  }, [backgroundColor, editor])

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    return destroyEditor
  }, [editor, destroyEditor, setEditor])

  useAppControls()

  return editor ? (
    <div>
      <BubbleMenu id="embed-bubble-menu" editor={editor} open={showEmbedInput}>
        <EmbedBubbleInput editor={editor} showEmbedInput={showEmbedInput} setShowEmbedInput={setShowEmbedInput} />
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  ) : null
}
