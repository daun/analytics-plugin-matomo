# Matomo Plugin for `analytics`

Integration with [Matomo](https://matomo.org/) for [analytics](https://www.npmjs.com/package/analytics), a lightweight open-source frontend analytics abstraction layer.

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
      token: 'abcdef123'
    })
  ]
})
```

## Usage

The plugin will load and configure Matomo's [tracking script](https://developer.matomo.org/guides/tracking-javascript-guide) and send custom events, page views, and identify visitors. You should remove the script tag from your templates to prevent double tracking.

Data will be sent into Matomo whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), [analytics.page](https://getanalytics.io/api/#analyticspage), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

```js
/* Track a page view */
analytics.page()

/* Track a custom event */
analytics.track('cartCheckout', {
  item: 'pink socks',
  price: 20
})

/* Identify a visitor */
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray'
})

```

## API

The Matomo plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Matomo
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Matomo
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Matomo
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Matomo values

## Configuration

| Option | description |
|:---------------------------|:-----------|
| `siteId` <br/>**required** - string| The site ID associated to a Matomo site |

## Supported Platforms

The Matomo plugin works in the browser. Node is currently not supported.

## License

MIT
