'use client'

import { Button } from 'copilot-design-system'
import { useCallback, useImperativeHandle, useRef, useState } from 'react'

type ConfirmationDialogRef = { confirm: () => Promise<boolean> }

type ConfirmationDialogProps = {
  title: string
  description: string
  isDangerous?: boolean
  rejectText?: string
  resolveText?: string
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
      <div
        className="flex w-[480px] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center self-stretch px-5 py-3">
          <h2 className="font-medium text-base text-text-primary leading-6">{title}</h2>
        </div>

        <div className="h-px bg-border-gray" />

        <div className="flex flex-col items-start gap-2.5 self-stretch px-5 py-5">
          <p className="font-normal text-[13px] text-text-primary leading-[21px]">{description}</p>
        </div>

        <div className="h-px bg-border-gray" />

        <div className="flex h-[60px] items-center justify-end gap-6 self-stretch px-5 py-4">
          <Button label={rejectText} variant="secondary" onClick={handleClose} />
          <Button
            label={resolveText}
            variant="primary"
            style={isDangerous ? { backgroundColor: '#991A00', borderColor: '#991A00' } : undefined}
            onClick={handleConfirm}
          />
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
