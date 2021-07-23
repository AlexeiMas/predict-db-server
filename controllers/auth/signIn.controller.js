const bcrypt = require('bcryptjs');
const User = require('../../models/users.model');
const jwtService = require('../../services/jwt.service');

module.exports = async (req, res) => {
  const NOT_FOUND = 'User not found';
  const WRONG_PASSWORD = 'Wrong password';
  const BLOCKED = 'Your account is not approved by administrator';

  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });

    if (!exist) return res.status(404).send(NOT_FOUND);

    const valid = bcrypt.compareSync(password, exist.password);

    if (!valid) return res.status(403).send(WRONG_PASSWORD);

    if (!exist.enabled) return res.status(403).send(BLOCKED);

    const credentials = await jwtService.updateTokens(exist._id); // eslint-disable-line
    const user = {
      id: exist._id, // eslint-disable-line
      firstName: exist.firstName,
      lastName: exist.lastName,
      email: exist.email,
    };

    return res.json({ user, credentials });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
