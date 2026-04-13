'use client'

import { BubbleMenu } from '@editor/components/Editor/BubbleMenu'
import { useFileHandlers } from '@editor/hooks/useFileHandlers'
import { useEditorStore } from '@editor/stores/editorStore'
import { EmbedBubbleInput } from '@extensions/Embed.ext/EmbedBubbleInput'
import extensions from '@extensions/extensions'
import { FileHandlerExt } from '@extensions/FileHandler.ext'
import { ImageExt } from '@extensions/Image.ext'
import { LinkBubbleInput } from '@extensions/Link.ext/LinkBubbleInput'
import { LinkPreviewBubble } from '@extensions/Link.ext/LinkPreviewBubble'
import { TableAddButtons } from '@extensions/Table.ext/TableAddButtons'
import { TableSelectionOverlay } from '@extensions/Table.ext/TableSelectionOverlay'
import { SettingsContext } from '@settings/providers/settings.provider'
import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditorProps {
  content: string
}

export const Editor = ({ content }: EditorProps) => {
  const settingsStoreApi = useContext(SettingsContext)
  const {
    setEditor,
    destroyEditor,
    showEmbedInput,
    setShowEmbedInput,
    showLinkInput,
    setShowLinkInput,
    linkHasTextSelection,
    linkEditHref,
    setLinkEditHref,
  } = useEditorStore(
    useShallow((s) => ({
      setEditor: s.setEditor,
      destroyEditor: s.destroyEditor,
      showEmbedInput: s.showEmbedInput,
      setShowEmbedInput: s.setShowEmbedInput,
      showLinkInput: s.showLinkInput,
      setShowLinkInput: s.setShowLinkInput,
      linkHasTextSelection: s.linkHasTextSelection,
      linkEditHref: s.linkEditHref,
      setLinkEditHref: s.setLinkEditHref,
    })),
  )
  const handleFile = useFileHandlers()

  const [activeLinkHref, setActiveLinkHref] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [...extensions, ImageExt, FileHandlerExt.configure({ onPaste: handleFile })],
    content,
    immediatelyRender: false, // Avoid SSR & hydration issues
    editorProps: { attributes: { class: 'text-custom-xs' } },
    onUpdate: ({ editor }) => {
      settingsStoreApi?.getState().setSettings({
        content: editor.getHTML(),
      })
    },
  })

  // Track when cursor is inside a link mark
  const updateActiveLinkHref = useCallback(() => {
    if (!editor) return
    if (editor.isActive('link')) {
      const href = editor.getAttributes('link').href as string | undefined
      setActiveLinkHref(href ?? null)
    } else {
      setActiveLinkHref(null)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    editor.on('selectionUpdate', updateActiveLinkHref)
    editor.on('transaction', updateActiveLinkHref)

    return () => {
      editor.off('selectionUpdate', updateActiveLinkHref)
      editor.off('transaction', updateActiveLinkHref)
    }
  }, [editor, updateActiveLinkHref])

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
    return destroyEditor
  }, [editor, destroyEditor, setEditor])

  // Close link popups on scroll (with threshold to avoid touch tap false positives)
  const scrollStartRef = useRef<number | null>(null)
  useEffect(() => {
    const scrollParent = editor?.view.dom.closest<HTMLElement>('[class*="overflow-y"]')
    if (!scrollParent) return

    const SCROLL_THRESHOLD = 20

    const handleScroll = () => {
      if (scrollStartRef.current === null) {
        scrollStartRef.current = scrollParent.scrollTop
        return
      }

      const scrolled = Math.abs(scrollParent.scrollTop - scrollStartRef.current)
      if (scrolled < SCROLL_THRESHOLD) return

      scrollStartRef.current = null
      if (useEditorStore.getState().showLinkInput) {
        setShowLinkInput(false)
      }
      setActiveLinkHref(null)
    }

    const resetScrollStart = () => {
      scrollStartRef.current = null
    }

    scrollParent.addEventListener('scroll', handleScroll)
    scrollParent.addEventListener('touchend', resetScrollStart)
    return () => {
      scrollParent.removeEventListener('scroll', handleScroll)
      scrollParent.removeEventListener('touchend', resetScrollStart)
    }
  }, [editor, setShowLinkInput])

  const showLinkPreview = !!activeLinkHref && !showLinkInput

  return editor ? (
    <div>
      <BubbleMenu id="embed-bubble-menu" editor={editor} open={showEmbedInput}>
        <EmbedBubbleInput editor={editor} showEmbedInput={showEmbedInput} setShowEmbedInput={setShowEmbedInput} />
      </BubbleMenu>
      <BubbleMenu id="link-bubble-menu" editor={editor} open={showLinkInput}>
        <LinkBubbleInput
          editor={editor}
          showLinkInput={showLinkInput}
          setShowLinkInput={setShowLinkInput}
          hasTextSelection={linkHasTextSelection}
          editHref={linkEditHref}
          setEditHref={setLinkEditHref}
        />
      </BubbleMenu>
      <BubbleMenu
        id="link-preview-bubble-menu"
        editor={editor}
        open={showLinkPreview}
        placement="bottom-start"
        offset={[0, 8]}
      >
        <LinkPreviewBubble editor={editor} href={activeLinkHref ?? ''} />
      </BubbleMenu>
      <TableAddButtons editor={editor} />
      <TableSelectionOverlay editor={editor} />
      <EditorContent editor={editor} />
    </div>
  ) : null
}
