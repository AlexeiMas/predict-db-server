const { promisify } = require('util');
const Redis = require('redis');

const host = process.env.REDIS_HOST;

const connection = `redis://${host}`;
const redisClient = Redis.createClient(connection);

redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
redisClient.delAsync = promisify(redisClient.del).bind(redisClient);

redisClient.on('error', (err) => console.error('Redis error.', err)); // eslint-disable-line

module.exports = redisClient;
