const DeviceConfiguration = require('../model/mongoDB/models/DeviceConfiguration')

const saveDeviceConfiguration = (deviceConfiguration) =>
  new DeviceConfiguration(deviceConfiguration).save()

const getDeviceConfiguration = (deviceConfigurationId) => {
  return DeviceConfiguration.findById(deviceConfigurationId)
}

module.exports = {
  saveDeviceConfiguration,
  getDeviceConfiguration
}
