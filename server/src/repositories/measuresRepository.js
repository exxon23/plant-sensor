const Measure = require('../model/mongoDB/models/Measure')

const save = (measure) =>
  new Measure(measure).save()

const getMany = (measure) => {
  const { startTime, endTime, ...query } = measure
  const dateQuery = { $gte: startTime, $lt: endTime }
  return Measure.find({ ...query, createdAt: dateQuery })
}

const update = (measure) => {
  const { id, ...measureParams } = measure
  return Measure.findByIdAndUpdate(id, { $set: measureParams })
}

module.exports = {
  save,
  getMany,
  update
}
