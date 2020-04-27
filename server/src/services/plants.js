const plantsRepository = require('../repositories/plantsRepository')

const searchPlant = async (plantDetail) => {
  const { name } = plantDetail
  const plants = await plantsRepository.searchByName(name)
  return plants.map(plant => plant._doc)
}

module.exports = {
  searchPlant
}
