const ProcessData = require('../model/mongoDB/models/ProcessData')

const saveProcessedData = (data) =>
  new ProcessData(data).save()

const getProcessedData = (measure) => {
  const { startTime, endTime, device } = measure
  const dateQuery = { $gte: startTime, $lt: endTime }
  return ProcessData.find({ device, createdAt: dateQuery })
}

module.exports = {
  saveProcessedData,
  getProcessedData
}
