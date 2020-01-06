const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DeviceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  name: {
    type: String
  },
  configuration: {
    type: Schema.Types.ObjectId,
    ref: 'device_configuration'
  },
  active: {
    type: Boolean,
    default: false
  }

}, { timestamps: true })

module.exports = mongoose.model('devices', DeviceSchema)
