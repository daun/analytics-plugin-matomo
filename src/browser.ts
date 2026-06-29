/* eslint-disable no-lonely-if */
/* global window */

import type { AnalyticsPlugin } from 'analytics'
import type { MatomoPluginConfig } from './types.js'

export type { MatomoPluginConfig } from './types.js'

declare global {
	interface Window {
		_paq: unknown[]
	}
}

function fail(message: string): never {
	throw new Error(`[analytics-plugin-matomo] ${message}`)
}

const defaults: MatomoPluginConfig = {
	siteId: null,
	installationUrl: null,
	trackerUrl: null,
	scriptUrl: null,
	requireConsent: false,
	requireCookieConsent: false,
	disableCookies: false,
	doNotTrack: false,
	cookieDomain: undefined,
	secureCookie: false,
	cookieSameSite: undefined,
	enableLinkTracking: true,
	enableHeartBeatTimer: true,
	enableCrossDomainLinking: false,
	disablePerformanceTracking: false,
	domains: undefined,
}

/**
 * Matomo plugin
 *
 * @example
 *
 * matomo({
 *   siteId: 1,
 *   installationUrl: '/matomo/',
 * })
 */
export default function matomo(options: MatomoPluginConfig): AnalyticsPlugin {
	let loaded = false
	let push: (...args: unknown[]) => void = () => { /* noop */ }

	const config: MatomoPluginConfig = {
		...defaults,
		...options
	}

	if (!config.siteId) {
		fail('Missing required option: siteId')
	}

	if (!config.installationUrl) {
		fail('Missing required option: installationUrl')
	}

	return {
		name: 'matomo',
		config,
		loaded: () => loaded,
		initialize({ config }: { config: MatomoPluginConfig }) {
			window._paq = window._paq || []
			push = (...args) => window._paq.push(...args)

			push(['setTrackerUrl', config.trackerUrl ?? `${config.installationUrl}matomo.php`])
			push(['setSiteId', config.siteId])

			if (config.doNotTrack) {
				push(['setDoNotTrack', true])
			}
			if (config.cookieDomain) {
				push(['setCookieDomain', config.cookieDomain])
			}
			if (config.secureCookie) {
				push(['setSecureCookie', true])
			}
			if (config.cookieSameSite) {
				push(['setCookieSameSite', config.cookieSameSite])
			}
			if (config.domains) {
				push(['setDomains', config.domains])
			}

			if (config.requireConsent)  {
				push(['requireConsent'])
			} else if (config.requireCookieConsent) {
				push(['requireCookieConsent'])
			}

			if (config.disableCookies) {
				push(['disableCookies'])
			}

			if (config.enableLinkTracking) {
				push(['enableLinkTracking'])
			}
			if (typeof config.enableHeartBeatTimer === 'number') {
				push(['enableHeartBeatTimer', config.enableHeartBeatTimer])
			} else if (config.enableHeartBeatTimer) {
				push(['enableHeartBeatTimer'])
			}
			if (config.enableCrossDomainLinking) {
				push(['enableCrossDomainLinking'])
			}
			if (config.disablePerformanceTracking) {
				push(['disablePerformanceTracking'])
			}

			const script = document.createElement('script')
			script.type = 'text/javascript'
			script.async = true
			script.src = config.scriptUrl ?? `${config.installationUrl}matomo.js`
			script.addEventListener('load', () => (loaded = true))

			const el = document.getElementsByTagName('script')[0]
			if (el?.parentNode) {
				el.parentNode.insertBefore(script, el)
			} else {
				document.head.appendChild(script)
			}
		},
		page({ payload: { properties } }: { payload: { properties: { title?: string; url?: string } } }) {
			push(['setDocumentTitle', properties.title ?? document.title])
			push(['setCustomUrl', properties.url ?? window.location.href])
			push(['trackPageView'])
		},
		track({ payload }: { payload: { event: string; properties: Record<string, unknown> } }) {
			const { category, name, value } = payload.properties
			push(['trackEvent', category, payload.event, name, value])
		},
		identify({ payload: { userId } }: { payload: { userId?: string } }) {
			if (userId) {
				push(['setUserId', userId])
			} else {
				push(['resetUserId'])
			}
		},
		methods: {
			paq(command: unknown[]) {
				return push(command)
			},
			updateConsent(consented: boolean) {
				if (config.requireConsent)  {
					push([consented ? 'rememberConsentGiven' : 'forgetConsentGiven'])
				} else if (config.requireCookieConsent) {
					push([consented ? 'rememberCookieConsentGiven' : 'forgetCookieConsentGiven'])
				} else {
					console.log('Matomo consent not required, ignoring updateConsent call')
				}
			}
		}
	}
}
