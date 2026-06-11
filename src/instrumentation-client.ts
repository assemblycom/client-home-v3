// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Browser extensions (crypto wallets like MetaMask, Phantom, TronLink, etc.)
// inject scripts into every page. When those throw unhandled rejections
// (e.g. "Cannot read properties of undefined (reading 'emit')" or
// "'set' on proxy: trap returned falsish for property 'tronlinkParams'") they
// bubble into our global handlers even though it's not our code. Drop any
// event whose stack originates from a known injected script.
const INJECTED_SCRIPT_PATTERNS = ['inpage.js', 'injected.js']

const isInjectedExtensionError = (event: Sentry.ErrorEvent): boolean => {
  const frames = event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? [])

  return Boolean(frames?.some((frame) => INJECTED_SCRIPT_PATTERNS.some((pattern) => frame.filename?.includes(pattern))))
}

// Some extensions run obfuscated code from anonymous blob: URLs. Their
// unhandled errors carry randomized, obfuscated messages (e.g.
// `_0x525794.PrSAI(...)[_0x2cc5a0(...)] is not a function`) with no stable
// filename or message to match on, but every frame originates from a blob: URL.
// Our own bundles are served from /_next and never run from blob:, so an event
// whose entire stack is blob-origin is not ours — drop it.
const isBlobOriginError = (event: Sentry.ErrorEvent): boolean => {
  const frames = event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? [])

  return Boolean(frames?.length && frames.every((frame) => frame.filename?.startsWith('blob:')))
}

Sentry.init({
  dsn,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  ignoreErrors: [
    // RSC streaming aborts (navigation away, iframe unmount, network blip)
    // surface as a global "Connection closed." from
    // react-server-dom-turbopack-client. It's handled and user-invisible.
    /^Connection closed\.$/,
    // Browser extensions ship the webextension-polyfill and run it from anonymous
    // blob: URLs, so there's no stable filename to filter on. `runtime.getManifest`
    // is an extension-only API we never call — match the message instead.
    /runtime\.getManifest is not a function/,
  ],

  beforeSend: (event) => (isInjectedExtensionError(event) || isBlobOriginError(event) ? null : event),

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
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
