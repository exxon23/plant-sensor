const csv = require('csv-parser')
const fs = require('fs')

const plantsRepository = require('../../../repositories/plantsRepository')
const connectToMongoose = require('../../../../config/mongoose')

const plants = []
const PATH_TO_FILE = './plant_db.csv'
;(async () => {
  await connectToMongoose()

  fs.createReadStream(PATH_TO_FILE)
    .pipe(csv())
    .on('data', (data) => plants.push(data))
    .on('end', async () => {
      for (const [idx, plant] of plants.entries()) {
        const result = {
          displayName: plant.display_pid,
          category: plant.category,
          image: plant.image,
          alias: plant.alias,
          color: plant.color,
          temperature: {
            min: Number(plant.min_temp),
            max: Number(plant.max_temp)
          },
          humidity: {
            min: Number(plant.min_env_humid),
            max: Number(plant.max_env_humid)
          },
          lightIntensity: {
            min: Number(plant.min_light_lux),
            max: Number(plant.max_light_lux)
          },
          soilMoisture: {
            min: Number(plant.min_soil_moist),
            max: Number(plant.max_soil_moist)
          },
          notes: [
            { item: 'blooming', description: plant.blooming },
            { item: 'fertilization', description: plant.fertilization },
            { item: 'pruning', description: plant.pruning },
            { item: 'sunlight', description: plant.sunlight },
            { item: 'watering', description: plant.watering },
            { item: 'soil', description: plant.soil }
          ]
        }
        try {
          await plantsRepository.save(result)
          console.log(`Saved plant with name ${result.displayName} (${idx}/${plants.length})`)
        } catch (err) {
          console.log(`Error by saving - ${err}`)
        }
      }
    })
})()
