//all global helpers go here
const ep = require('./endpoints')

const doSetForwardslash = (...endpoints) => {
  if (endpoints.length === 1) return ep.FORWARDSLASH + endpoints[0]

  return ep.FORWARDSLASH + endpoints.join(ep.FORWARDSLASH)
}

module.exports = {
  doSetForwardslash,
}
