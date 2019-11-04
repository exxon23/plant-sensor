module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'localhost',
  mongoDBUri: process.env.MONGO_DB_URI,
  thingSpeakWriteKey: process.env.THINGSPEAK_WRITE_KEY,
}