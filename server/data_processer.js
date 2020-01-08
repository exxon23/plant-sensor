const moment = require('moment')

const measuresRepository = require('./src/repositories/measuresRepository')
const devicesRepository = require('./src/repositories/devicesRepository')
const deviceConfigurationsRepository = require('./src/repositories/deviceConfigurationsRepository')
const processedDataRepository = require('./src/repositories/processedDataRepository')
const connectToMongoose = require('./config/mongoose')

const INTERVAL = 5000

const processData = async () => {
  let interval
  console.log('Start loading data to process...')
  try {
    const unProcessedMeasures = await measuresRepository.getMeasures({
      startTime: moment().subtract(1, 'week').toISOString(),
      endTime: moment().toISOString(),
      processed: false })
    const processedMeasures = await Promise.all(unProcessedMeasures.map(async measure => {
      const device = await devicesRepository.getDevice(measure.device)
      const configuration = await deviceConfigurationsRepository.getDeviceConfiguration(device.configuration)
      const processedData = { data: processMeasureBySensorType({ type: configuration.type, measuredData: measure }), device: device.id, measure: measure.id }
      await processedDataRepository.saveProcessedData(processedData)
      return measure.id
    }))

    await Promise.all(processedMeasures.map(id => measuresRepository.updateMeasure({ id, processed: true })))

    console.log(`${unProcessedMeasures.length} measures processed`)
  } catch (err) {
    console.log(err)
    clearTimeout(interval)
  } finally {
    interval = setTimeout(processData, INTERVAL)
  }
}

const processMeasureBySensorType = ({ type, measuredData }) => {
  const result = []
  switch (type) {
    case 'plant-sensor':
      measuredData.data.forEach(({ measure, value }) => {
        if (measure === 'temperature') result.push({ measure, value: Math.round(value), units: '°C' })
        else if (measure === 'humidity') result.push({ measure, value: Math.round(value), units: '%' })
        else if (measure === 'lightIntensity') result.push({ measure, value: Math.round(value), units: 'lux' })
        else if (measure === 'soilMoisture') result.push({ measure, value: Math.round(value / 1024 * 100), units: '%' })
        else if (measure === 'voltage') result.push({ measure, value: Math.round((value - 3.3) / 0.9 * 100), units: '%' })
      })
      break

    default:
      break
  }
  return result
}

;(async () => {
  await connectToMongoose()
  processData()
})()
