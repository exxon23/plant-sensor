const Sensor = require('../model/mongoDB/models/Sensor')

const saveSensor = (sensor) =>
  new Sensor(sensor).save()

const getSensor = (sensorId) => {
  return Sensor.findById(sensorId)
}

module.exports = {
  saveSensor,
  getSensor
}
