const Sensor = require('../model/mongoDB/models/Sensor')

const save = (sensor) =>
  new Sensor(sensor).save()

const getOne = (sensorId) => {
  return Sensor.findById(sensorId)
}

module.exports = {
  save,
  getOne
}
