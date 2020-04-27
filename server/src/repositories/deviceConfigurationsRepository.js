const DeviceConfiguration = require('../model/mongoDB/models/DeviceConfiguration')

const save = (configuration) =>
  new DeviceConfiguration(configuration).save()

const getOne = (configuration) => {
  return DeviceConfiguration.findOne(configuration)
}

module.exports = {
  save,
  getOne
}
