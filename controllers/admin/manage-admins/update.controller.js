const mongoose = require('mongoose');
const db = require('../../../models');

module.exports = async function update(req, res) {
  try {
    const { adminId } = { ...req.params };
    if (mongoose.isValidObjectId(adminId) === false) return res.status(400).send(`Invalid admin id: #${adminId}`);

    const updated = await db.Admins.findByIdAndUpdate(adminId, { ...req.body }, { new: true });
    if (!updated) return res.status(400).send(`Not found admin id: #${adminId}`);

    const json = updated.toJSON();
    delete json.__v;
    delete json.password;
    const admin = { id: updated._id, ...json };

    return res.status(200).json(admin);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
