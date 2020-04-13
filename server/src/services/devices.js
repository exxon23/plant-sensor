const devicesRepository = require('../repositories/devicesRepository')
const deviceConfigurationsRepository = require('../repositories/deviceConfigurationsRepository')
const sensorsRepository = require('../repositories/sensorsRepository')

const updateDevice = async (device) => {
  // TODO: handle device not exist
  await devicesRepository.updateDevice(device)
  return {
    message: 'Measured data successfully saved',
    measureId: device.id
  }
}

const getDevices = async (deviceParameters) => {
  const devices = await devicesRepository.getDevices(deviceParameters)
  return devices
}

const getDevice = async (deviceParameters) => {
  const { id } = deviceParameters
  const device = await devicesRepository.getDevice(id)
  const configuration = await deviceConfigurationsRepository.getDeviceConfiguration({ id: device.configuration }) // TODO: test
  const sensors = await Promise.all(configuration.sensors.map(sensor => sensorsRepository.getSensor(sensor)))
  return { ...device._doc, configuration: configuration._doc, sensors: sensors.map(sensor => sensor._doc) }
}

module.exports = {
  updateDevice,
  getDevices,
  getDevice
}
