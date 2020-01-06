module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'localhost',
  MONGO_DB_URI: process.env.MONGO_DB_URI,
  thingSpeakWriteKey: process.env.THINGSPEAK_WRITE_KEY
}
