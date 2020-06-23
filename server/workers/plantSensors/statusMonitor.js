const moment = require('moment')

const connectToMongoose = require('../../config/mongoose')
const devicesRepository = require('../../src/repositories/devicesRepository')
const deviceConfigurationsRepository = require('../../src/repositories/deviceConfigurationsRepository')
const processedDataRepository = require('../../src/repositories/processedDataRepository')
const eventsRepository = require('../../src/repositories/eventsRepository')

const INTERVAL = 20 * 60 * 1000 // 20 minutes

const calculateAverage = (array) => {
  const sum = array.reduce((acc, cur) => {
    acc += cur.value
    return acc
  }, 0)
  return (sum / array.length).toFixed(2)
}

const getDataFromInterval = (data, { startTime, endTime }) => {
  return data.filter(item => moment(item.time).isBetween(startTime, endTime, 'seconds', '[]'))
}

const processData = async () => {
  let interval
  try {
    // Find device configuration for "plant-sensor"
    const configuration = await deviceConfigurationsRepository.getOne({ type: 'plant-sensor' })
    // Find devices with this configuration
    const devices = await devicesRepository.getMany({ configuration: configuration.id })

    const lastWeekDays = [...new Array(7)].map((e, idx) => moment().subtract(idx + 1, 'days'))
    const lastTwoWeekDays = [...new Array(14)].map((e, idx) => moment().subtract(idx + 1, 'days'))
    const last30Days = [...new Array(30)].map((e, idx) => moment().subtract(idx + 1, 'days'))

    for (const device of devices) {
      const data = await processedDataRepository.getMany({
        startTime: moment().subtract(30, 'days').toISOString(),
        endTime: moment().toISOString(),
        device: device.id
      })

      const statusMonitorActive = {
        lastWeek: lastWeekDays.every(day =>
          !!data.find(d => moment(d._doc.createdAt).isSame(day, 'day'))
        ),
        lastTwoWeeks: lastTwoWeekDays.every(day =>
          !!data.find(d => moment(d._doc.createdAt).isSame(day, 'day'))
        ),
        last30Days: last30Days.every(day =>
          !!data.find(d => moment(d._doc.createdAt).isSame(day, 'day'))
        )
      }

      const preparedData = data.reduce((acc, cur) => {
        cur.data.forEach(measure => {
          if (!acc[measure._doc.measure]) {
            acc[measure._doc.measure] = {
              units: measure._doc.units,
              data: [{ value: measure._doc.value, time: cur.createdAt }]
            }
          } else {
            acc[measure._doc.measure].data.push({ value: measure._doc.value, time: cur.createdAt })
          }
        })

        return acc
      }, {})

      // Calculate temperature averages
      const temperature = {
        average: {
          lastWeek: statusMonitorActive.lastWeek
            ? calculateAverage(getDataFromInterval(preparedData.temperature.data, { startTime: moment().subtract(1, 'week'), endTime: moment() }))
            : null,
          lastTwoWeeks: statusMonitorActive.lastTwoWeeks
            ? calculateAverage(getDataFromInterval(preparedData.temperature.data, { startTime: moment().subtract(2, 'weeks'), endTime: moment() }))
            : null,
          last30Days: statusMonitorActive.last30Days
            ? calculateAverage(preparedData.temperature.data)
            : null
        },
        units: preparedData.temperature.units
      }
      // Calculate air humidity averages
      const humidity = {
        average: {
          lastWeek: statusMonitorActive.lastWeek
            ? calculateAverage(getDataFromInterval(preparedData.humidity.data, { startTime: moment().subtract(1, 'week'), endTime: moment() }))
            : null,
          lastTwoWeeks: statusMonitorActive.lastTwoWeeks
            ? calculateAverage(getDataFromInterval(preparedData.humidity.data, { startTime: moment().subtract(2, 'weeks'), endTime: moment() }))
            : null,
          last30Days: statusMonitorActive.last30Days
            ? calculateAverage(preparedData.humidity.data)
            : null
        },
        units: preparedData.humidity.units
      }
      // Calculate light intensity averages
      const filteredDaysData = preparedData.lightIntensity.data.filter(({ value, time }) => {
        const hour = moment(time).hour()
        return hour < 20 && hour > 7
      })
      const lightIntensity = {
        average: {
          lastWeek: statusMonitorActive.lastWeek
            ? calculateAverage(getDataFromInterval(filteredDaysData, { startTime: moment().subtract(1, 'week'), endTime: moment() }))
            : null,
          lastTwoWeeks: statusMonitorActive.lastTwoWeeks
            ? calculateAverage(getDataFromInterval(filteredDaysData, { startTime: moment().subtract(2, 'weeks'), endTime: moment() }))
            : null,
          last30Days: statusMonitorActive.last30Days
            ? calculateAverage(filteredDaysData)
            : null
        },
        units: preparedData.lightIntensity.units
      }
      // Calculate soil moisture averages
      const lastWateringEvents = await eventsRepository.getMany({ type: 'watering' })
      const soilMoisture = {
        average: {
          lastWeek: statusMonitorActive.lastWeek
            ? calculateAverage(getDataFromInterval(preparedData.soilMoisture.data, { startTime: moment().subtract(1, 'week'), endTime: moment() }))
            : null,
          lastTwoWeeks: statusMonitorActive.lastTwoWeeks
            ? calculateAverage(getDataFromInterval(preparedData.soilMoisture.data, { startTime: moment().subtract(2, 'weeks'), endTime: moment() }))
            : null,
          last30Days: statusMonitorActive.last30Days
            ? calculateAverage(preparedData.soilMoisture.data)
            : null
        },
        units: preparedData.soilMoisture.units,
        lastWatering: lastWateringEvents.length ? moment(lastWateringEvents[0]._doc.time).toISOString() : null
      }

      // Calculate approximate remaining battery capacity from equation y=p1*x+p2 where x is time and y is battery capacity
      const p1 = -0.3512
      const p2 = 104.2
      const actualBatteryLevel = calculateAverage(getDataFromInterval(preparedData.voltage.data, { startTime: moment().subtract(1, 'day'), endTime: moment() }))
      const y1 = actualBatteryLevel
      const y2 = 0

      const x1 = (y1 - p2) / p1
      const x2 = (y2 - p2) / p1
      const remainingDays = (x2 - x1).toFixed()
      const battery = {
        remainingDays
      }
      // Create status monitor state
      const previousStatusMonitorState = device._doc.metadata && device._doc.metadata.statusMonitor && device._doc.metadata.statusMonitor.active
      let statusMonitorState = previousStatusMonitorState
      let statusMonitorStartTime = null

      if (previousStatusMonitorState) {
        statusMonitorStartTime = device._doc.metadata.statusMonitor.startTime
        if (!statusMonitorActive.lastWeek) {
          // Sensor not active, change status monitor from active -> inactive
          statusMonitorStartTime = null
          statusMonitorState = false
        }
      } else {
        if (statusMonitorActive.lastWeek) {
          // Sensor is active more than 7 days, change status monitor from inactive -> active
          statusMonitorStartTime = moment().toISOString()
          statusMonitorState = true
        }
      }
      const statusMonitor = { active: !!statusMonitorState, startTime: statusMonitorStartTime }
      // Update device metadata
      const newDeviceMetadata = {
        temperature,
        humidity,
        soilMoisture,
        lightIntensity,
        statusMonitor,
        battery
      }
      await devicesRepository.update({ id: device.id, metadata: { ...device._doc.metadata, ...newDeviceMetadata } })
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
