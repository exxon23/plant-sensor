const mongoose = require('mongoose')

const Device = require('../model/mongoDB/models/Device')

const save = (device) =>
  new Device(device).save()

const getMany = (device = {}) => {
  return Device.find(device)
}

const getOne = (deviceId) => {
  if (mongoose.Types.ObjectId.isValid(deviceId)) return Device.findById(deviceId)
  else return undefined
}

const update = (device) => {
  const { id, ...deviceParams } = device
  return Device.findByIdAndUpdate(id, { $set: deviceParams })
}

module.exports = {
  save,
  getMany,
  getOne,
  update
}
