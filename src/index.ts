import browserModule from './browser.js'
import nodeModule from './node.js'

/* This module will shake out unused code and work in browser and node 🎉 */
export default process.browser ? browserModule : nodeModule
