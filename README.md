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

Callable via `analytics.plugins.matomo.*`.

#### `paq(...args)`

Push a raw command onto Matomo's `_paq` queue.

```js
analytics.plugins.matomo.paq(['setUserId', 'user-123'])
```

#### `updateConsent(consented)`

Grant or revoke consent for tracking and cookies. See [consent handling](#consent-handling) for details.

```js
analytics.plugins.matomo.updateConsent(true)
```

## Configuration

### `installationUrl`

Base URL of your Matomo installation. Used to derive the tracker and script URLs (`matomo.php` and `matomo.js`). Required.

### `siteId`

Matomo site ID. Required.

### `trackerUrl`

Tracker endpoint URL. Overrides the value derived from `installationUrl`. Optional.

### `scriptUrl`

Tracking script URL. Overrides the value derived from `installationUrl`. Optional.

### `requireConsent`

Withhold all tracking until consent is granted via `updateConsent`. Default: `false`.

### `requireCookieConsent`

Track without cookies until cookie consent is granted via `updateConsent`. Default: `false`.

## Consent Handling

By default, the plugin tracks everything without awaiting consent. Two config options change this. Both use `updateConsent` to grant or revoke consent at runtime:

```js
analytics.plugins.matomo.updateConsent(true)
```

- **No consent** (default): leave both options unset. All events are tracked.
- **`requireConsent: true`**: no tracking until consent is granted.
- **`requireCookieConsent: true`**: tracking starts immediately without cookies; cookies are set once consent is granted. Use this for cookieless tracking that adds cookies later for more accurate tracking data.

## Supported Platforms

The Matomo plugin works in the browser. Node is currently not supported.

## License

MIT
