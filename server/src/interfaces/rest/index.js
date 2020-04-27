module.exports = (fastify) => {
  // import routes
  fastify.register(require('./controllers/measure'))
  fastify.register(require('./controllers/devices'))
  fastify.register(require('./controllers/plants'))
  fastify.register(require('./controllers/data'))
}
