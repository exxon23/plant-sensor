const moment = require('moment')

const measuresRepository = require('../repositories/measuresRepository')

const saveMeasure = async (measure) => {
  // TODO: handle device not exist
  const savedMeasure = await measuresRepository.saveMeasure(measure)
  return {
    message: 'Measured data successfully saved',
    measureId: savedMeasure._id
  }
}

const getMeasures = async (measureParameters) => {
  const measures = await measuresRepository.getMeasures({
    startTime: moment().subtract(1, 'days').toISOString(),
    endTime: moment().toISOString(),
    ...measureParameters })
  return measures
}

const deleteMeasure = async (measure) => {
  await measuresRepository.deleteMeasure(measure)
  return {
    message: 'Measured data successfully deleted',
    measureId: measure.id
  }
}

module.exports = {
  saveMeasure,
  getMeasures,
  deleteMeasure
}
