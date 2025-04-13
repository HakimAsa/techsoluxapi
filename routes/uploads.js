const express = require('express')
const path = require('path')
const config = require('config')

const auth = require('../middleware/auth.js')
const upload = require('../utils/upload.js')

const {
  uploadFile,
  uploadFiles,
} = require('../controllers/upload.controllers.js')

const router = express.Router()

const folder = config.get('AWS_S3_BUCKET') //path.join(__dirname, '../public/uploads/');
router.route('/upload').post(auth, uploadFile)

router.route('/uploads').post(auth, uploadFiles)

module.exports = router
