const fastify = require('fastify')({ logger: require('./config/logger') })
const { PORT } = require('./config/config')
const initRest = require('./src/interfaces/rest')
const connectMongoose = require('./config/mongoose')

// run data processer worker
require('./data_processer')

fastify.register(require('fastify-cors'))
initRest(fastify)

;(async () => {
  try {
    await connectMongoose()
    await fastify.listen(PORT, '0.0.0.0')
    fastify.log.info(`Server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})()
