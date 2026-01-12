import type { Editor } from '@tiptap/core'
import { type SyntheticEvent, useEffect, useRef, useState } from 'react'
import { fixUrl } from '@/utils/urls'

interface IframeBubbleInputProps {
  editor: Editor
}

export const IframeBubbleInput = ({ editor }: IframeBubbleInputProps) => {
  const [url, setUrl] = useState('')

  const urlInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (event: SyntheticEvent<HTMLDivElement>) => {
    //@ts-expect-error event should contain code
    if (event.code === 'Escape') {
      event.preventDefault()
      // TODO: trigger setShowEmbedInput(false)
    }

    //@ts-expect-error event should contain code
    if (event.code === 'Enter') {
      event.preventDefault()
      console.info(fixUrl(url))
      editor
        .chain()
        .focus()
        .setIframe({ src: fixUrl(url) })
        .run()
      // TODO: trigger setShowEmbedInput(false)
      setUrl('')
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: force side-effect here
  useEffect(() => {
    if (urlInputRef.current) {
      urlInputRef.current.focus()
    }
  }, [urlInputRef.current])

  return (
    <div>
      <input
        type="text"
        onChange={(e) => setUrl(e.target.value)}
        ref={urlInputRef}
        onKeyDown={handleKeyDown}
        value={url}
      />
      <button
        type="reset"
        onClick={() => {
          // TODO: setShowEmbedInput(false)
          console.info('cancelled')
        }}
      />
    </div>
  )
}
