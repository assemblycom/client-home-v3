import { EMBED_PLACEHOLDER } from '@editor/constants'
import type { Editor } from '@tiptap/core'
import { Icon } from 'copilot-design-system'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { fixUrl } from '@/utils/urls'

interface EmbedBubbleInputProps {
  editor: Editor
  showEmbedInput: boolean
  setShowEmbedInput: (showEmbedInput: boolean) => void
}

export const EmbedBubbleInput = ({ editor, showEmbedInput, setShowEmbedInput }: EmbedBubbleInputProps) => {
  const [url, setUrl] = useState('')
  const urlInputRef = useRef<HTMLInputElement>(null)

  const handleInputUnload = () => {
    setUrl('')
    setShowEmbedInput(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Escape') {
      event.preventDefault()
      return handleInputUnload()
    }

    if (event.code === 'Enter') {
      event.preventDefault()
      editor
        .chain()
        .focus()
        .setEmbed({ src: fixUrl(url) })
        .run()
      return handleInputUnload()
    }
  }

  useEffect(() => {
    if (!showEmbedInput) return

    // Wait until tippy has actually mounted/moved the node into the popper
    const raf = requestAnimationFrame(() => {
      urlInputRef.current?.focus()
      urlInputRef.current?.select()
    })

    return () => cancelAnimationFrame(raf)
  }, [showEmbedInput])

  return (
    <div className="flex items-center border border-border-gray bg-white p-2">
      <input
        ref={urlInputRef}
        type="text"
        placeholder={EMBED_PLACEHOLDER}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        className="px-2 text-custom-xs focus:outline-none"
      />
      <button type="reset" onClick={handleInputUnload} className="p-1 hover:bg-background-primary">
        <Icon
          icon="Close"
          width={12}
          height={12}
          className="text-text-primary transition-all duration-100 ease-in-out"
        />
      </button>
    </div>
  )
}
