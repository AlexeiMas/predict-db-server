const mongoose = require('mongoose');
const db = require('../../../models');

module.exports = async function get(req, res) {
  try {
    const { adminId } = { ...req.params };
    if (mongoose.isValidObjectId(adminId) === false) return res.status(400).send(`Invalid admin id: #${adminId}`);

    const exist = await db.Admins.findById(adminId, { __v: 0, password: 0 });
    if (!exist) return res.status(404).send(`Not found admin id: #${adminId}`);

    const json = exist.toJSON();

    const admin = { id: json._id, ...json };
    return res.status(200).json(admin);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
