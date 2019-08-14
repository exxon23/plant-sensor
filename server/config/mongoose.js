const mongoose = require('mongoose')

const { mongoDBUri } = require('./config')

// Map global promise - get rid of warning
mongoose.Promise = global.Promise

const connectToMongoose = async () => {
// Connect to mongoose
  try {
    mongoose.connect(mongoDBUri, { useNewUrlParser: true })
    console.log('\x1b[35m', '[server]', '\x1b[0m', 'MongoDB connected to Mlab database')
  } catch (err) {
    console.log('\x1b[35m', '[server]', '\x1b[0m', err)
  }
}

module.exports = connectToMongoose
