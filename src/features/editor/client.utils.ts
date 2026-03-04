import 'client-only'

import { MediaFolders } from '@media/constants'
import type { MediaSignedUrlResponseDto } from '@media/media.dto'
import type { Editor } from '@tiptap/core'
import { api } from '@/lib/core/axios.instance'

export const uploadFileToSupabase = async (
  file: File,
  token: string,
  mediaFolder: MediaFolders = MediaFolders.EDITOR,
): Promise<{ path: string }> => {
  const signedUrlResponse = await api.post<{ data: MediaSignedUrlResponseDto }>(
    `/api/media?token=${token}&mediafolder=${mediaFolder}`,
    {
      fileName: file.name,
    },
  )

  const { signedUrl, path } = signedUrlResponse.data.data

  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('Upload failed:', res.status, text)
    throw new Error('Upload failed')
  }

  return { path }
}

export const triggerImageUpload = (editor: Editor) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return

    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = async () => {
      const randId = crypto.randomUUID()

      editor
        .chain()
        .focus()
        .insertContentAt(editor.state.selection.anchor, {
          type: 'image',
          attrs: {
            src: fileReader.result,
            title: randId,
          },
        })
        .focus()
        .run()

      const token = editor.storage.token.token
      if (!token) {
        console.error('Could not upload to supabase due to missing token')
        return
      }

      const { path: rawPath } = await uploadFileToSupabase(file, token)
      const path = rawPath.startsWith('media/') ? rawPath.substring(6) : rawPath
      const proxyUrl = `/api/media/image?token=${token}&filePath=${path}`

      replaceEditorImageSrcByUploadId(editor, randId, proxyUrl)

      api.post(`/api/media/upload?token=${token}`, {
        path,
        name: file.name,
        type: file.type,
        size: String(file.size),
        mediaType: 'media',
      })
    }
  }

  input.click()
}

export const replaceEditorImageSrcByUploadId = (editor: Editor, uploadId: string, newSrc: string) => {
  const { state, view } = editor

  const tr = state.tr
  let found = false

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && node.attrs.title === uploadId) {
      tr.deleteRange(pos, pos + 1)
      tr.replaceWith(pos, pos, editor.schema.node('image', { src: newSrc, title: null }))
      found = true
      return false // stop traversal
    }
    return true
  })

  if (found) {
    view.dispatch(tr)
  }
}
