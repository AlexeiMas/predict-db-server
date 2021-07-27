const { promisify } = require('util');
const Redis = require('redis');

const host = process.env.REDISCACHEHOSTNAME;
const key = process.env.REDISCACHEKEY;
const port = process.env.REDIS_PORT;
const devenv = process.env.NODE_ENV;

const redisClient = devenv === 'development' ? Redis.createClient(`redis://${host}:${port}/1`) : Redis.createClient(port, host, { auth_pass: key, tls: { servername: host } });  // eslint-disable-line

redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
redisClient.delAsync = promisify(redisClient.del).bind(redisClient);

redisClient.on('error', (err) => console.error('Redis error.', err)); // eslint-disable-line

module.exports = redisClient;
