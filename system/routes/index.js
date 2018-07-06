'use strict'

const express = require('express')
const router = express.Router()

router.get('/', function(req, res, next) {
  let system = process.env.SERVER_NAME
  let user = req.session.user
  res.render('index', {
    user: user,
    system: system
  })
})

// 子系统注销接口，清除 session
// 这里应该从 SSO 接收到用户的 token
router.get('/logout', async (req, res, next) => {
  let sid = req.query.sessionId
  await req.app.store.destroy(sid)
  // 这里应该根据 sessionid，去清除数据库的 session
  res.send(`注销系统${process.env.SERVER_NAME}成功`)
})

module.exports = router
