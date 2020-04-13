const Events = require('../model/mongoDB/models/Events')

const save = (event) =>
  new Events(event).save()

const getOne = (event) => {
  return Events.findOne(event)
}

const getMany = (event) => {
  return Events.find(event)
}

module.exports = {
  save,
  getOne,
  getMany
}
