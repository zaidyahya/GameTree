const {
    MONGO_USERNAME = 'admin',
    MONGO_PASSWORD = 'secret',
    MONGO_HOST = 'localhost',
    MONGO_PORT = 27017,
    MONGO_DATABASE = 'test'
  } = process.env

const MONGO_URI = `mongodb://${MONGO_USERNAME}:${
  encodeURIComponent(MONGO_PASSWORD)
}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`

const MONGO_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

module.exports = { MONGO_URI, MONGO_OPTIONS }