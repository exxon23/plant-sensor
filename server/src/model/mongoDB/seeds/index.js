const connectMongoose = require('../../../../config/mongoose')
const Sensor = require('../models/Sensor')
const DeviceConfiguration = require('../models/DeviceConfiguration')
const Device = require('../models/Device')

// EXAMPLE DATA:
const sensors = [
  { name: 'BME280' },
  { name: 'Moisture sensor v1.2' },
  { name: 'BH1750' }
  // { name: 'KY-018' }
]

const deviceConfigurations = [
  {
    version: 'alfa',
    type: 'plant-sensor'
  }
]
const devices = [
  { name: 'nodemcu', active: true }
]

const saveSensor = async (sensor) => {
  const newSensor = await new Sensor(sensor).save()
  console.log(`Sensor with name ${sensor.name} saved with id ${newSensor._id}`)
  return newSensor._id
}

const saveDeviceConfiguration = async (deviceConfiguration) => {
  const newDeviceConfiguration = await new DeviceConfiguration(deviceConfiguration).save()
  console.log(`Device configuration with type ${deviceConfiguration.type} and version ${deviceConfiguration.version} saved with id ${newDeviceConfiguration._id}`)
  return newDeviceConfiguration._id
}

const saveDevice = async (device) => {
  const newDevice = await new Device(device).save()
  console.log(`Device with configuration ${device.configuration} saved with id ${newDevice._id}`)
  return newDevice._id
}

const saveSensors = async () => {
  for (const sensor of sensors) {
    const newSensor = await new Sensor(sensor).save()
    console.log(`Sensor with name ${sensor.name} saved with id ${newSensor._id}`)
  }
}
;(async () => {
  try {
    await connectMongoose()
    const sensorsId = await Promise.all(sensors.map(sensor => saveSensor(sensor)))
    const deviceConfigurationId = await saveDeviceConfiguration({ ...deviceConfigurations, sensors: sensorsId })
    await saveDevice({ ...devices, configuration: deviceConfigurationId })
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

module.exports = saveSensors
