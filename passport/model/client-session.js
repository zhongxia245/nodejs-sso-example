'use strict'
/**
 * 存放子系统的 ticket 和对应的 sessionid
 * 单点注销的时候，需要删除子系统的 session， 因此需要把 session 对应的 sessionid 传回去
 */
const mongoose = require('./db')

const ClientSession = mongoose.model('ClientSession', {
  app_id: String, // 子系统的编号
  logout_url: String, // 子系统注销域名
  ticket: String, // 发给子系统的令牌
  session_id: String, // 子系统的 sessionid
  remark: String // 备注
})

module.exports = ClientSession
