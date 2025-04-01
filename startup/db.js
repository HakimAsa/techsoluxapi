require('colors')
const mongoose = require('mongoose')
// const winston = require('winston');
const config = require('config')

module.exports = function () {
  const db = config.get('db')
  mongoose
    .connect(db, { autoIndex: false }) // auto for unique fileds
    .then(() => console.info(`connected to ${db}...`.cyan.underline.bold))
    .catch((err) => console.log(err.message.red.underline.bold))
}
