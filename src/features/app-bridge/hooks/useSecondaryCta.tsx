import type { Clickable, Configurable, SecondaryCtaPayload } from '@app-bridge/types'
import { handleParentPostMessage } from '@app-bridge/utils'
import { useEffect } from 'react'

export const useSecondaryCta = (secondaryCta: Clickable, config?: Configurable) => {
  useEffect(() => {
    const show = config?.show === undefined ? true : config.show // Show by default

    const payload: SecondaryCtaPayload = {
      type: 'header.secondaryCta',
      icon: show ? secondaryCta.icon : undefined,
      label: show ? secondaryCta.label : undefined,
      onClick: show ? 'header.secondaryCta.onClick' : undefined,
    }

    handleParentPostMessage(payload, config?.portalUrl)

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === 'header.secondaryCta.onClick' &&
        typeof event.data.id === 'string' &&
        secondaryCta?.onClick
      ) {
        secondaryCta.onClick()
      }
    }

    addEventListener('message', handleMessage)

    return () => {
      removeEventListener('message', handleMessage)
    }
  }, [secondaryCta, config?.portalUrl, config?.show])

  useEffect(() => {
    const handleUnload = () => {
      handleParentPostMessage({ type: 'header.secondaryCta' }, config?.portalUrl)
    }
    addEventListener('beforeunload', handleUnload)
    return () => {
      removeEventListener('beforeunload', handleUnload)
    }
  }, [config?.portalUrl])
}
