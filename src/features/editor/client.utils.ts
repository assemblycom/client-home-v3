import 'client-only'

import type { MediaSignedUrlResponseDto } from '@media/media.dto'
import type { Editor } from '@tiptap/core'
import { api } from '@/lib/core/axios.instance'

export const uploadFileToSupabase = async (file: File, token: string): Promise<string> => {
  const signedUrlResponse = await api.post<{ data: MediaSignedUrlResponseDto }>(`/api/media?token=${token}`, {
    fileName: file.name,
  })

  const signedUrl = signedUrlResponse.data.data.signedUrl

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
  }
  const filePath = (await res.json()).Key

  const signedImgUrlResponse = await api.get<{ data: MediaSignedUrlResponseDto }>(`/api/media?token=${token}`, {
    params: { filePath },
  })

  return signedImgUrlResponse.data.data.signedUrl
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
