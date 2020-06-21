const { updateDevice, getDevice, getDevices } = require('../../../services/devices')
const { authBearer } = require('../../../utils/auth')

async function routes (fastify, options) {
  // fastify.register(require('fastify-bearer-auth'), {
  //   auth: async (token, req) => {
  //     return await authBearer(fastify, token, req)
  //   }
  // })

  fastify.route({
    method: 'GET',
    url: '/devices',
    tags: ['devices', 'api'],
    handler: async (request, reply) => {
      try {
        const devices = await getDevices()
        return reply.send(devices)
      } catch (err) {
        if (err.isBoom) return reply.code(err.response.code).send(err.message)
        return reply.code(500).send(err.message)
      }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/devices/:id',
    tags: ['devices'],
    schema: {
      params: {
        id: { type: 'string' }
      }
    },
    handler: async (request, reply) => {
      try {
        const device = await getDevice(request.params)
        return reply.send(device)
      } catch (err) {
        if (err.isBoom) return reply.code(err.response.code).send(err.message)
        return reply.code(500).send(err.message)
      }
    }
  })

  fastify.route({
    method: 'PATCH',
    url: '/devices/:id',
    tags: ['devices'],
    schema: {
      body: {
        type: 'object',
        properties: {
          user: { type: 'string' },
          name: { type: 'string' },
          active: { type: 'boolean' },
          plant: { type: 'string' }
          // address: { type: 'object'}
        },
        required: ['name', 'active', 'plant']

      }
    },
    handler: async (request, reply) => {
      try {
        const deviceId = request.params.id
        const deviceParams = request.body
        await updateDevice({ id: deviceId, ...deviceParams })

        return reply.send({
          message: 'Device successfully updated',
          deviceId
        })
      } catch (err) {
        if (err.isBoom) return reply.code(err.response.code).send(err.message)
        return reply.code(500).send(err.message)
      }
    }
  })
}

module.exports = routes
