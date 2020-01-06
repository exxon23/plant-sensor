const Measure = require('../model/mongoDB/models/Measure')

const saveMeasure = (measure) =>
  new Measure(measure).save()

const getMeasures = (measure) => {
  const { startTime, endTime, ...query } = measure
  const dateQuery = { $gte: startTime, $lt: endTime }
  return Measure.find({ ...query, createdAt: dateQuery })
}

const deleteMeasure = (measure) => {
  const { id } = measure
  return Measure.findByIdAndDelete(id)
}

module.exports = {
  saveMeasure,
  getMeasures,
  deleteMeasure
}
