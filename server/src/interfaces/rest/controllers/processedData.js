const { saveProcessedData, getProcessedData } = require('../../../services/processedData')

async function routes (fastify, options) {
  fastify.route({
    method: 'POST',
    url: '/processed-data',
    tags: ['processed-data'],
    schema: {
      body: {
        type: 'object',
        properties: {
          device: { type: 'string' },
          measure: { type: 'string' },
          data: {
            type: 'array',
            items: { type: 'object', properties: { measure: { type: 'string' }, value: { type: 'number' } }, required: ['measure', 'value'] }
          }
        },
        required: ['data', 'device', 'measure']
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await saveProcessedData(request.body)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/processed-data',
    tags: ['processed-data'],
    schema: {
      query: {
        type: 'object',
        properties: {
          device: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' }
        },
        required: ['device']
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await getProcessedData(request.query)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })
}

module.exports = routes
