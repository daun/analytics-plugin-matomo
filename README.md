# Matomo Plugin for `analytics`

[Matomo](https://matomo.org/) integration for [analytics](https://www.npmjs.com/package/analytics), a lightweight open-source frontend analytics abstraction layer.

## Installation

Install `analytics` and `analytics-plugin-matomo` packages.

```bash
npm install analytics
npm install analytics-plugin-matomo
```

## Setup

Initialize the plugin with analytics.

```js
import Analytics from 'analytics'
import matomoPlugin from 'analytics-plugin-matomo'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    matomoPlugin({
      installationUrl: '/matomo/',
      siteId: 1,
    })
  ]
})
```

## Usage

The plugin loads and configures Matomo's [tracking script](https://developer.matomo.org/guides/tracking-javascript-guide), then sends data whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), [analytics.page](https://getanalytics.io/api/#analyticspage), or [analytics.track](https://getanalytics.io/api/#analyticstrack) is called.

If you already include the Matomo tracking script in your templates, remove it to avoid double tracking.

```js
/* Track a page view */
analytics.page()

/* Track a custom event */
analytics.track('Add', {
  category: 'Cart',
  name: 'Ice Cubes',
  value: 3
})

/* Identify a visitor */
analytics.identify('user-id-xyz')
```

## API

### Core methods

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify a visitor.
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Send a page view.
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Send a custom event.

### Plugin methods

#### `paq(...args)`

Push a raw command onto Matomo's `_paq` queue.

```js
analytics.plugins.matomo.paq(['setUserId', 'user-123'])
```

## Configuration

### Registration

- **`installationUrl`** — Base URL of your Matomo installation. Used to derive the tracker and script URLs (`matomo.php` and `matomo.js`). Required.
- **`siteId`** — Matomo site ID. Required.
- **`trackerUrl`** — Custom tracker endpoint URL. Overrides the value derived from `installationUrl`. Optional.
- **`scriptUrl`** — Custom tracking script URL. Overrides the value derived from `installationUrl`. Optional.

### Privacy & Cookies

- **`requireConsent`** — Withhold all tracking until consent is granted via `updateConsent()`. Default: `false`.
- **`requireCookieConsent`** — Track without cookies until  consent is granted via `updateConsent()`. Default: `false`.
- **`disableCookies`** — Disable all first-party cookies (cookieless tracking). Default: `false`.
- **`doNotTrack`** — Respect the browser's Do Not Track setting. Default: `false`.
- **`cookieDomain`** — Cookie domain, e.g. `*.example.com` to share cookies across subdomains.
- **`secureCookie`** — Set the `Secure` flag on all first-party cookies (HTTPS-only sites). Default: `false`.
- **`cookieSameSite`** — `SameSite` attribute for tracking cookies: `'Lax'` (Matomo default), `'None'`, or `'Strict'`.

### Features

- **`enableLinkTracking`** — Track clicks on outbound links and downloads. Default: `true`.
- **`enableHeartBeatTimer`** — Improve time-on-page accuracy. `true` uses the Matomo default active time, a number sets the active time in seconds, `false` disables it. Default: `true`.
- **`enableCrossDomainLinking`** — Stitch visits across multiple owned domains. Default: `false`.
- **`disablePerformanceTracking`** — Disable page performance tracking. Default: `false`.

These cover the most common Matomo settings. For the complete, authoritative list of options and their types, see the config definition in the source: [`src/types.ts`](https://github.com/daun/analytics-plugin-matomo/blob/main/src/types.ts).

### Other Matomo settings

The plugin only maps a subset of Matomo's tracking API to config options. For anything not listed above, push the raw command yourself with [`paq`](#paqargs). For example, to set a custom dimension:

```js
analytics.plugins.matomo.paq(['setCustomDimension', 1, 'premium-user'])
```

## Consent Handling

By default, the plugin tracks everything without awaiting consent. Two plugin options change this. Both use the `updateConsent` method to grant or revoke consent at runtime.

- **No consent** (default): leave both options unset. All events are tracked.
- **`requireConsent: true`**: no tracking until consent is granted.
- **`requireCookieConsent: true`**: tracking starts immediately without cookies; cookies are set once consent is granted. Use this for cookieless tracking that adds cookies later for more accurate tracking data.

```js
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    matomoPlugin({
      requireConsent: true,
    })
  ]
})

// Later... grant consent for tracking from consent dialog
analytics.plugins.matomo.updateConsent(true)
```

## Supported Platforms

The Matomo plugin works in the browser. Node is currently not supported.

## License

MIT
