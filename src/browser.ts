/* eslint-disable no-lonely-if */
/* global window */

const defaults = {
	siteId: null,
	installationUrl: '/matomo/',
	trackerUrl: null,
	scriptUrl: null,
	requireConsent: false,
	requireCookieConsent: false,
}

/**
 * Matomo plugin
 *
 * @example
 *
 * matomo({
 *   siteId: 1,
 *   installationUrl: 'matomo.example.com',
 * })
 */
export default function matomo(options = {}) {
	let loaded = false
	let push = () => { /* noop */ }

	const config = {
		...defaults,
		...options
	}

	return {
		name: 'matomo',
		config,
		loaded: () => loaded,
		initialize({ config }) {
			if (typeof window === 'undefined') {
				return null
			}

			window._paq = window._paq || []
			push = (...args) => window._paq.push(...args)

			push(['setTrackerUrl', config.trackerUrl || `${config.installationUrl}matomo.php`])
			push(['setSiteId', config.siteId])

			if (config.requireConsent)  {
				push(['requireConsent'])
			} else if (config.requireCookieConsent) {
				push(['requireCookieConsent'])
			}

			// paq.push(['trackPageView'])
			push(['enableLinkTracking'])
			// window._paq.push(['setLinkTrackingTimer', 250])
			push(['enableHeartBeatTimer'])

			const script = document.createElement('script')
			script.type = 'text/javascript'
			script.async = true
			script.src = config.scriptUrl || `${config.installationUrl}matomo.js`
			script.addEventListener('load', () => (loaded = true))

			const el = document.getElementsByTagName('script')[0]
			el.parentNode.insertBefore(script, el)
		},
		page({ payload: { properties } }) {
			push(['setDocumentTitle', properties.title ?? document.title])
			push(['setCustomUrl', properties.url ?? window.location.href])
			push(['trackPageView'])
		},
		track({ payload: { event, properties: { context, action, subject, value, ...data } } }) {
  		push(['trackEvent', context ?? 'App', action ?? event, subject, value])
		},
		methods: {
			paq(...args) {
				return push(...args)
			},
			updateConsent(consented) {
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
