const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DeviceConfigurationSchema = new Schema({
  sensors: [{
    type: Schema.Types.ObjectId,
    ref: 'sensors',
    required: true
  }],
  version: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  settings: {}
}, { timestamps: true })

module.exports = mongoose.model('device_configurations', DeviceConfigurationSchema)
