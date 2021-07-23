const { User } = require('../../../models');

module.exports = async (req, res) => {
  const NOT_FOUND = 'Not found';

  try {
    const { ids } = req.body;

    const deleted = await User.find({ _id: { $in: ids } });

    if (!deleted.length) return res.status(404).send(NOT_FOUND);

    await User.deleteMany({ _id: { $in: ids } });

    return res.status(200).json(deleted);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
