const moment = require('moment')

const devicesRepository = require('./src/repositories/devicesRepository')
const deviceConfigurationsRepository = require('./src/repositories/deviceConfigurationsRepository')
const processedDataRepository = require('./src/repositories/processedDataRepository')
const eventsRepository = require('./src/repositories/eventsRepository')
const connectToMongoose = require('./config/mongoose')

const INTERVAL = 20 * 60 * 1000 // 20 minutes
const WATERING_THRESHOLD = 8 // value of min difference which means watering

const processData = async () => {
  let interval
  console.log('Start loading data to process...')
  try {
    // Find device configuration for "plant-sensor"
    const configuration = await deviceConfigurationsRepository.getDeviceConfiguration({ type: 'plant-sensor' })
    // Find devices with this configuration
    const devices = await devicesRepository.getDevices({ configuration: configuration.id })

    const lastWeekDays = [...new Array(7)].map((e, idx) => moment().subtract(idx + 1, 'days'))

    for (const device of devices) {
      let wateringMonitorActive
      const data = await processedDataRepository.getProcessedData({
        startTime: moment().subtract(1, 'week').toISOString(),
        endTime: moment().toISOString(),
        device: device.id
      })

      // Check if device measures more than 7 days
      lastWeekDays.forEach(day => {
        const match = !!data.find(d => moment(d._doc.createdAt).isSame(day, 'day'))
        if (!match) {
          // TODO: if(false) plant-meta -> watering_monitor -> status -> active -> false
          wateringMonitorActive = false
        } else wateringMonitorActive = true
      })

      if (wateringMonitorActive) {
        // TODO: if(true) plant-meta -> watering_monitor -> status -> active -> true
        const soilMoistureData = data.map(measure => {
          const soilMeasureValue = measure._doc.data.find(data => data.measure === 'soilMoisture')
          if (soilMeasureValue) {
            return {
              value: soilMeasureValue.value,
              time: measure._doc.createdAt.toISOString()
            }
          }
        }).filter(Boolean)

        // Create differences in soil moisture measures
        const diff = []
        for (let index = 0; index < soilMoistureData.length - 1; index++) {
          diff[index] = {
            value: soilMoistureData[index + 1].value - soilMoistureData[index].value,
            time: soilMoistureData[index + 1].time
          }
        }

        const peaks = diff.filter(d => d.value > WATERING_THRESHOLD)

        if (peaks.length) {
          console.log(`Find ${peaks.length} watering events for device ${device.id}`)

          await Promise.all(
            peaks.map(async ({ time, value }) => {
              if (!await eventsRepository.getOne({ time, type: 'watering' })) {
                eventsRepository.save({ type: 'watering', time: time, device: device.id, data: { change: Math.abs(value) } })
              }
            })
          )
        }
      }
    }
  } catch (err) {
    console.log(err)
    clearTimeout(interval)
  } finally {
    interval = setTimeout(processData, INTERVAL)
  }
}

;(async () => {
  await connectToMongoose()
  processData()
})()
