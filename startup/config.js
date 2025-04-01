const config = require('config')
module.exports = function () {
  //db check
  if (!config.get('db')) {
    throw new Error('FATAL ERROR: db must be defined.')
  }

  // JWT check
  if (
    !config.get('jwtPrivateKey') ||
    !config.get('jwtExpiresIn') ||
    !config.get('jwtCookieExpire')
  ) {
    throw new Error(
      'FATAL ERROR: jwtPrivateKey, jwtExpiresIn and jwtCookieExpire must be defined.'
    )
  }
}
