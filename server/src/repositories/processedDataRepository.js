const ProcessData = require('../model/mongoDB/models/ProcessData')

const saveProcessedData = (data) =>
  new ProcessData(data).save()

const getProcessedData = (measure) => {
  const { startTime, endTime, sensor } = measure
  const dateQuery = { $gte: startTime, $lt: endTime }
  return ProcessData.find({ sensor, createdAt: dateQuery })
}

module.exports = {
  saveProcessedData,
  getProcessedData
}
