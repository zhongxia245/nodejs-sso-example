'use strict'

const express = require('express')
const service = require('../service')
const { getDecAse192 } = require('../utils/crypto')
const { secret } = require('../config')
const ClientSession = require('../model/client-session')

const router = express.Router()

router.get('/', async (req, res, next) => {
  let token = req.query.token
  let sessionId = req.query.sessionId
  let logoutUrl = req.query.logoutUrl
  let appId = req.query.appId
  let result = {
    error: 1 //登录失败
  }
  let isExist = await service.isTokenValid(token)
  if (isExist) {
    /**
     * 需要保存子系统的 sessionid
     * 当 SSO 注销的时候，通知子系统清除本地凭证的时候需要用到
     * 因为 http 请求是无状态的，因此需要传一个 sessionId 过去，才能识别出要退出用户的 session
     */
    let clientSession = new ClientSession({
      app_id: appId,
      logout_url: logoutUrl,
      ticket: token,
      session_id: sessionId
    })
    await clientSession.save()
    
    result.error = 0
    // 用户 id，从 token 中解密获取到
    result.userId = getDecAse192(token, secret)
  }
  res.json(result)
})

module.exports = router
