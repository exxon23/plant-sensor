const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')

// import routes
const measure = require('./routes/measure')

const app = express()
dotenv.config({ path: path.resolve(__dirname, './.env') })

const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'localhost'

app.use(cors())
app.use(bodyParser.json())
app.use('/measure', measure)

app.listen(PORT, () => {
    console.log('\x1b[35m', '[server]', '\x1b[0m', `Server started on port ${PORT}`)
})