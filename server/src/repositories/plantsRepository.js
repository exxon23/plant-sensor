const mongoose = require('mongoose')

const Plant = require('../model/mongoDB/models/Plant')

const save = (plant) =>
  new Plant(plant).save()

const getOne = (plant) => {
  if (mongoose.Types.ObjectId.isValid(plant)) return Plant.findById(plant)
  else return undefined
}

const getMany = () => {
  return Plant.find({}, 'id displayName category').limit(100)
}

const searchByName = (name) =>
  Plant.find({ $text: { $search: name } }, 'id displayName category').limit(100)

module.exports = {
  save,
  getOne,
  getMany,
  searchByName
}
