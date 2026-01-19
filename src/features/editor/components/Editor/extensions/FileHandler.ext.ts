import { replaceEditorImageSrcByUploadId, uploadFileToSupabase } from '@editor/client.utils'
import FileHandler from '@tiptap/extension-file-handler'

export const FileHandlerExt = FileHandler.configure({
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  onDrop: (currentEditor, files, pos) => {
    files.forEach((file) => {
      const fileReader = new FileReader()

      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        const randId = crypto.randomUUID()
        // Temporarily show image from blob data url
        currentEditor
          .chain()
          .insertContentAt(pos, {
            type: 'image',
            attrs: {
              src: fileReader.result,
              title: randId,
            },
          })
          .focus()
          .run()
      }
    })
  },
})
