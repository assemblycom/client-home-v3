// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Markers injected by browser-extension content scripts (crypto wallets, etc.)
// that leak console errors into Sentry because they run in our page context.
// See OUT-3553 — the "Origin not allowed" issue was traced to a multichainWallet
// extension's internal allowlist check, not our code.
const EXTENSION_NOISE_MARKERS = [
  'multichainWallet',
  'contentscriptFunctionCall',
  'postMessageToContentScript',
  'chrome-extension://',
  'moz-extension://',
  'safari-web-extension://',
]

const isBrowserExtensionNoise = (event: Sentry.ErrorEvent): boolean => {
  try {
    const probe = JSON.stringify({
      message: event.message,
      exception: event.exception,
      extra: event.extra,
      breadcrumbs: event.breadcrumbs?.slice(-10),
    })
    return EXTENSION_NOISE_MARKERS.some((marker) => probe.includes(marker))
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
