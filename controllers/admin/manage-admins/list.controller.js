const db = require('../../../models');
const utils = require('../../../utils');

module.exports = async function list(req, res) {
  try {
    const query = utils.parseQuery({ ...req.query });
    const { limit = 20, skip = 0, sort = [] } = query;

    const count = await db.Admins.countDocuments();
    const foundAdmins = await db.Admins.find({}, { __v: 0, password: 0 }, { skip, limit, sort: [sort] }).lean();
    const admins = foundAdmins.map(({ _id, ...rest }) => ({ id: _id, _id, ...rest }));

    res.set('Content-Range', count);
    return res.status(200).json(admins);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
