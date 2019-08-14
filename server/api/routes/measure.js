const express = require('express')
const ThingSpeakClient = require('thingspeakclient')
const mongoose = require('mongoose')
const client = new ThingSpeakClient()
const router = express.Router()
const { thingSpeakWriteKey, thingSpeakReadKey, thingSpeakChannelId } = require('../../config/config')
require('../../db/mongoDB/models/Measure')

const Measure = mongoose.model('measures')

router.post('/', async (req, res) => {
  try {
    const { temperature, humidity, moisture, lightIntensity, device } = req.body
    const newMeasure = await new Measure({ temperature, humidity, moisture, lightIntensity, device }).save()
    console.log(`Measure saved to mongoDB with id ${newMeasure._id}`)

    client.attachChannel(Number(thingSpeakChannelId), { writeKey: thingSpeakWriteKey, readKey: thingSpeakReadKey }, (errAttachChannel, resAttachChennel) => {
      if (errAttachChannel) res.status(500).send('Error in thingspeak client')
      client.updateChannel(Number(thingSpeakChannelId), { field1: temperature, field2: humidity, field3: moisture, field4: lightIntensity }, (updateErr, updateRes) => {
        res.end('Data received successfully')
      })
    })
  } catch (err) {
    res.status(500).send('Error')
  }
})

module.exports = router
