import type { CaptureResult, CapturedNetworkRequest, PostHog, Properties } from 'posthog-js'

/**
 * PostHog product analytics: page views, autocaptured clicks, unhandled
 * errors and the custom events sent through `capture`.
 *
 * Only the live site reports. The project token and host come from
 * .env.production, so the dev server has neither, and a production build
 * served anywhere else stays quiet. A local `vite preview` opened with
 * ?posthog=on reports too, to check a build before it ships; the override
 * works on localhost only, so another site loading these scripts can't use
 * it. The token is public by design: it ships in the page's JavaScript.
 *
 * posthog-js is large (about 95 KB gzipped, several times the landing page's
 * own entry script), so it loads as a separate chunk, alongside hydration
 * rather than ahead of it. Events captured before it arrives wait for it.
 *
 * Features switched on in PostHog's project settings, such as session replay
 * or surveys, take effect without a deploy and load their own scripts from
 * PostHog.
 */
const token = import.meta.env.VITE_POSTHOG_KEY
const apiHost = import.meta.env.VITE_POSTHOG_HOST
const liveHosts = ['counterbranch.com', 'www.counterbranch.com']
const localHosts = ['localhost', '127.0.0.1']

/** A custom event captured before posthog-js loaded, sent once it has. */
type Pending = { event: string; properties?: Record<string, string>; timestamp: Date }
const MAX_PENDING = 20

let client: PostHog | undefined
let pending: Pending[] | undefined

/** Loads and starts PostHog. Each page's browser entry calls it once. */
export function startAnalytics() {
  if (!token || !apiHost) return
  const live = liveHosts.includes(location.hostname)
  const localCheck =
    localHosts.includes(location.hostname) && new URLSearchParams(location.search).get('posthog') === 'on'
  if (!live && !localCheck) return
  tidyUrl()
  pending = []
  void import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(token, {
        api_host: apiHost,
        defaults: '2026-05-30',
        capture_exceptions: {
          capture_unhandled_errors: true,
          capture_unhandled_rejections: true,
          capture_console_errors: false,
        },
        // Section links add nothing to the reports, and the toolbar's launch
        // state must not be stored.
        disable_capture_url_hashes: true,
        // Kept as a property of its own, like utm_*.
        custom_campaign_params: ['ref'],
        // The browser's navigation timing keeps the URL the page was
        // requested with, whatever tidyUrl does to the address bar. Web
        // vitals and session replay's network recording both report it.
        before_send: tidyWebVitals,
        session_recording: { maskCapturedNetworkRequestFn: tidyNetworkRequest },
      })
      client = posthog
      for (const { event, properties, timestamp } of pending ?? []) {
        posthog.capture(event, properties, { timestamp })
      }
      pending = undefined
    })
    // A blocked or failed load only means no analytics; the page is unaffected.
    .catch(() => {
      pending = undefined
    })
}

/**
 * Captures a custom event. Before PostHog has loaded, the first few wait for
 * it; where analytics is off, events are dropped.
 */
export function capture(event: string, properties?: Record<string, string>) {
  if (client) {
    client.capture(event, properties)
  } else if (pending && pending.length < MAX_PENDING) {
    pending.push({ event, properties, timestamp: new Date() })
  }
}

/**
 * Query parameters the page keeps: campaign tags and PostHog's debug switch.
 * Their values reach PostHog as they are, so a campaign link must never put a
 * person's details in one.
 */
const KEPT_PARAM = /^(utm_[a-z]+|ref|__posthog_debug)$/
/**
 * Fragments the address bar keeps: section links and the PostHog toolbar's
 * launch state, which can hold a temporary token. URLs PostHog records keep
 * no fragment at all.
 */
const KEPT_FRAGMENT = /^#([A-Za-z][\w-]*|__posthog=.*)$/

/**
 * A URL with only the query parameters the page keeps, and no fragment, or
 * with a kept fragment for the address bar itself.
 */
function tidy(href: string, forAddressBar = false) {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return href
  }
  const dropped = [...url.searchParams.keys()].filter((key) => !KEPT_PARAM.test(key))
  const dropHash = url.hash !== '' && !(forAddressBar && KEPT_FRAGMENT.test(url.hash))
  if (!dropped.length && !dropHash) return href
  for (const key of dropped) url.searchParams.delete(key)
  if (dropHash) url.hash = ''
  return url.href
}

/**
 * A followed link can carry a visitor's details, such as an email address in
 * its query string. Before PostHog starts, the page's own URL drops every
 * other query parameter and fragment, so no copy PostHog makes of it (events,
 * replays, feature-flag requests, the stored first-visit URL) includes them.
 * Nothing on the site reads them. The pages' referrer policy (strict-origin,
 * set in their HTML) covers the next page's referrer, when a link is followed
 * before this has run.
 */
function tidyUrl() {
  const href = tidy(location.href, true)
  if (href !== location.href) history.replaceState(history.state, '', href)
}

/**
 * A request as session replay's network recording keeps it: its URL tidied,
 * and no headers or bodies. A custom mask replaces PostHog's own redaction of
 * those, and nothing this site requests needs them recorded.
 */
function tidyNetworkRequest(request: CapturedNetworkRequest): CapturedNetworkRequest {
  return {
    ...request,
    name: tidy(request.name),
    requestHeaders: undefined,
    requestBody: undefined,
    responseHeaders: undefined,
    responseBody: undefined,
  }
}

/** Web vitals with every URL in them tidied, as the page's own URL is. */
function tidyWebVitals(result: CaptureResult | null): CaptureResult | null {
  if (result?.event !== '$web_vitals') return result
  return { ...result, properties: tidyUrls(result.properties) as Properties }
}

/** A value with every absolute URL in it tidied; plain data only. */
function tidyUrls(value: unknown): unknown {
  if (typeof value === 'string') return /^https?:\/\//i.test(value) ? tidy(value) : value
  if (Array.isArray(value)) return value.map(tidyUrls)
  if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, tidyUrls(item)]))
  }
  return value
}
