const bcrypt = require('bcryptjs');
const { User } = require('../../../models');

module.exports = async (req, res) => {
  const ALREADY_EXISTS = 'User already exists';

  try {
    const {
      email, password, firstName, lastName, companyName, jobTitle, enabled,
    } = req.body;

    const exist = await User.findOne({ email });

    if (exist) return res.status(403).send(ALREADY_EXISTS);

    const cryptedPassword = bcrypt.hashSync(password, 8);
    const data = {
      email,
      password: cryptedPassword,
      firstName,
      lastName,
      companyName,
      jobTitle,
      confirmed: true, // TODO: Add email confirmation
      enabled,
    };

    const created = await User.create(data);

    const filtered = {
      id: created._id, // eslint-disable-line
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
      companyName: created.companyName,
      jobTitle: created.jobTitle,
      confirmed: created.confirmed,
      enabled: created.enabled,
    };

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
