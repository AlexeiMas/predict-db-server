const jwt = require('jsonwebtoken');
const RefreshToken = require('../../models/refreshTokens.model');
const services = require('../../services');

const redisKey = ((...args) => args.map((i) => i.slice()).join(': ').replace(/\s+/gi, '').trim());

module.exports = async (req, res) => {
  const NOT_FOUND = 'Token not found';

  try {
    const { token } = req.body;

    const authRk = redisKey('auth', token);
    const result = await services.redis.getAsync(authRk);

    if (/false|null/gi.test(result)) return res.status(404).send(NOT_FOUND);

    await services.redis.delAsync(authRk);

    const decoded = await jwt.decode(result);
    const dbToken = await RefreshToken.findOne({ user: decoded.userId });

    if (!dbToken) return res.status(404).send(NOT_FOUND);

    const credentials = await services.jwt.updateTokens(dbToken.user);
    const user = { id: dbToken.user };

    return res.json({ user, credentials });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
