const config = require('config')
module.exports = function () {
  //db check
  if (!config.get('db')) {
    throw new Error('FATAL ERROR: db must be defined.')
  }
}
