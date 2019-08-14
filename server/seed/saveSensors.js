const mongoose = require('mongoose')
require('../db/mongoDB/models/Sensor')

const Sensor = mongoose.model('sensors')

const sensors = [
  { name: 'BME280' },
  { name: 'Moisture sensor v1.2' },
  { name: 'BH1750' },
  { name: 'KY-018' }
]

const saveSensors = async () => {
  for (const sensor of sensors) {
    const newSensor = await new Sensor(sensor).save()
    console.log(`Sensor with name ${sensor.name} saved with id ${newSensor._id}`)
  }
}

module.exports = saveSensors
