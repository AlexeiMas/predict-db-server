const { promisify } = require('util');
const Redis = require('redis');

const IS_DEVELOPMENT = /^development$/.test(process.env.NODE_ENV);

const host = process.env.REDISCACHEHOSTNAME;
const key = process.env.REDISCACHEKEY;
const port = process.env.REDIS_PORT || 6379;

const local = { db: 1 };
const external = { auth_pass: key, tls: { servername: host } };
const redisClient = Redis.createClient(port, host, (IS_DEVELOPMENT ? local : external));

redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
redisClient.delAsync = promisify(redisClient.del).bind(redisClient);

redisClient.on('error', (err) => console.error('Redis error.', err)); // eslint-disable-line

module.exports = redisClient;
