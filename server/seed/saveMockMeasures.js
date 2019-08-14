const mongoose = require('mongoose')
require('../db/mongoDB/models/Measure')

const Measure = mongoose.model('measures')

const measures = [
  { device: '5d545c4a9c51723b449f1c6b',
    temperature: {
      sensor: '5d545c439c51723b449f1c67', // bme280
      value: 25.6
    },
    humidity: {
      sensor: '5d545c439c51723b449f1c67', // bme280
      value: 25.6
    },
    moisture: {
      sensor: '5d545c499c51723b449f1c68', // moisture sensor v1.2
      value: 156
    },
    lightIntensity: {
      sensor: '5d545c499c51723b449f1c69', // bh1750
      value: 250
    }
  }

]

const saveMockMeasures = async () => {
  for (const measure of measures) {
    const newMeasure = await new Measure(measure).save()
    console.log(`New measure saved saved with id ${newMeasure._id}`)
  }
}

module.exports = saveMockMeasures
