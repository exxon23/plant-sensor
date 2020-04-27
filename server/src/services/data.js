const Boom = require('boom')

const devicesRepository = require('../repositories/devicesRepository')
const processedDataRepository = require('../repositories/processedDataRepository')

const getProcessedData = async (params) => {
  const { deviceId, startTime, endTime } = params
  if (!await devicesRepository.getOne(deviceId)) {
    throw Boom.notFound(`Device with id ${deviceId} not found`)
  }

  const data = await processedDataRepository.getMany({
    startTime,
    endTime,
    device: deviceId
  })

  return data.reduce((acc, cur) => {
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
}

module.exports = {
  getProcessedData
}
