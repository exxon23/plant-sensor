const Plant = require('../model/mongoDB/models/Plant')

const save = (plant) =>
  new Plant(plant).save()

const getOne = (plant) => {
  return Plant.findOne(plant)
}

const getMany = (plant) => {
  return Plant.find(plant)
}

const searchByName = (name) =>
  Plant.find({ $text: { $search: name } }, 'id alias displayName category')

module.exports = {
  save,
  getOne,
  getMany,
  searchByName
}
