const session = require('express-session');
const connectRedis = require('connect-redis');
const Redis = require('ioredis');
const mongoose = require('mongoose');

const { APP_PORT } = require('./config/app.js');
const { REDIS_OPTIONS } = require('./config/cache.js');
const { MONGO_URI, MONGO_OPTIONS } = require('./config/db.js');

const { createApp } = require('./app.js');
const { initializeIO } = require('./io.js');

// When a user is registered, and another /register is sent with the same payload, an unhandled promise exception occurs.. need to wrap in async fnc
;(async () => {
    await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
    const RedisStore = connectRedis(session);
    const client = new Redis(REDIS_OPTIONS);
    const store = new RedisStore({ client });

    const app = createApp(store);
    initializeIO(app);
    app.listen(APP_PORT, () => console.log(`Server has started on port ${APP_PORT}`));
})()