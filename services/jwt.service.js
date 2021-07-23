const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const moment = require('moment');
const { RefreshToken } = require('../models');
const redis = require('./redis.service');

const ACCESS_EXPIRES = parseInt(process.env.JWT_ACCESS_EXPIRES_SEC || '3600');
const REFRESH_EXPIRES = parseInt(process.env.JWT_REFRESH_EXPIRES_SEC || '10800');

const redisKey = ((...args) => args.map((i) => i.slice()).join(': ').replace(/\s+/gi, '').trim());

const generateAccessToken = async (userId) => {
  const payload = {
    userId,
    type: 'access',
  };

  const options = { expiresIn: ACCESS_EXPIRES };
  const secret = process.env.JWT_SECRET;

  return jwt.sign(payload, secret, options);
};

const generateRefreshToken = async () => {
  const payload = {
    tokenUuid: uuid(),
    type: 'refresh',
  };

  const options = { expiresIn: REFRESH_EXPIRES };
  const secret = process.env.JWT_SECRET;

  return {
    tokenUuid: payload.tokenUuid,
    token: jwt.sign(payload, secret, options),
  };
};

const replaceDbRefreshTokens = async (tokenUuid, userId) => {
  await RefreshToken.deleteMany({ user: userId });

  return RefreshToken.create({ token: tokenUuid, user: userId });
};

const updateTokens = async (userId) => {
  const secret = process.env.JWT_SECRET;
  const accessToken = await generateAccessToken(userId);
  const refreshToken = await generateRefreshToken();

  const decodedAccess = jwt.verify(accessToken, secret);
  const decodedRefresh = jwt.verify(refreshToken.token, secret);

  const authRK = redisKey('auth', refreshToken.token);

  await redis.setAsync(authRK, accessToken, 'EX', REFRESH_EXPIRES);
  await replaceDbRefreshTokens(refreshToken.tokenUuid, userId);

  return {
    accessToken,
    refreshToken: refreshToken.token,
    accessExp: moment(decodedAccess.exp * 1000).format('HH:mm:ss'),
    refreshExp: moment(decodedRefresh.exp * 1000).format('HH:mm:ss'),
    accessExpMS: moment(decodedAccess.exp * 1000).valueOf(),
    refreshExpMS: moment(decodedRefresh.exp * 1000).valueOf(),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  replaceDbRefreshTokens,
  updateTokens,
};
