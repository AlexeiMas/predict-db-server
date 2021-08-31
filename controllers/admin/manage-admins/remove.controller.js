const mongoose = require('mongoose');
const db = require('../../../models');

module.exports = async function remove(req, res) {
  try {
    const { ids } = { ...req.body };

    const invalidIDS = ids.filter((_id) => mongoose.isValidObjectId(_id) === false);
    if (invalidIDS.length > 0) return res.status(400).send(`Invalid admin ids: #${invalidIDS.join(', ')}`);

    const found = await db.Admins.find({ _id: { $in: ids } }).lean();
    if (found.length === 0) return res.status(400).send('Not found');

    await db.Admins.deleteMany({ _id: { $in: ids } });

    res.set('Content-Range', found.length);
    return res.status(200).json(found);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
