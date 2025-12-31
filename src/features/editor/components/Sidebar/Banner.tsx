'use client'

import { Button } from 'copilot-design-system'

export const Banner = () => {
  return (
    <>
      <div className="flex h-23 w-full items-center justify-center rounded-md border border-border-gray text-sm text-text-secondary">
        Space for banner image
      </div>
      <div className="mt-3 flex flex-col space-y-3">
        <Button
          label="Change banner"
          variant="primary"
          onClick={() => console.info('Info: change banner')}
          className="w-full"
        />
        <Button
          label="Reposition banner"
          variant="secondary"
          onClick={() => console.info('Info: Reposition banner')}
          className="w-full"
        />
      </div>
    </>
  )
}
