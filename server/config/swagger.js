const { PROTOCOL } = require('./config')

module.exports = {

  routePrefix: '/documentation',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'IPEX logging API',
      description: 'Documentation for IPEX logging API',
      version: require('../package.json').version
    },
    schemes: [PROTOCOL],
    consumes: ['application/json'],
    produces: ['application/json']
    // securityDefinitions: {
    //   apiKey: {
    //     type: 'apiKey',
    //     name: 'apiKey',
    //     in: 'header'
    //   }
    // }
  }

}
