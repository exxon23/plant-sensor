const { updateDevice, getDevice, getDevices } = require('../../../services/devices')

async function routes (fastify, options) {
  fastify.route({
    method: 'PUT',
    url: '/devices/:id',
    tags: ['devices'],
    schema: {
      body: {
        type: 'object',
        properties: {
          user: { type: 'string' },
          name: { type: 'string' },
          active: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await updateDevice(request.body)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/devices',
    tags: ['measure'],
    schema: {
      query: {
        user: { type: 'string' },
        name: { type: 'string' },
        active: { type: 'boolean' }
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await getDevices(request.query)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/devices/:id',
    tags: ['measure'],
    schema: {
      params: {
        id: { type: 'string' }
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await getDevice(request.params)
        return reply.send(result)
      } catch (err) {
        return reply.send(err)
      }
    }
  })
}

module.exports = routes
