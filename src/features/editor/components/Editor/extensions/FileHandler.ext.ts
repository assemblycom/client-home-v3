import FileHandler from '@tiptap/extension-file-handler'

export const FileHandlerExt = FileHandler.configure({
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  onDrop: (currentEditor, files, pos) => {
    files.forEach((file) => {
      const fileReader = new FileReader()

      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        currentEditor
          .chain()
          .insertContentAt(pos, {
            type: 'image',
            attrs: {
              src: fileReader.result,
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
      fileReader.onload = () => {
        currentEditor
          .chain()
          .focus()
          .insertContentAt(currentEditor.state.selection.anchor, {
            type: 'image',
            attrs: {
              src: fileReader.result,
            },
          })
          .focus()
          .run()
      }
    })
  },
})
