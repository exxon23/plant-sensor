const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
  device: {
    type: Schema.Types.ObjectId,
    ref: 'devices',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {},
  time: {
    type: Date,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('events', EventSchema)
