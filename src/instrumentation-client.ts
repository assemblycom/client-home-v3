// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Marker left behind by multichainWallet-family browser extension content
// scripts that log errors via console in our page context (no stack frame
// for `denyUrls` to filter on). See OUT-3553.
const EXTENSION_NOISE_MARKER = 'multichainWallet'

const isBrowserExtensionNoise = (event: Sentry.ErrorEvent): boolean => {
  try {
    const probe = JSON.stringify({
      message: event.message,
      exception: event.exception,
      extra: event.extra,
    })
    return probe.includes(EXTENSION_NOISE_MARKER)
  } catch {
    return false
  }
}

Sentry.init({
  dsn,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Drop events whose top stack frame is in a browser extension URL. Catches
  // native exceptions thrown from extension-owned code.
  denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i, /^safari(-web)?-extension:\/\//i],

  // Catches extension content scripts that log via console in our page context
  // (no stack frame) — see OUT-3553.
  beforeSend: (event) => (isBrowserExtensionNoise(event) ? null : event),
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
