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
}
