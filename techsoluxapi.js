require('colors')
const express = require('express')
const app = express()
const port = process.env.PORT || 2525 //config.get('port')
const env = process.env.NODE_ENV || 'development'

require('./startup/db')()
require('./startup/config')()
require('./startup/routes')(app)
const server = app.listen(port, () => {
  console.log(
    `Example app listening on port ${port} in ${env} mode...`.yellow.underline
      .bold
  )
})

module.exports = server // Export server for testing purposes.
