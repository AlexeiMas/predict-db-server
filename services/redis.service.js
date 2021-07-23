const { promisify } = require('util');
const Redis = require('redis');

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;

const connection = `redis://${host}:${port}/1`;
const redisClient = Redis.createClient(connection);

redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
redisClient.delAsync = promisify(redisClient.del).bind(redisClient);

redisClient.on('error', (err) => console.error('Redis error.', err)); // eslint-disable-line

module.exports = redisClient;
