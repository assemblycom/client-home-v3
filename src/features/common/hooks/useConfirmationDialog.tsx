'use client'

import { type ReactNode, useCallback, useImperativeHandle, useRef, useState } from 'react'

type ConfirmationDialogRef = { confirm: () => Promise<boolean> }

type ConfirmationDialogProps = {
  title: string
  description: string
  isDangerous?: boolean
  rejectText?: ReactNode
  resolveText?: ReactNode
  ref: React.Ref<ConfirmationDialogRef>
}

const ConfirmationDialog = ({
  title,
  description,
  isDangerous,
  rejectText = 'Cancel',
  resolveText = 'Continue',
  ref,
}: ConfirmationDialogProps) => {
  const [open, setOpen] = useState(false)
  const promiseRef = useRef<(confirmed: boolean) => void>(() => {
    return Promise.resolve()
  })

  const confirm = useCallback(async () => {
    // Defer opening to the next frame so the triggering click event
    // doesn't bleed through to the newly mounted backdrop
    await new Promise((r) => requestAnimationFrame(r))
    setOpen(true)
    return await new Promise<boolean>((resolve) => {
      promiseRef.current = resolve
    })
  }, [])

  useImperativeHandle(ref, () => ({ confirm }))

  const handleClose = () => {
    promiseRef.current?.(false)
    setOpen(false)
  }

  const handleConfirm = () => {
    promiseRef.current?.(true)
    setOpen(false)
  }

  if (!open) return null

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <allow>
    // biome-ignore lint/a11y/useKeyWithClickEvents: <allow>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: <allow> */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: <allow> */}
      <div className="w-full max-w-xs rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-3 font-semibold text-gray-900 text-lg">{title}</h2>
        <p className="mb-6 text-gray-600 text-sm leading-5">{description}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 cursor-pointer rounded-md bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-200"
          >
            {rejectText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 cursor-pointer rounded-md px-4 py-2 font-medium text-sm text-white ${
              isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {resolveText}
          </button>
        </div>
      </div>
    </div>
  )
}

export const useConfirmationDialog = (props: Omit<ConfirmationDialogProps, 'ref'>) => {
  const confirmationDialog = useRef<ConfirmationDialogRef>(null)

  const dialogComponent = <ConfirmationDialog {...props} ref={confirmationDialog} />

  return {
    confirm: async () => {
      if (confirmationDialog.current) {
        return await confirmationDialog.current.confirm()
      }

      return new Promise<boolean>((resolve) => {
        const interval = setInterval(() => {
          if (confirmationDialog.current) {
            clearInterval(interval)
            confirmationDialog.current.confirm().then((res) => resolve(res))
          }
        }, 100)
      })
    },
    dialogComponent,
  }
}
