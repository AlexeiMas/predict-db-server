const { User } = require('../../../models');

module.exports = async (req, res) => {
  const ALREADY_EXISTS = 'User already exists';
  const DEFAULT_CONFIRMED = true;

  try {
    const body = { ...req.body };
    const exist = await User.findOne({ email: body.email.trim() });

    if (exist) return res.status(403).send(ALREADY_EXISTS);
    body.confirmed = DEFAULT_CONFIRMED;

    const created = await User.create(body);
    if (!created) return res.status(400).send('User is not created');

    const json = created.toJSON();
    delete json.__v;
    delete json.password;

    const user = { id: json._id, ...json };
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
