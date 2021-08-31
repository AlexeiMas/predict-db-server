const db = require('../../../models');

module.exports = async function create(req, res) {
  try {
    const body = { ...req.body };
    const exists = await db.Admins.exists({ email: body.email });
    if (exists) return res.status(403).send(`Email: ${body.email} already exists`);

    const created = await db.Admins.create(body);
    if (!created) return res.status(400).send(`Admin: ${body.email} is not created`);

    const json = created.toJSON();
    delete json.__v;
    delete json.password;

    const admin = { id: json._id, ...json };
    return res.status(200).json(admin);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
