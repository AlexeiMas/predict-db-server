const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const NOT_FOUND = 'Token not found';
  const INVALID_TOKEN = 'Invalid token';
  const TOKEN_EXPIRED = 'Token expired';

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) return res.status(404).send(NOT_FOUND);

    jwt.verify(token, process.env.JWT_SECRET);

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send(TOKEN_EXPIRED);
    }

    return res.status(401).send(INVALID_TOKEN);
  }
};
