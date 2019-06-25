const express = require('express')
const ThingSpeakClient = require('thingspeakclient')

const client = new ThingSpeakClient()
const router = express.Router()
const thingSpeakConfig = {
    writeKey: '3KNE04HKJVVYGG57',
    readKey: '3O7ZNHT91WRPCOC8',
    channelId: 809874
}

router.post('/', async (req, res) => {
    try {
        console.log(req.body)
        const { temperature, humidity, soilHumidity } = req.body
        client.attachChannel(thingSpeakConfig.channelId, 
            { writeKey:thingSpeakConfig.writeKey, 
                readKey:thingSpeakConfig.readKey}, (errAttachChannel,resAttachChennel) => {
                    if(!errAttachChannel) {                  
                        client.updateChannel(thingSpeakConfig.channelId, {field1: temperature, field2: humidity, field3: soilHumidity}, (updateErr,updateRes) => {
                            res.send('Data received successfully')
                        })           
                    }
        })
    } catch (err) {
        res.statusCode(500).send('Error')
    }
})

module.exports = router
  