/**
 * Configuration options for the Matomo analytics plugin.
 */
export interface MatomoPluginConfig {
	/** The site ID associated to a Matomo site. Required. */
	siteId: number | string | null

	/**
	 * Base URL of your Matomo installation. Required.
	 * Used to derive the tracker and script URLs (matomo.php and matomo.js).
	 */
	installationUrl: string | null

	/** Explicit tracker endpoint URL. Overrides the value derived from `installationUrl`. */
	trackerUrl?: string | null

	/** Explicit tracking script URL. Overrides the value derived from `installationUrl`. */
	scriptUrl?: string | null

	/** Require explicit consent before any data is sent. Default: `false`. */
	requireConsent?: boolean

	/** Require explicit consent for cookies only. Default: `false`. */
	requireCookieConsent?: boolean

	/**
	 * Disable all first party cookies (cookieless tracking). Default: `false`.
	 * Takes precedence over `requireCookieConsent`: when `true`, no cookies are
	 * used regardless of consent state.
	 */
	disableCookies?: boolean

	/** Respect the browser's Do Not Track setting. Default: `false`. */
	doNotTrack?: boolean

	/** Cookie domain, e.g. `*.example.com` to share cookies across subdomains. */
	cookieDomain?: string

	/** Enable the Secure flag on all first party cookies (HTTPS-only sites). Default: `false`. */
	secureCookie?: boolean

	/** SameSite attribute for tracking cookies. Matomo default is `Lax`. */
	cookieSameSite?: 'Lax' | 'None' | 'Strict'

	/** Install link tracking on applicable link elements. Default: `true`. */
	enableLinkTracking?: boolean

	/**
	 * Enable the heartbeat timer for more accurate time-on-page.
	 * `true` uses the Matomo default active time; a number sets the active time
	 * in seconds; `false` disables it. Default: `true`.
	 */
	enableHeartBeatTimer?: boolean | number

	/** Enable cross domain linking to stitch visits across owned domains. Default: `false`. */
	enableCrossDomainLinking?: boolean

	/** Disable page performance tracking. Default: `false`. */
	disablePerformanceTracking?: boolean

	/** Hostnames or domains to be treated as local, e.g. `['*.example.com']`. */
	domains?: string[]
}
