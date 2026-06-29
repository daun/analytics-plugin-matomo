/* global window, document */
import { beforeEach, describe, expect, it } from 'vitest'
import matomo from '../src/browser.js'
import type { MatomoPluginConfig } from '../src/types.js'

const baseOptions: MatomoPluginConfig = {
	siteId: 1,
	installationUrl: '/matomo/',
}

/**
 * Build an initialized plugin instance. The plugin wires its internal `push`
 * to `window._paq` during `initialize`, so resetting that array gives us a
 * clean spy on every value the plugin sends to Matomo.
 */
function setup(options: MatomoPluginConfig = baseOptions) {
	const plugin = matomo(options)
	plugin.initialize?.({ config: plugin.config })
	return plugin
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

		plugin.methods?.paq(['setCustomDimension', 1, 'value'])

		expect(window._paq).toEqual([['setCustomDimension', 1, 'value']])
	})

	it('updateConsent pushes consent-given/forgotten for requireConsent', () => {
		const plugin = setup({ ...baseOptions, requireConsent: true })
		window._paq = []

		plugin.methods?.updateConsent(true)
		plugin.methods?.updateConsent(false)

		expect(window._paq).toEqual([['rememberConsentGiven'], ['forgetConsentGiven']])
	})

	it('updateConsent pushes cookie-consent for requireCookieConsent', () => {
		const plugin = setup({ ...baseOptions, requireCookieConsent: true })
		window._paq = []

		plugin.methods?.updateConsent(true)
		plugin.methods?.updateConsent(false)

		expect(window._paq).toEqual([['rememberCookieConsentGiven'], ['forgetCookieConsentGiven']])
	})
})
