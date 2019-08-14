const mongoose = require('mongoose')
require('../db/mongoDB/models/Device')

const Device = mongoose.model('devices')

const devices = [
  { version: '1.0.0' },
  { version: '1.0.0' }
]

const saveDevices = async () => {
  for (const device of devices) {
    const newDevice = await new Device(device).save()
    console.log(`Device with version ${device.version} saved with id ${newDevice._id}`)
  }
}

module.exports = saveDevices
