/**
 * 拦截是否登录
 */
const request = require('request')

const SSO_URL = 'http://passport.com:8080'

const getSSOLoginUrl = req => {
  return `${SSO_URL}/login?redirectUrl=${req.headers.host}`
}

module.exports = (req, res, next) => {
  if (req.originalUrl.indexOf('/logout') !== -1) {
    console.log('注销接口， 跳过,不拦截')
    next()
  } else if (!req.session.user) {
    /*
     * 如果 session 中没有用户信息，则需要去 passport 系统进行身份认证。这里区分两种情况：
     *
     * 1. 如果 url 中带有 token 信息，则去 passport 中认证 token 的有效性，如果有效则说明登录成功，建立 session 开始通话。
     * 2. 如果 url 中没有 token 信息，则取 passport 进行登录。如果登录成功，passport 会将浏览器重定向到此系统并在 url 上附带 token 信息。进行步骤 1。
     *
     * 因为 token 很容易伪造，所以需要去检验 token 的真伪，否则任何一个带有 token 的请求岂不是都可以通过认证。
     */
    let token = req.query.token
    let ssoLoginUrl = getSSOLoginUrl(req)
    if (!token) {
      console.log('没有 token，去SSO 登录')
      res.redirect(ssoLoginUrl)
      return
    } else {
      request(
        `${SSO_URL}/check_token?token=${token}&sessionId=${
          req.sessionID
        }&logoutUrl=http://${
          req.headers.host
        }/logout&appId=a&t=${new Date().getTime()}`,
        (error, response, data) => {
          if (!error && response.statusCode === 200) {
            data = JSON.parse(data)

            if (data.error === 0) {
              // TODO 这里的 userId 信息应该是经过加密的，加密算法要么内嵌，要么从 passport 获取。这里为了操作简单，直接使用明文。
              let userId = data.userId
              if (!userId) {
                console.log('没有返回用户 id，去登录')
                res.redirect(ssoLoginUrl)
                return
              }

              /*
               * TODO
               * 获取 userId 后，可以操作数据库获取用户的详细信息，用户名、权限等；这里也可以由 passport 直接返回 user 信息，主要看用户信息
               * 的数据库如何部署。
               * 为了方便，直接操作 userId，省略用户数据库操作。
               */
              console.log('设置 session')
              req.session.user = userId
              res.redirect(`http://${req.headers.host}`)
            } else {
              // token 验证失败，重新去 passport 登录。
              res.redirect(ssoLoginUrl)
              return
            }
          } else {
            res.redirect(ssoLoginUrl)
            return
          }
        }
      )
    }
  } else {
    console.log(`session： ${req.session.user},${req.sessionID}`)
    next()
  }
}
