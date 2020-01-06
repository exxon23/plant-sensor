const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MeasureSchema = new Schema({
  device: {
    type: Schema.Types.ObjectId,
    ref: 'devices'
  },
  processed: {
    type: Boolean,
    default: false
  },
  data: [{ measure: String, value: Number }]
}, { timestamps: true })

module.exports = mongoose.model('measures', MeasureSchema)
