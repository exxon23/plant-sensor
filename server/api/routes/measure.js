const express = require('express')
const ThingSpeakClient = require('thingspeakclient')
const mongoose = require('mongoose')
const axios = require('axios')
const client = new ThingSpeakClient()
const router = express.Router()
const { thingSpeakWriteKey } = require('../../config/config')
require('../../db/mongoDB/models/Measure')

const Measure = mongoose.model('measures')

router.post('/', async (req, res) => {
  try {
    const { temperature, humidity, moisture, lightIntensity, device, voltage } = req.body
    // const newMeasure = await new Measure({ temperature, humidity, moisture, lightIntensity, device }).save()
    // console.log(`Measure saved to mongoDB with id ${newMeasure._id}`)
    await axios.post(`https://api.thingspeak.com/update?api_key=${thingSpeakWriteKey}&field1=${temperature.value}&field2=${humidity.value}&field3=${moisture.value}&field4=${lightIntensity.value}&field5=${voltage.value}`)
    // client.attachChannel(Number(thingSpeakChannelId), { writeKey: thingSpeakWriteKey, readKey: thingSpeakReadKey }, (errAttachChannel, resAttachChennel) => {
    //   if (errAttachChannel) res.status(500).send('Error in thingspeak client')
    //   client.updateChannel(Number(thingSpeakChannelId), { field1: temperature, field2: humidity, field3: moisture, field4: lightIntensity }, (updateErr, updateRes) => {
    //     console.log(updateRes, updateErr)
    //     res.end('Data received successfully')
    //   })
    // })
  } catch (err) {
    res.status(500).send('Error')
  }
})

module.exports = router
