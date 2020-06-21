const jwt = require('jsonwebtoken')

const signJwtToken = (jwtTokenPayload) =>
  jwt.sign(jwtTokenPayload, process.env.JWT_KEY, {
    expiresIn: '1h'
  })

const refreshJwtToken = async (oldToken) => {
  const payload = await jwt.verify(oldToken, process.env.JWT_KEY)
  delete payload.iat
  delete payload.exp
  delete payload.nbf
  delete payload.jti
  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' })
}

const parseJwtToken = async (token) => {
  const payload = await jwt.verify(token, process.env.JWT_KEY)
  return payload
}

const authBearer = async (fastify, token, req) => {
  try {
    const payload = await parseJwtToken(token)
    if (payload) {
      req.user = payload
      return true
    }
  } catch (error) {
    return false
  }
}

module.exports = {
  signJwtToken,
  refreshJwtToken,
  parseJwtToken,
  authBearer
}
