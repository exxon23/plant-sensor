module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'localhost',
  MONGO_DB_URI: process.env.MONGO_DB_URI,
  PROTOCOL: process.env.NODE_ENV === 'development' ? 'http' : 'https',
  RUN_WORKERS: process.env.RUN_WORKERS === 'true'
}
