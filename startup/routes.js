const express = require('express')
const mongoSanitize = require('@exortek/express-mongo-sanitize')
const path = require('path')

const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const { xss } = require('express-xss-sanitizer')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')

//relative paths
const { error, notFound } = require('../middleware/error')
const auth = require('../routes/auth.routes')
const files = require('../routes/uploads')
const products = require('../routes/product.routes')
// const payments = require('../routes/payments')
// const users = require('../routes/users')

module.exports = function (app) {
  app.use(express.json())
  app.use(
    express.urlencoded({
      extended: true,
    })
  )
  //Sanitize data
  //   app.use(mongoSanitize({ app: app }))

  // Prevent XSS attacks
  //   app.use(xss())

  // Enable trust proxy
  app.set('trust proxy', 'loopback, linklocal, uniquelocal')
  app.get('/ip', (request, response) => response.send(request.ip))
  app.get('/x-forwarded-for', (request, response) =>
    response.send(request.headers['x-forwarded-for'])
  )

  // Enable CORS
  app.use(cors())

  // secure headers
  app.use(helmet({ crossOriginEmbedderPolicy: false }))

  app.use(cookieParser())

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 min
    max: 50, // 50 requests can be made in 10 min
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers,
    message: 'Too many requests, please try again later.',
  })

  app.use(limiter)

  // Prevent http param polution
  app.use(hpp())

  app.use(express.static(path.join(__dirname, 'build')))

  // app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, '../public')))

  // app.use('/api/v1/userImages', express.static('api/userImages')); //todo
  app.use('/api/v1/auth', auth)
  app.use('/api/v1/files', files)
  app.use('/api/v1/products', products)
  //   app.use('/api/v1/payments', payments)
  //   app.use('/api/v1/users', users)

  //   app.use("/api/v1/users", users);

  app.get('/api/v1', (req, res) => {
    res.json({ message: 'Welcome to Tech-Solux API version 1' })
  })

  app.get('/', (req, res) => {
    res.send('Hello  Tech-Solux!')
  })

  app.get('/favicon.ico', (req, res) => {
    res.send('favicon.icon')
  })

  app.get('{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })

  //global error middleware
  app.use(notFound)
  app.use(error)
}
