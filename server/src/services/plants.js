const plantsRepository = require('../repositories/plantsRepository')

const searchPlant = async (plantDetail) => {
  const { name } = plantDetail
  let plants

  if (name) {
    plants = await plantsRepository.searchByName(name)
  } else {
    plants = await plantsRepository.getMany(name)
  }

  return plants.map(plant => ({
    id: plant._doc._id,
    displayName: plant._doc.displayName,
    category: plant._doc.category
  }))
}

module.exports = {
  searchPlant
}
