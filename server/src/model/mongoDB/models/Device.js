const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DeviceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    default: null
  },
  name: {
    type: String,
    default: null
  },
  configuration: {
    type: Schema.Types.ObjectId,
    ref: 'device_configuration',
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  metadata: {}

}, { timestamps: true })

module.exports = mongoose.model('devices', DeviceSchema)
