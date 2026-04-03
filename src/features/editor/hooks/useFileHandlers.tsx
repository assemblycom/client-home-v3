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
        const { path } = await uploadFileToSupabase(file)
        const proxyUrl = `/api/media/image?filePath=${encodeURIComponent(path)}`
        const { doc } = currentEditor.state
        let imagePos: number | null = null
        doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.title === randId) {
            imagePos = pos
            return false //short circuit the search for image position.
          }
        })

        if (imagePos !== null) {
          currentEditor.chain().focus().setNodeSelection(imagePos).updateAttributes('image', { src: proxyUrl }).run()
          setContent(currentEditor.getHTML())
        }
      }
    })
  }
  return handleFileInsertion
}
