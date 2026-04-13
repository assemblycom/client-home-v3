import { Icon } from '@assembly-js/design-system'
import type { Editor } from '@tiptap/core'
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ensureHttps } from '@/utils/urls'

interface LinkBubbleInputProps {
  editor: Editor
  showLinkInput: boolean
  setShowLinkInput: (show: boolean) => void
  hasTextSelection: boolean
  editHref: string | null
  setEditHref: (href: string | null) => void
}

export const LinkBubbleInput = ({
  editor,
  showLinkInput,
  setShowLinkInput,
  hasTextSelection,
  editHref,
  setEditHref,
}: LinkBubbleInputProps) => {
  const [displayText, setDisplayText] = useState('')
  const [url, setUrl] = useState('')
  const textInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const handleClose = useCallback(() => {
    setDisplayText('')
    setUrl('')
    setEditHref(null)
    setShowLinkInput(false)
  }, [setShowLinkInput, setEditHref])

  // Pre-fill URL when editing an existing link
  useEffect(() => {
    if (showLinkInput && editHref) {
      setUrl(editHref)
    }
  }, [showLinkInput, editHref])

  const handleSubmit = () => {
    if (!url.trim()) return

    const href = ensureHttps(url.trim())

    if (hasTextSelection) {
      editor.chain().focus().setLink({ href }).run()
    } else {
      const text = displayText.trim() || href
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          marks: [{ type: 'link', attrs: { href } }],
          text,
        })
        .run()
    }

    handleClose()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      handleClose()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showLinkInput) return

    const timer = setTimeout(() => {
      if (hasTextSelection) {
        urlInputRef.current?.focus()
      } else {
        textInputRef.current?.focus()
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [showLinkInput, hasTextSelection])

  // Close when user clicks outside the popup (including into the editor)
  useEffect(() => {
    if (!showLinkInput) return

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      handleClose()
    }

    // Delay listener so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [showLinkInput, handleClose])

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 rounded-lg border border-border-gray bg-white p-2 shadow-md"
    >
      <div className="flex flex-col gap-2">
        {!hasTextSelection && (
          <div className="flex items-center gap-1 rounded border border-border-gray px-2 py-1">
            <Icon icon="Text" width={16} height={16} className="shrink-0 text-text-secondary" />
            <input
              ref={textInputRef}
              type="text"
              placeholder="Text to display"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-52 text-custom-xs focus:outline-none"
            />
          </div>
        )}
        <div className="flex items-center gap-1 rounded border border-border-gray px-2 py-1">
          <Icon icon="Link" width={16} height={16} className="shrink-0 text-text-secondary" />
          <input
            ref={urlInputRef}
            type="text"
            placeholder="Type or paste a link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-52 text-custom-xs focus:outline-none"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!url.trim()}
        className="shrink-0 rounded px-3 py-1 font-medium text-sm text-text-primary hover:bg-[#F8F9FB] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        {editHref ? 'Save' : 'Add'}
      </button>
    </div>
  )
}
