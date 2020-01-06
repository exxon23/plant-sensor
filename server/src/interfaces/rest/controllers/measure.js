const { saveMeasure, getMeasures } = require('../../../services/measures')

async function routes (fastify, options) {
  fastify.route({
    method: 'POST',
    url: '/measure',
    tags: ['measure'],
    schema: {
      body: {
        type: 'object',
        properties: {
          device: { type: 'string' },
          data: {
            type: 'array',
            items: { type: 'object', properties: { measure: { type: 'string' }, value: { type: 'number' } }, required: ['measure', 'value'] }
          }
        },
        required: ['data', 'device']
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await saveMeasure(request.body)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/measure',
    tags: ['measure'],
    schema: {
      query: {
        device: { type: 'string' },
        processed: { type: 'boolean' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' }
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await getMeasures(request.query)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })

  fastify.route({
    method: 'DELETE',
    url: '/measure/:id',
    tags: ['measure'],
    schema: {
      params: {
        id: { type: 'string' }
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await getMeasures(request.params)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })
}

module.exports = routes
