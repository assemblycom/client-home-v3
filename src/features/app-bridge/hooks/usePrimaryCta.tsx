import type { Clickable, Configurable, PrimaryCtaPayload } from '@app-bridge/types'
import { handleParentPostMessage } from '@app-bridge/utils'
import { useEffect } from 'react'

export const usePrimaryCta = (primaryCta: Clickable, config?: Configurable) => {
  useEffect(() => {
    const payload: PrimaryCtaPayload = {
      icon: primaryCta.icon,
      label: primaryCta.label,
      onClick: 'header.primaryCta.onClick',
      type: 'header.primaryCta',
    }

    handleParentPostMessage(payload, config?.portalUrl)

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'header.primaryCta.onClick' && typeof event.data.id === 'string' && primaryCta?.onClick) {
        primaryCta.onClick()
      }
    }

    addEventListener('message', handleMessage)

    return () => {
      removeEventListener('message', handleMessage)
    }
  }, [primaryCta, config?.portalUrl])

  useEffect(() => {
    const handleUnload = () => {
      handleParentPostMessage({ type: 'header.primaryCta' }, config?.portalUrl)
    }
    addEventListener('beforeunload', handleUnload)
    return () => {
      removeEventListener('beforeunload', handleUnload)
    }
  }, [config?.portalUrl])
}
