import { uploadFileToSupabase } from '@editor/client.utils'
import { useSettingsStore } from '@settings/providers/settings.provider'
import type { Editor } from '@tiptap/core'

export const useFileHandlers = () => {
  const setContent = useSettingsStore((store) => store.setContent)

  const handleFileInsertion = (currentEditor: Editor, files: File[], htmlContent?: string) => {
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
  }
  return handleFileInsertion
}
