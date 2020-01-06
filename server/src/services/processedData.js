const moment = require('moment')

const processedDataRepository = require('../repositories/processedDataRepository')

const saveProcessedData = async (data) => {
  // TODO: handle device not exist
  const savedProcessedData = await processedDataRepository.saveProcessData(data)
  return {
    message: 'Processed data successfully saved',
    processDataId: savedProcessedData._id
  }
}

const getProcessedData = async (parameters) => {
  const data = await processedDataRepository.getProcessedData({
    startTime: moment().subtract(1, 'days').toISOString(),
    endTime: moment().toISOString(),
    ...parameters })
  return data
}

module.exports = {
  saveProcessedData,
  getProcessedData
}
