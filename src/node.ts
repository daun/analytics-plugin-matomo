/**
 * Node side
 */

const config = {}

const name = 'matomo'

const logMessage = () => {
  console.log(`${name} tracking is not available in node.js yet. Todo implement https://github.com/matomo-org/matomo-nodejs-tracker`)
}

/* Export the integration */
function matomoPlugin(userConfig = {}) {
  // Allow for userland overides of base methods
  return {
    name,
    config: {
      ...config,
      ...userConfig
    },
    initialize: ({ config }) => {
      logMessage()
    },
    // page view
    page: ({ payload, config }) => {
      logMessage()
    },
    // track event
    track: ({ payload, config }) => {
      logMessage()
    },
    // identify user
    identify: ({ payload }) => {
      logMessage()
    }
  }
}

export default matomoPlugin
