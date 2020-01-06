const mongoose = require('mongoose')

const { MONGO_DB_URI } = require('./config')

const connectToMongoose = async () => {
  mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true })
  console.log('MongoDB connected to Mlab database')
}

module.exports = connectToMongoose
