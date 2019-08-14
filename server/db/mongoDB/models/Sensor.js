const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SensorSchema = new Schema({
  name: {
    type: String
  }
}, { timestamps: true })

mongoose.model('sensors', SensorSchema)
