'use client'
import { useSettingsStore } from '@settings/providers/settings.provider'
import Colorful from '@uiw/react-color-colorful'
import { Popper } from '@/features/editor/components/Popper'
import { useBackgroundColorPopup } from '@/features/editor/components/Sidebar/BackgroundColor/useBackgroundColor'

export const BackgroundColor = () => {
  const backgroundColor = useSettingsStore((s) => s.backgroundColor)
  const setSettings = useSettingsStore((s) => s.setSettings)

  const handleColorfulChange = (color: { hex: string }) => {
    setSettings({ backgroundColor: color.hex })
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
          className="tiptap-wrapper h-6 w-6 rounded-sm border border-border-gray"
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
          <Colorful color={backgroundColor} disableAlpha={true} onChange={handleColorfulChange} />
        </Popper>
        <span className="ml-3 text-sm text-text-primary uppercase leading-5 tracking-[-0.15px]">{backgroundColor}</span>
      </div>
    </div>
  )
}
