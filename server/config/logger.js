const { NODE_ENV } = require('./config')

module.exports = {
  prettyPrint: NODE_ENV === 'development',
  serializers: {
    res: function (res) {
      return {
        statusCode: res.statusCode
      }
    },
    req: function (req) {
      return {
        method: req.method,
        url: req.url
        // path: req.path,
        // parameters: req.parameters,
        // headers: req.headers
      }
    }
  }
}
