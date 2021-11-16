const {
    REDIS_PORT = 6379,
    REDIS_HOST = 'localhost',
    REDIS_PASSWORD = 'secret'    
} = process.env

REDIS_OPTIONS = {
    port: REDIS_PORT,
    host: REDIS_HOST,
    password: REDIS_PASSWORD
}

module.exports = { REDIS_OPTIONS };