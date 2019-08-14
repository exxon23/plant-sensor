const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const { measure } = require('./api/routes')
const { port } = require('./config/config')
const connectMongoose = require('./config/mongoose')

const app = express()

app.use(cors())
app.use(helmet())
app.use(bodyParser.json())

app.use('/measure', measure)

connectMongoose()

app.listen(port, () => {
  console.log('\x1b[35m', '[server]', '\x1b[0m', `Server started on port ${port}`)
})
