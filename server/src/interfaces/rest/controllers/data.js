const moment = require('moment')

const { getProcessedData } = require('../../../services/data')

async function routes (fastify, options) {
  fastify.route({
    method: 'GET',
    url: '/devices/:id/data',
    tags: ['data'],
    schema: {
      params: {
        id: { type: 'string' }
      },
      query: {
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' }
      }
    },
    handler: async (request, reply) => {
      try {
        const deviceId = request.params.id
        const { startTime = moment().subtract(1, 'day').toISOString(), endTime = moment().toISOString() } = request.query
        const result = await getProcessedData({ deviceId, startTime, endTime })

        return reply.send(result)
      } catch (err) {
        if (err.isBoom) return reply.code(err.response.code).send(err.message)
        return reply.code(500).send(err.message)
      }
    }
  })
}

module.exports = routes
