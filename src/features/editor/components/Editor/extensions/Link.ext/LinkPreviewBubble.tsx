import { useEditorStore } from '@editor/stores/editorStore'
import type { Editor } from '@tiptap/core'
import { useEffect, useRef, useSyncExternalStore } from 'react'

interface LinkPreviewBubbleProps {
  editor: Editor
  href: string
}

const subscribe = (cb: () => void) => {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}
const getSnapshot = () => window.innerWidth

export const LinkPreviewBubble = ({ editor, href }: LinkPreviewBubbleProps) => {
  const { setShowLinkInput, setLinkHasTextSelection, setLinkEditHref } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const windowWidth = useSyncExternalStore(subscribe, getSnapshot, () => 450)
  const isSmallScreen = windowWidth < 450
  const displayHref = isSmallScreen && href.length > 15 ? href.slice(0, 15) : href

  const handleChange = () => {
    // Select the full link text so setLink applies to it
    const { $from } = editor.state.selection
    const linkMark = $from.marks().find((m) => m.type.name === 'link')
    if (linkMark) {
      let from = $from.pos
      let to = $from.pos
      // Walk backwards to find link start
      editor.state.doc.nodesBetween($from.start(), $from.pos, (node, pos) => {
        if (node.isText && linkMark.isInSet(node.marks)) {
          from = pos
        }
      })
      // Walk forwards to find link end
      editor.state.doc.nodesBetween($from.pos, $from.end(), (node, pos) => {
        if (node.isText && linkMark.isInSet(node.marks)) {
          to = pos + node.nodeSize
        }
      })
      editor.chain().focus().setTextSelection({ from, to }).run()
    }

    setLinkHasTextSelection(true)
    setLinkEditHref(href)
    setShowLinkInput(true)
  }

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run()
  }

  // After mount (or when href changes), nudge the popup left if it overflows the viewport.
  // biome-ignore lint/correctness/useExhaustiveDependencies: href isn't read in the effect but changing it alters the bubble width, requiring repositioning
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const reposition = () => {
      el.style.marginLeft = '0px'

      const rect = el.getBoundingClientRect()
      const overflow = rect.right - window.innerWidth + 8
      if (overflow > 0) {
        el.style.marginLeft = `-${overflow}px`
      }
    }

    const timer = setTimeout(reposition, 10)
    window.addEventListener('resize', reposition)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', reposition)
    }
  }, [href])

  return (
    <div
      ref={containerRef}
      className="cop-shadow-popover-50 flex w-max items-center gap-3 rounded-md bg-white px-3 py-2"
    >
      <span className="flex items-center gap-2">
        <p className="cop-text-sm cop-font-regular cop-leading-normal hidden whitespace-nowrap min-[450px]:block">
          Go to link:
        </p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={href}
          className="cop-text-link cop-no-underline hover:cop-text-link-hover active:cop-text-link-active max-w-48 cursor-pointer overflow-hidden whitespace-nowrap text-sm"
        >
          {displayHref}
        </a>
      </span>
      <div className="h-4 w-px shrink-0 bg-gray-300" />
      <button
        type="button"
        onClick={handleChange}
        className="cop-cursor-pointer cop-rounded cop-border cop-border-solid cop-border-transparent cop-bg-transparent cop-px-3 cop-py-1 cop-text-primary hover:cop-bg-[#F8F9FB] hover:cop-border-[#F8F9FB] shrink-0"
      >
        <p className="cop-m-0 cop-font-sans cop-text-sm cop-font-medium cop-leading-1">Change</p>
      </button>
      <div className="h-4 w-px shrink-0 bg-gray-300" />
      <button
        type="button"
        onClick={handleRemove}
        className="cop-cursor-pointer cop-rounded cop-border cop-border-solid cop-border-transparent cop-bg-transparent cop-px-3 cop-py-1 cop-text-primary hover:cop-bg-[#F8F9FB] hover:cop-border-[#F8F9FB] shrink-0"
      >
        <p className="cop-m-0 cop-font-sans cop-text-sm cop-font-medium cop-leading-1">Remove</p>
      </button>
    </div>
  )
}
