const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProcessDataSchema = new Schema({
  device: {
    type: Schema.Types.ObjectId,
    ref: 'devices'
  },
  measure: {
    type: Schema.Types.ObjectId,
    ref: 'measures'
  },
  data: [{ measure: String, value: Number }]
}, { timestamps: true })

module.exports = mongoose.model('process_data', ProcessDataSchema)
