'use strict'

const express = require('express')
const request = require('request')
const service = require('../service')
const { getEncAse192 } = require('../utils/crypto')
const { secret } = require('../config')
const ClientSession = require('../model/client-session')

const router = express.Router()

router.get('/', (req, res) => {
  let token = req.cookies.token
  /*
   * 如果 token 存在，说明登陆过，检查 token 是否合法。合法则重定向到原页面，并将 token 作为参数传递。
   * 原页面对应的系统在收到带有 token 的请求后，应该向 passport 发起请求检查 token 的合法性。
   *
   * 如果 cookie 中 token 不存在或者不合法，则返回登录页面。这里登录页面由 passport 提供，也可以重定向到原系统的登录页面。
   */
  if (token && service.isTokenValid(token)) {
    let redirectUrl = req.query.redirectUrl
    if (redirectUrl) {
      res.redirect(`http://${redirectUrl}?token=${token}`)
    } else {
      // TODO 如果不含有重定向页面，可以返回系统首页。这里直接返回一个登录成功的信息。
      res.redirect('/')
    }
  } else {
    res.render('login')
  }
})

router.post('/', (req, res) => {
  let body = req.body
  let name = body.name
  let password = body.password

  // FIXME 密码验证
  if (
    (name === 'test' && password === '123456') ||
    (name === 'test1' && password === '123456')
  ) {
    // TODO token 应该按照一定的规则生成，并持久化。
    let token = getEncAse192(name, secret)
    global.token = token
    res.cookie('token', token, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true
    })
    if (req.query.redirectUrl) {
      res.redirect('http://' + req.query.redirectUrl + '?token=' + token)
    } else {
      res.redirect('/')
    }
  } else {
    res.send({
      error: 1,
      msg: '用户名或密码错误'
    })
  }
})

// SSO注销
router.get('/logout', async (req, res) => {
  let token = req.cookies.token
  let data = await ClientSession.find({ ticket: token })
  // 通知子系统清除本地session, 清除sessioin 需要传指定的 sessionId
  // 否则无法识别出要注销用户的 session
  for (let i = 0; i < data.length; i++) {
    const client = data[i]
    let url = `${client['logout_url']}?sessionId=${client['session_id']}`
    await request(url)
  }
  // 清除已退出子系统 token 对应的 sessioinid
  await ClientSession.deleteMany({ ticket: token })
  res.clearCookie('token')

  console.log(req)

  // 有回调地址就跳过去，否则就调到登录页面
  if (req.headers.referer) {
    res.redirect(req.headers.referer)
  } else {
    res.redirect('/login')
  }
})

module.exports = router
