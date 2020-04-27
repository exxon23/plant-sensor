const fastify = require('fastify')({ logger: require('./config/logger') })
const { PORT, RUN_WORKERS } = require('./config/config')
const initRest = require('./src/interfaces/rest')
const connectMongoose = require('./config/mongoose')

if (RUN_WORKERS) {
  // run data processer worker
  require('./workers/dataProcesser')
  require('./workers/plantSensors/statusMonitor')
  require('./workers/plantSensors/wateringMonitor')
}

fastify.register(require('fastify-cors'))
fastify.register(require('fastify-swagger'), require('./config/swagger'))

initRest(fastify)

fastify.ready(err => {
  if (err) throw err
  fastify.swagger()
})

fastify.register(require('fastify-boom'))

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
