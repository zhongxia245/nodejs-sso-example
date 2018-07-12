'use strict'

/**
 * 返回 mongoose 的实例
 */
const mongoose = require('mongoose')
const config = require('../config')

mongoose.connect(
  config.mongoose.url,
  { useNewUrlParser: true },
  err => {
    if (err) {
      console.log('Connection Error:' + err)
    } else {
      console.log('Connection success!')
    }
  }
)

module.exports = mongoose
