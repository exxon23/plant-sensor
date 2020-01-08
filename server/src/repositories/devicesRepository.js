const Device = require('../model/mongoDB/models/Device')

const saveDevice = (device) =>
  new Device(device).save()

const getDevices = (device) => {
  return Device.find(device)
}

const getDevice = (deviceId) => {
  return Device.findById(deviceId)
}

const updateDevice = (device) => {
  const { id, ...deviceParams } = device
  return Device.findByIdAndUpdate(id, { $set: deviceParams })
}

module.exports = {
  saveDevice,
  getDevices,
  getDevice,
  updateDevice
}
