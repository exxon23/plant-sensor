const Boom = require('boom')

const sensorsRepository = require('../repositories/sensorsRepository')
const devicesRepository = require('../repositories/devicesRepository')
const deviceConfigurationsRepository = require('../repositories/deviceConfigurationsRepository')

const getDevices = async (deviceParameters) => {
  const devices = await devicesRepository.getMany(deviceParameters)

  return devices.map(device => ({
    id: device._doc._id,
    name: device._doc.name,
    active: device._doc.active,
    metadata: device._doc.metadata
  }))
}

const getDevice = async (deviceParameters) => {
  const { id } = deviceParameters
  const device = await devicesRepository.getOne(id)
  const configuration = await deviceConfigurationsRepository.getOne(device.configuration._id)
  const sensors = await Promise.all(configuration.sensors.map(sensor => sensorsRepository.getOne(sensor)))

  return {
    id: device._doc._id,
    userId: device._doc.user,
    active: device._doc.active,
    name: device._doc.name,
    metadata: device._doc.metadata,
    configuration: {
      id: configuration._doc._id,
      version: configuration._doc.version,
      type: configuration._doc.type,
      settings: configuration._doc.settings,
      sensors: sensors.map(sensor => ({
        id: sensor._doc._id,
        name: sensor._doc.name
      }))
    }
  }
}

const updateDevice = async (device) => {
  const { id, ...deviceParams } = device

  if (!await devicesRepository.getOne(id)) {
    throw Boom.notFound(`Device with id ${id} not found`)
  }

  // TODO: if update user -> check if user exist
  await devicesRepository.update({ id, ...deviceParams })
}

module.exports = {
  updateDevice,
  getDevices,
  getDevice
}
