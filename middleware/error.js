// will look into winston
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - Route ${req.originalUrl} does not exist`)

  console.error(error.message, error)
  res.status(404)
  next(error)
}

const error = function (err, req, res, next) {
  // Log exception
  console.error(err.message, err)

  // errors level
  // 1. error
  // 2. warn
  // 3. info
  // 4. verbose
  // 5. debug
  // 6. silly
  res.status(500).send({
    success: false,
    code: err.code,
    errorMessage: 'Something failed... ' + err.message,
  })
  next()
  return
}

module.exports = { notFound, error }
