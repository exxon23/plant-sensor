const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PlantSchema = new Schema({
  displayName: { type: String, required: true },
  category: { type: String, required: true },
  color: { type: String, required: true },
  alias: { type: String, required: true },
  temperature: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  humidity: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  lightIntensity: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  soilMoisture: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  notes: [{ item: String, description: String }],
  image: { type: String, required: true }
}, { timestamps: true })

PlantSchema.index({ displayName: 'text', alias: 'text', category: 'text' })

module.exports = mongoose.model('plants', PlantSchema)
