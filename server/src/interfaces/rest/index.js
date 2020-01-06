module.exports = (fastify) => {
  // import routes
  fastify.register(require('./controllers/measure'))
  fastify.register(require('./controllers/processedData'))
}
