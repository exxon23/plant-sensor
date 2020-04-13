const Event = require('../model/mongoDB/models/Event')

const save = (event) =>
  new Event(event).save()

const getOne = (event) => {
  return Event.findOne(event)
}

const getMany = (event) => {
  return Event.find(event)
}

module.exports = {
  save,
  getOne,
  getMany
}
