const saveSensors = require('./saveSensors')
const saveDevices = require('./saveDevices')
const saveMockMeasures = require('./saveMockMeasures')
const connectMongoose = require('../config/mongoose')

;(async () => {
  try {
    await connectMongoose()
    // await saveSensors()
    // await saveDevices()
    await saveMockMeasures()
    process.exit(0)
  } catch (err) {
    console.log(`Error by saving to db ${err}`)
    process.exit(1)
  }
})()
