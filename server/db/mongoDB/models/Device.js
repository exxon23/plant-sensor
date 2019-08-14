const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DeviceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  version: {
    type: String
  },
  name: {
    type: String
  },
  active: {
    type: Boolean,
    default: false
  }

}, { timestamps: true })

mongoose.model('devices', DeviceSchema)
