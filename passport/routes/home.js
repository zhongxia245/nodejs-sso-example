'use strict'

const express = require('express')
const { getDecAse192, getEncAse192, getSha1 } = require('../utils/crypto')
const { secret } = require('../config')
const router = express.Router()

router.get('/', (req, res) => {
  let user = null
  if (req.cookies.token) {
    user = getDecAse192(req.cookies.token, secret)
  }
  res.render('index', { user: user })
})

module.exports = router
