const axios = require('axios')
const Boom = require('boom')

const measuresRepository = require('../repositories/measuresRepository')
const devicesRepository = require('../repositories/devicesRepository')

const saveMeasure = async (measure) => {
  if (!await devicesRepository.getOne(measure.device)) {
    throw Boom.notFound(`Device with id ${measure.device} not found`)
  }

  const savedMeasure = await measuresRepository.save(measure)
  const { temperature, humidity, lightIntensity, soilMoisture, voltage } = measure.data.reduce((acc, cur) => {
    acc[cur.measure] = cur.value
    return acc
  }, {})
  await axios.post(`https://api.thingspeak.com/update?api_key=9UYST6149KRNPA00&field1=${temperature}&field2=${humidity}&field3=${soilMoisture}&field4=${lightIntensity}&field5=${voltage}`)
  return savedMeasure._id
}

module.exports = {
  saveMeasure
}
