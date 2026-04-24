'use client'
import { useSettingsStore } from '@settings/providers/settings.provider'
import { type HsvaColor, hexToHsva } from '@uiw/color-convert'
import Colorful from '@uiw/react-color-colorful'
import { useEffect, useRef, useState } from 'react'
import { Popper } from '@/features/editor/components/Popper'
import { useBackgroundColorPopup } from '@/features/editor/components/Sidebar/BackgroundColor/useBackgroundColor'
import { hexToRgb } from '@/utils/color'

const DEFAULT_HEX = '#ffffff'

const normalizeHex = (value: string): string | null => {
  const stripped = value.replace(/^#/, '').trim()
  if (/^[a-f\d]{3}$/i.test(stripped)) {
    const expanded = stripped
      .split('')
      .map((c) => c + c)
      .join('')
    return `#${expanded}`
  }
  if (/^[a-f\d]{6}$/i.test(stripped)) {
    return `#${stripped}`
  }
  return null
}

const safeHexToHsva = (value: string): HsvaColor => hexToHsva(normalizeHex(value) ?? DEFAULT_HEX)

export const BackgroundColor = () => {
  const backgroundColor = useSettingsStore((s) => s.backgroundColor)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const [hexInput, setHexInput] = useState((backgroundColor ?? '').replace('#', '').toUpperCase())
  const [hsva, setHsva] = useState<HsvaColor>(() => safeHexToHsva(backgroundColor))
  const lastPickerHexRef = useRef(backgroundColor)
  const inputRef = useRef<HTMLInputElement>(null)

  const isFocusedRef = useRef(false)

  useEffect(() => {
    if (!isFocusedRef.current) {
      setHexInput((backgroundColor ?? '').replace('#', '').toUpperCase())
    }
    if (backgroundColor !== lastPickerHexRef.current) {
      setHsva(safeHexToHsva(backgroundColor))
      lastPickerHexRef.current = backgroundColor
    }
  }, [backgroundColor])

  const handleColorfulChange = (color: { hex: string; hsva: HsvaColor }) => {
    lastPickerHexRef.current = color.hex
    setHsva(color.hsva)
    setSettings({ backgroundColor: color.hex })
  }

  const handleHexInput = (value: string) => {
    const clean = value
      .replace(/[^a-fA-F\d]/g, '')
      .toUpperCase()
      .slice(0, 6)
    setHexInput(clean)
    if (clean.length === 6) {
      const normalized = normalizeHex(clean)
      if (normalized && hexToRgb(normalized)) {
        setSettings({ backgroundColor: normalized })
      }
    }
  }

  const commitHexValue = () => {
    const normalized = normalizeHex(hexInput)
    if (normalized && hexToRgb(normalized)) {
      setSettings({ backgroundColor: normalized })
      setHexInput(normalized.replace('#', '').toUpperCase())
    } else {
      setHexInput((backgroundColor ?? '').replace('#', '').toUpperCase())
    }
  }

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitHexValue()
      inputRef.current?.blur()
    }
  }

  const { triggerRef, isOpen, setIsOpen, togglePopper } = useBackgroundColorPopup()

  return (
    <div className="rounded-sm border border-border-gray">
      <div className="flex items-center p-3">
        {/*
         * biome-ignore lint/a11y/noStaticElementInteractions: No static element interactions
         */}
        <div
          ref={triggerRef}
          className="tiptap-wrapper @container h-6 w-6 rounded-sm border border-border-gray"
          style={{ backgroundColor }}
          onClick={togglePopper}
          onKeyDown={togglePopper}
        ></div>
        <Popper
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          triggerRef={triggerRef}
          className="rounded-sm border border-border-gray bg-white p-4 shadow-lg"
        >
          <Colorful color={hsva} disableAlpha={true} onChange={handleColorfulChange} />
        </Popper>
        <span className="ml-3 text-sm text-text-primary leading-5 tracking-[-0.15px]">#</span>
        <input
          ref={inputRef}
          type="text"
          value={hexInput}
          onChange={(e) => handleHexInput(e.target.value)}
          onFocus={() => {
            isFocusedRef.current = true
          }}
          onBlur={() => {
            isFocusedRef.current = false
            commitHexValue()
          }}
          onKeyDown={handleHexKeyDown}
          className="w-16 border-none bg-transparent text-sm text-text-primary uppercase leading-5 tracking-[-0.15px] outline-none"
        />
      </div>
    </div>
  )
}
