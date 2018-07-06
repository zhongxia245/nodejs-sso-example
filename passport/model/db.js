'use strict'

/**
 * 返回 mongoose 的实例
 */
const mongoose = require('mongoose')
const config = require('../config')

mongoose.connect(config.mongoose.url)

module.exports = mongoose
