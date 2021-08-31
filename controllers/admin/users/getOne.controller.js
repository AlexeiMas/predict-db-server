const { User } = require('../../../models');

module.exports = async (req, res) => {
  const NOT_FOUND = 'User not found';

  try {
    const { id } = req.params;
    const exist = await User.findById(id).lean();

    if (!exist) return res.status(404).send(NOT_FOUND);

    const filtered = {
      id: exist._id, // eslint-disable-line
      email: exist.email,
      firstName: exist.firstName,
      lastName: exist.lastName,
      companyName: exist.companyName,
      jobTitle: exist.jobTitle,
      confirmed: exist.confirmed !== undefined ? exist.confirmed : false,
      enabled: exist.enabled !== undefined ? exist.enabled : false,
    };

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
