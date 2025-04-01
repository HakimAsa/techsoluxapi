require('colors')
const express = require('express')
const app = express()
const port = process.env.PORT || 2525 //config.get('port')
const env = process.env.NODE_ENV || 'development'

app.get('/', (req, res) => {
  res.send('Hello Tech Solux E-commerce API!')
})

app.listen(port, () => {
  console.log(
    `Example app listening on port ${port} in ${env} mode...`.yellow.underline
      .bold
  )
})
