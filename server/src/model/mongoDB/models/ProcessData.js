const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProcessDataSchema = new Schema({
  device: {
    type: Schema.Types.ObjectId,
    ref: 'devices',
    required: true

  },
  measure: {
    type: Schema.Types.ObjectId,
    ref: 'measures',
    required: true
  },
  data: [{ measure: String, value: Number, unit: String }]
}, { timestamps: true })

module.exports = mongoose.model('process_data', ProcessDataSchema)
