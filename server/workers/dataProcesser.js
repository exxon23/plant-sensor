const moment = require('moment')

const measuresRepository = require('../src/repositories/measuresRepository')
const devicesRepository = require('../src/repositories/devicesRepository')
const deviceConfigurationsRepository = require('../src/repositories/deviceConfigurationsRepository')
const processedDataRepository = require('../src/repositories/processedDataRepository')
const connectToMongoose = require('../config/mongoose')

const INTERVAL = 5000

const processData = async () => {
  let interval
  console.log('Start loading data to process...')
  try {
    // Get unprocessed measures
    const unProcessedMeasures = await measuresRepository.getMany({
      startTime: moment().subtract(1, 'week').toISOString(),
      endTime: moment().toISOString(),
      processed: false })
    const processedMeasures = await Promise.all(unProcessedMeasures.map(async measure => {
      try {
        // Get device configuration
        const device = await devicesRepository.getOne(measure.device)
        const configuration = await deviceConfigurationsRepository.getOne(device.configuration._id)
        // Process data based on device configuration
        const processedData = {
          data: processMeasureBySensorType({ type: configuration.type, measuredData: measure }),
          device: device.id,
          measure: measure.id,
          createdAt: measure.createdAt
        }
        await processedDataRepository.save(processedData)
        return measure.id
      } catch (error) {
        console.log(error)
      }
    }))

    // Update all processed measures
    await Promise.all(processedMeasures.map(id => measuresRepository.update({ id, processed: true })))
    console.log(`${processedMeasures.length} measures processed`)
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
        else if (measure === 'soilMoisture') {
          const calculatedValue = 100 - Math.round(value / 1024 * 100)
          result.push({ measure, value: calculatedValue > 100 ? 100 : calculatedValue, units: '%' })
        } else if (measure === 'voltage') {
          const calculatedValue = Math.round((value - 3.3) / 0.9 * 100)
          result.push({ measure, value: calculatedValue > 100 ? 100 : calculatedValue, units: '%' })
        }
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
