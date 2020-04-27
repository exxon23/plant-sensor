const Event = require('../model/mongoDB/models/Event')

const save = (event) =>
  new Event(event).save()

const getOne = (event) => {
  return Event.findOne(event)
}

const getMany = (event) => {
  return Event.find(event).sort({ time: -1 })
}

module.exports = {
  save,
  getOne,
  getMany
}
