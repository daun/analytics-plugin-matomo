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

Data will be sent into Matomo whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), [analytics.page](https://getanalytics.io/api/#analyticspage), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

The plugin will load and configure Matomo's [tracking script](https://developer.matomo.org/guides/tracking-javascript-guide) and send events, page views, and identify visitors. To prevent double tracking, you should remove the tracking script from your templates if you have previously added it
yourself.

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
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray'
})

```

## API

### Core methods

The plugin works with these analytics methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Matomo
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Matomo
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Matomo

### Plugin methods

The plugin also exposes custom methods, callable via `analytics.plugins.matomo.*`.

#### `paq(...args)`

Push a raw command directly onto Matomo's `_paq` queue.

```js
analytics.plugins.matomo.paq(['setUserId', 'user-123'])
```

#### `updateConsent(consented)`

Grant or revoke consent for tracking or cookies. Maps to [Matomo's consent functions](https://developer.matomo.org/guides/tracking-consent). Only relevant if the plugin's : `rememberConsentGiven` when the plugin config `requireConsent` is true, `rememberCookieConsentGiven` when the plugin config `requireCookieConsent` is set. No-op otherwise.

```js
/* After user consent is granted in a consent dialog */
analytics.plugins.matomo.updateConsent(true)
```

## Configuration

### `installationUrl`

Base URL of your Matomo installation. Used to derive the tracker and script urls (`matomo.php` and `matomo.js`). Required.

### `siteId`

The site ID associated to a Matomo site. Required.

### `trackerUrl`

Explicit tracker endpoint URL. Overrides the value derived from `installationUrl`. Optional.

### `scriptUrl`

Explicit tracking script URL. Overrides the value derived from `installationUrl`. Optional.

### `requireConsent`

Require tracking consent before any data is sent. Use the `updateConsent` method to grant/revoke. Default: `false`.

### `requireCookieConsent`

Require consent for setting cookies (tracking still occurs without cookies). Use the `updateConsent` method to grant/revoke. Default: `false`.

## Consent Handling

By default, the plugin will track all events without explicit consent. You must manually configure the plugin to disable tracking until consent was explicitly granted.

### Without Consent

If you don't require consent, you can leave the `requireConsent` config option unset. The plugin will then track all events.

### With Consent for All Tracking

If you require consent for all tracking, set the `requireConsent` config option to `true`. The plugin will only track events after consent is explicitly granted. To grant or revoke consent, use the `updateConsent` method on the plugin instance.

```js
/* After user consent is granted in a cookie banner */
analytics.plugins.matomo.updateConsent(true)
```

### With Consent for Cookies

If you configured Matomo for cookieless tracking, you might still need
consent for setting additional tracking cookies to improve your analytics data. In this case, set the `requireCookieConsent` config option to `true`. The plugin will track all events without cookies immediately. Once consent is granted, the plugin will start tracking with additional cookies. To grant or revoke consent, use the same `updateConsent` method on the plugin instance.

## Supported Platforms

The Matomo plugin works in the browser. Node is currently not supported.

## License

MIT
