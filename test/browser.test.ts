/* global window, document */
import { beforeEach, describe, expect, it } from 'vitest'
import Analytics from 'analytics'
import matomo, { buildSetupCommands, injectScript } from '../src/browser.js'
import type { MatomoPluginConfig } from '../src/types.js'

const baseOptions: MatomoPluginConfig = {
	siteId: 1,
	installationUrl: '/matomo/',
}

/**
 * Build an initialized plugin instance, running it through a real `analytics`
 * instance so that the `methods` (paq, updateConsent) are hoisted onto the
 * plugin exactly as they are in production.
 */
type MatomoMethods = {
	paq: (...args: unknown[]) => unknown
	updateConsent: (consented: boolean) => void
}

function setup(options: MatomoPluginConfig = baseOptions) {
	const plugin = matomo(options)
	const analytics = Analytics({ app: 'test-app', plugins: [plugin] })
	plugin.initialize?.({ config: plugin.config })
	const hoisted = (analytics.plugins as unknown as Record<string, MatomoMethods>).matomo
	return Object.assign(plugin, hoisted)
}

beforeEach(() => {
	window._paq = []
	document.head.innerHTML = ''
})

describe('required options', () => {
	it('does not throw when required options are present', () => {
		expect(() => matomo(baseOptions)).not.toThrow()
	})

	it('throws when siteId is empty', () => {
		// @ts-expect-error testing missing required option
		expect(() => matomo({ installationUrl: '/matomo/' })).toThrow(/siteId/)
		expect(() => matomo({ siteId: null, installationUrl: '/matomo/' })).toThrow(/siteId/)
		expect(() => matomo({ siteId: '', installationUrl: '/matomo/' })).toThrow(/siteId/)
	})


	it('throws when installationUrl is empty', () => {
		// @ts-expect-error testing missing required option
		expect(() => matomo({ siteId: 1 })).toThrow(/installationUrl/)
		expect(() => matomo({ siteId: 1, installationUrl: null })).toThrow(/installationUrl/)
		expect(() => matomo({ siteId: 1, installationUrl: '' })).toThrow(/installationUrl/)
	})
})

describe('initialize', () => {
	it('pushes tracker url, site id and tracking setup to _paq', () => {
		setup()

		expect(window._paq).toEqual([
			['setTrackerUrl', '/matomo/matomo.php'],
			['setSiteId', 1],
			['enableLinkTracking'],
			['enableHeartBeatTimer'],
		])
	})

	it('honours an explicit trackerUrl', () => {
		setup({ ...baseOptions, trackerUrl: 'https://example.com/track' })

		expect(window._paq).toContainEqual(['setTrackerUrl', 'https://example.com/track'])
	})

	it('pushes requireConsent when configured', () => {
		setup({ ...baseOptions, requireConsent: true })

		expect(window._paq).toContainEqual(['requireConsent'])
	})

	it('pushes requireCookieConsent when configured', () => {
		setup({ ...baseOptions, requireCookieConsent: true })

		expect(window._paq).toContainEqual(['requireCookieConsent'])
	})

	it('does not push link tracking when disabled', () => {
		setup({ ...baseOptions, enableLinkTracking: false })

		expect(window._paq).not.toContainEqual(['enableLinkTracking'])
	})

	it('disables the heartbeat timer when false', () => {
		setup({ ...baseOptions, enableHeartBeatTimer: false })

		expect(window._paq.some((c) => Array.isArray(c) && c[0] === 'enableHeartBeatTimer')).toBe(false)
	})

	it('passes the active time to the heartbeat timer when a number', () => {
		setup({ ...baseOptions, enableHeartBeatTimer: 30 })

		expect(window._paq).toContainEqual(['enableHeartBeatTimer', 30])
	})

	it('pushes disableCookies when configured', () => {
		setup({ ...baseOptions, disableCookies: true })

		expect(window._paq).toContainEqual(['disableCookies'])
	})

	it('lets disableCookies win over cookie consent', () => {
		setup({ ...baseOptions, requireCookieConsent: true, disableCookies: true })

		const paq = window._paq as unknown[][]
		const consentIndex = paq.findIndex((c) => c[0] === 'requireCookieConsent')
		const disableIndex = paq.findIndex((c) => c[0] === 'disableCookies')
		expect(disableIndex).toBeGreaterThan(consentIndex)
	})

	it('pushes do-not-track, cookie and domain options when configured', () => {
		setup({
			...baseOptions,
			doNotTrack: true,
			cookieDomain: '*.example.com',
			secureCookie: true,
			cookieSameSite: 'Strict',
			domains: ['*.example.com'],
		})

		expect(window._paq).toContainEqual(['setDoNotTrack', true])
		expect(window._paq).toContainEqual(['setCookieDomain', '*.example.com'])
		expect(window._paq).toContainEqual(['setSecureCookie', true])
		expect(window._paq).toContainEqual(['setCookieSameSite', 'Strict'])
		expect(window._paq).toContainEqual(['setDomains', ['*.example.com']])
	})

	it('pushes cross-domain linking and performance opt-outs when configured', () => {
		setup({ ...baseOptions, enableCrossDomainLinking: true, disablePerformanceTracking: true })

		expect(window._paq).toContainEqual(['enableCrossDomainLinking'])
		expect(window._paq).toContainEqual(['disablePerformanceTracking'])
	})
})

describe('buildSetupCommands', () => {
	const resolved = (overrides: Partial<MatomoPluginConfig> = {}): MatomoPluginConfig => ({
		siteId: 1,
		installationUrl: '/matomo/',
		...overrides,
	})

	it('starts with tracker url and site id', () => {
		expect(buildSetupCommands(resolved())).toEqual([
			['setTrackerUrl', '/matomo/matomo.php'],
			['setSiteId', 1],
		])
	})

	it('derives tracker url from installationUrl, honours explicit trackerUrl', () => {
		expect(buildSetupCommands(resolved())[0]).toEqual(['setTrackerUrl', '/matomo/matomo.php'])
		expect(buildSetupCommands(resolved({ trackerUrl: 'https://x/track' }))[0]).toEqual([
			'setTrackerUrl',
			'https://x/track',
		])
	})

	it('orders consent before disableCookies', () => {
		const commands = buildSetupCommands(resolved({ requireCookieConsent: true, disableCookies: true }))
		const consent = commands.findIndex((c) => c[0] === 'requireCookieConsent')
		const disable = commands.findIndex((c) => c[0] === 'disableCookies')
		expect(disable).toBeGreaterThan(consent)
	})

	it('lets requireConsent win over requireCookieConsent', () => {
		const commands = buildSetupCommands(resolved({ requireConsent: true, requireCookieConsent: true }))
		expect(commands).toContainEqual(['requireConsent'])
		expect(commands).not.toContainEqual(['requireCookieConsent'])
	})

	it('encodes heartbeat as bare command, number, or omitted', () => {
		expect(buildSetupCommands(resolved({ enableHeartBeatTimer: true }))).toContainEqual(['enableHeartBeatTimer'])
		expect(buildSetupCommands(resolved({ enableHeartBeatTimer: 30 }))).toContainEqual(['enableHeartBeatTimer', 30])
		expect(
			buildSetupCommands(resolved({ enableHeartBeatTimer: false })).some((c) => c[0] === 'enableHeartBeatTimer')
		).toBe(false)
	})
})

describe('injectScript', () => {
	it('inserts an async script with the given src and fires onLoad', () => {
		let loaded = false
		injectScript('/matomo/matomo.js', () => (loaded = true))

		const script = document.querySelector('script[src="/matomo/matomo.js"]') as HTMLScriptElement
		expect(script).not.toBeNull()
		expect(script.async).toBe(true)

		script.dispatchEvent(new Event('load'))
		expect(loaded).toBe(true)
	})
})

describe('page', () => {
	it('pushes title, url and trackPageView', () => {
		const plugin = setup()
		window._paq = []

		plugin.page?.({ payload: { properties: { title: 'Home', url: 'https://example.com/' } } })

		expect(window._paq).toEqual([
			['setDocumentTitle', 'Home'],
			['setCustomUrl', 'https://example.com/'],
			['trackPageView'],
		])
	})
})

describe('track', () => {
	it('pushes a trackEvent array', () => {
		const plugin = setup()
		window._paq = []

		plugin.track?.({
			payload: {
				event: 'signup',
				properties: { category: 'auth', name: 'cta', value: 42 },
			},
		})

		expect(window._paq).toEqual([['trackEvent', 'auth', 'signup', 'cta', 42]])
	})
})

describe('identify', () => {
	it('pushes setUserId when a userId is given', () => {
		const plugin = setup()
		window._paq = []

		plugin.identify?.({ payload: { userId: 'user-1' } })

		expect(window._paq).toEqual([['setUserId', 'user-1']])
	})

	it('pushes resetUserId when no userId is given', () => {
		const plugin = setup()
		window._paq = []

		plugin.identify?.({ payload: {} })

		expect(window._paq).toEqual([['resetUserId']])
	})
})

describe('methods', () => {
	it('paq forwards arbitrary commands to _paq', () => {
		const plugin = setup()
		window._paq = []

		plugin.paq(['setCustomDimension', 1, 'value'])

		expect(window._paq).toEqual([['setCustomDimension', 1, 'value']])
	})

	it('updateConsent pushes consent-given/forgotten for requireConsent', () => {
		const plugin = setup({ ...baseOptions, requireConsent: true })
		window._paq = []

		plugin.updateConsent(true)
		plugin.updateConsent(false)

		expect(window._paq).toEqual([['rememberConsentGiven'], ['forgetConsentGiven']])
	})

	it('updateConsent pushes cookie-consent for requireCookieConsent', () => {
		const plugin = setup({ ...baseOptions, requireCookieConsent: true })
		window._paq = []

		plugin.updateConsent(true)
		plugin.updateConsent(false)

		expect(window._paq).toEqual([['rememberCookieConsentGiven'], ['forgetCookieConsentGiven']])
	})
})
