const AWS = require('aws-sdk')
require('aws-sdk/lib/maintenance_mode_message').suppress = true
const multerS3 = require('multer-s3')
const path = require('path')
const config = require('config')
const multer = require('multer')

// set env vars
const accessKeyId = config.get('AWSAccessKeyId')
const secretAccessKey = config.get('AWSSecretKey')
const region = config.get('AWS_S3_BUCKET_REGION')

// Instance of AWS
const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region,
})

const MAX_FILE_LENGTH = config.get('max_file_length')

const storage = (bucketname) => {
  return multerS3({
    s3,
    bucket: bucketname,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
    },
  })
}

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/
  const mimetype = fileTypes.test(file.mimetype)
  const ext = fileTypes.test(path.extname(file.originalname).toLowerCase())

  if (file.size > 512 * 1024 * 5) {
    //5MB
    // 512KB
    cb(new Error('File too large'), false)
  } else {
    if (req.files && req.files.length > MAX_FILE_LENGTH) {
      cb(new Error(`Cannot upload more than ${MAX_FILE_LENGTH} files`), false)
    } else if (ext && mimetype) {
      cb(null, true)
    } else {
      cb(new Error(`does not support ${file.mimetype}`), false)
    }
  }
}

const limits = {
  fileSize: 512 * 1024 * 1024 * 5, //512KB of 3 files: will change it to 3
}

const upload = (bucketname) =>
  multer({
    fileFilter,
    storage: storage(bucketname),
    limits,
  })

module.exports = upload
