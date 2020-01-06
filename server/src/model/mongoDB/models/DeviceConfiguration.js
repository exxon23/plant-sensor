const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DeviceConfigurationSchema = new Schema({
  sensors: [{
    type: Schema.Types.ObjectId,
    ref: 'sensors'
  }],
  version: {
    type: String
  }
}, { timestamps: true })

module.exports = mongoose.model('device_configurations', DeviceConfigurationSchema)
