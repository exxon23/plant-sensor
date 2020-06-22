const ProcessData = require('../model/mongoDB/models/ProcessData')

const save = (data) =>
  new ProcessData(data).save()

const getMany = (measure) => {
  const { startTime, endTime, device } = measure
  const dateQuery = { $gte: startTime, $lt: endTime }
  return ProcessData.find({ device, createdAt: dateQuery })
}

const getMeasureQuantityData = (measure, measureQuantity) => {
  const { startTime, endTime, device } = measure
  const dateQuery = { $gte: startTime, $lt: endTime }
  return ProcessData
    .find({ device, createdAt: dateQuery, 'data.measure': measureQuantity }, 'createdAt data.measure data.value')
    .lean()
}

module.exports = {
  save,
  getMany,
  getMeasureQuantityData
}
