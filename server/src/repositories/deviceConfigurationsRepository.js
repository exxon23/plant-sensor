const DeviceConfiguration = require('../model/mongoDB/models/DeviceConfiguration')

const saveDeviceConfiguration = (configuration) =>
  new DeviceConfiguration(configuration).save()

const getDeviceConfiguration = (configuration) => {
  return DeviceConfiguration.findOne(configuration)
}

module.exports = {
  saveDeviceConfiguration,
  getDeviceConfiguration
}
