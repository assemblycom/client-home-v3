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
              'data-upload-id': randId,
            },
          })
          .focus()
          .run()
      }
    })
  },
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
        // Temporarily show image from blob data url

        currentEditor
          .chain()
          .focus()
          .insertContentAt(currentEditor.state.selection.anchor, {
            type: 'image',
            attrs: {
              src: fileReader.result,
              'data-upload-id': randId,
            },
          })
          .focus()
          .run()

        // @ts-expect-error no string typing for storage for now
        const token = currentEditor.storage.token.token
        const signedUrl = await uploadFileToSupabase(file, token)
        replaceEditorImageSrcByUploadId(currentEditor, randId, signedUrl)
      }
    })
  },
})
