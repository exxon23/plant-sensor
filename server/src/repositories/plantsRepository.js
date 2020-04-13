const Plant = require('../model/mongoDB/models/Plant')

const save = (plant) =>
  new Plant(plant).save()

const getOne = (plant) => {
  return Plant.findOne(plant)
}

const getMany = (plant) => {
  return Plant.find(plant)
}

module.exports = {
  save,
  getOne,
  getMany
}
