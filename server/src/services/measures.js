const moment = require('moment')
const axios = require('axios')
const measuresRepository = require('../repositories/measuresRepository')

const saveMeasure = async (measure) => {
  // TODO: handle device not exist
  const savedMeasure = await measuresRepository.saveMeasure(measure)
  const {temperature, humidity, lightIntensity, soilMoisture, voltage} = measure.data.reduce((acc,cur) => {
    acc[cur.measure] = cur.value
    return acc
  }, {})
  await axios.post(`https://api.thingspeak.com/update?api_key=9UYST6149KRNPA00&field1=${temperature}&field2=${humidity}&field3=${soilMoisture}&field4=${lightIntensity}&field5=${voltage}`)

  return {
    message: 'Measured data successfully saved',
    measureId: savedMeasure._id
  }
}

const getMeasures = async (measureParameters) => {
  const measures = await measuresRepository.getMeasures({
    startTime: moment().subtract(1, 'days').toISOString(),
    endTime: moment().toISOString(),
    ...measureParameters })
  return measures
}

const deleteMeasure = async (measure) => {
  await measuresRepository.deleteMeasure(measure)
  return {
    message: 'Measured data successfully deleted',
    measureId: measure.id
  }
}

module.exports = {
  saveMeasure,
  getMeasures,
  deleteMeasure
}
