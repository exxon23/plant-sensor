const { searchPlant } = require('../../../services/plants')

async function routes (fastify, options) {
  fastify.route({
    method: 'GET',
    url: '/plants',
    tags: ['plants'],
    schema: {
      query: {
        name: { type: 'string' }
      }
    },
    handler: async (request, reply) => {
      try {
        const name = request.query.name
        const result = await searchPlant({ name })
        return reply.send(result)
      } catch (err) {
        if (err.isBoom) return reply.code(err.response.code).send(err.message)
        return reply.code(500).send(err.message)
      }
    }
  })
}

module.exports = routes
