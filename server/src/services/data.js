const Boom = require('boom')

const devicesRepository = require('../repositories/devicesRepository')
const processedDataRepository = require('../repositories/processedDataRepository')

const getProcessedData = async (params) => {
  const { deviceId, startTime, endTime, measuredQuantity } = params
  if (!await devicesRepository.getOne(deviceId)) {
    throw Boom.notFound(`Device with id ${deviceId} not found`)
  }

  const data = await processedDataRepository.getMeasureQuantityData({
    startTime,
    endTime,
    device: deviceId
  }, measuredQuantity)

  const allData = data.reduce((acc, cur) => {
    cur.data.forEach(measure => {
      if (measure.measure === measuredQuantity) {
        if (!acc[measure.measure]) {
          acc[measure.measure] = [{ value: measure.value, time: cur.createdAt }]
        } else {
          acc[measure.measure].push({ value: measure.value, time: cur.createdAt })
        }
      }
    })

    return acc
  }, {})

  return allData[measuredQuantity]
}

module.exports = {
  getProcessedData
}
