const Boom = require('boom')

const sensorsRepository = require('../repositories/sensorsRepository')
const devicesRepository = require('../repositories/devicesRepository')
const deviceConfigurationsRepository = require('../repositories/deviceConfigurationsRepository')
const plantsRepository = require('../repositories/plantsRepository')

const getDevices = async (deviceParameters) => {
  const devices = await devicesRepository.getMany(deviceParameters)

  for (const device of devices) {
    if (device._doc.metadata && device._doc.metadata.plant) {
      const plant = await plantsRepository.getOne(device._doc.metadata.plant)
      device.plant = plant
    }
  }

  return devices.map(device => {
    if (device._doc.metadata && device._doc.metadata.plant) delete device._doc.metadata.plant
    if (!device._doc.metadata || device._doc.metadata.plant) return undefined

    return {
      id: device._doc._id,
      name: device._doc.name,
      active: device._doc.active,
      plant: device.plant ? {
        id: device.plant._id,
        displayName: device.plant._doc.displayName,
        image: device.plant._doc.image,
        category: device.plant._doc.category,
        temperature: device.plant._doc.temperature,
        humidity: device.plant._doc.humidity,
        lightIntensity: device.plant._doc.lightIntensity,
        soilMoisture: device.plant._doc.soilMoisture,
        notes: device.plant._doc.notes.map(note => ({
          item: note._doc.item,
          description: note._doc.description
        }))
      } : null,
      metadata: device._doc.metadata || null
    }
  }).filter(Boolean)
}

const getDevice = async (deviceParameters) => {
  const { id } = deviceParameters
  const device = await devicesRepository.getOne(id)
  const configuration = await deviceConfigurationsRepository.getOne(device.configuration._id)
  const sensors = await Promise.all(configuration.sensors.map(sensor => sensorsRepository.getOne(sensor)))

  return {
    id: device._doc._id,
    name: device._doc.name,
    active: device._doc.active,
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
  const { id, plant, ...deviceParams } = device
  const deviceFromDb = await await devicesRepository.getOne(id)

  if (!deviceFromDb) {
    throw Boom.notFound(`Device with id ${id} not found`)
  }

  if (plant) {
    const plantExist = await plantsRepository.getOne(plant)
    if (!plantExist) throw Boom.notFound(`Plant with id ${id} not found`)
    deviceParams.metadata = { ...deviceFromDb._doc.metadata, plant }
  }

  // TODO: if update user -> check if user exist
  await devicesRepository.update({ id, ...deviceParams })
}

module.exports = {
  updateDevice,
  getDevices,
  getDevice
}
