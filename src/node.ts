import type { AnalyticsPlugin } from 'analytics'
import type { MatomoPluginConfig } from './types.js'

export type { MatomoPluginConfig } from './types.js'

const name = 'matomo'

const logMessage = () => {
  console.log(`${name} tracking is not available in node.js yet. Todo implement https://github.com/matomo-org/matomo-nodejs-tracker`)
}

export default function matomoPlugin(config: Partial<MatomoPluginConfig> = {}): AnalyticsPlugin {
  return {
    name,
    config: { ...config },
    initialize: () => logMessage(),
    page: () => logMessage(),
    track: () => logMessage(),
    identify: () => logMessage()
  }
}
