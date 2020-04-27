const { saveMeasure } = require('../../../services/measures')

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
        const measure = request.body
        const measureId = await saveMeasure(measure)

        return reply.send({
          message: 'Measured data successfully saved',
          measureId
        })
      } catch (err) {
        if (err.isBoom) return reply.code(err.response.code).send(err.message)
        return reply.code(500).send(err.message)
      }
    }
  })
}

module.exports = routes
