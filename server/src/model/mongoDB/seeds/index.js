const connectMongoose = require('../../../../config/mongoose')
const Sensor = require('../models/Sensor')
const DeviceConfiguration = require('../models/DeviceConfiguration')
const Device = require('../models/Device')

// EXAMPLE DATA:
const devices = [
  {
    name: 'esp12',
    active: true,
    configuration: {
      version: 'alfa',
      type: 'plant-sensor'
    },
    sensors: [
      { name: 'BME280' },
      { name: 'Moisture sensor v1.2' },
      { name: 'BH1750' }
      // { name: 'KY-018' }
    ]
  }
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

;(async () => {
  try {
    await connectMongoose()

    for (const device of devices) {
      const sensorsId = await Promise.all(device.sensors.map(sensor => saveSensor(sensor)))
      const deviceConfigurationId = await saveDeviceConfiguration({ ...device.configuration, sensors: sensorsId })
      await saveDevice({ ...device, configuration: deviceConfigurationId })
    }

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
