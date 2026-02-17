// import { replaceEditorImageSrcByUploadId, uploadFileToSupabase } from '@editor/client.utils'
import FileHandler from '@tiptap/extension-file-handler'

export const FileHandlerExt = FileHandler.configure({
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
})
