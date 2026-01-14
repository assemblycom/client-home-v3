'use client'
import Colorful from '@uiw/react-color-colorful'
import { Popper } from '@/features/editor/components/Popper'
import { useBackgroundColor } from '@/features/editor/components/Sidebar/BackgroundColor/useBackgroundColor'

export const BackgroundColor = () => {
  const { backgroundColor, setBackgroundColor, triggerRef, isOpen, setIsOpen, togglePopper } = useBackgroundColor()

  return (
    <div className="rounded-sm border border-border-gray">
      <div className="flex items-center p-3">
        {/*
         * biome-ignore lint/a11y/noStaticElementInteractions: No static element interactions
         */}
        <div
          ref={triggerRef}
          className="h-6 w-6 rounded-sm border border-border-gray"
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
          <Colorful
            color={backgroundColor}
            disableAlpha={true}
            onChange={(color) => {
              setBackgroundColor(color.hex)
            }}
          />
        </Popper>
        <span className="ml-3 text-sm text-text-primary uppercase leading-5 tracking-[-0.15px]">{backgroundColor}</span>
      </div>
    </div>
  )
}
