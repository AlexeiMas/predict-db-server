const { User } = require('../../../models');
const { parseQuery } = require('../../../utils');

module.exports = async (req, res) => {
  try {
    const query = parseQuery(req.query);
    const { limit = 20, skip = 0, sort = [] } = query;

    const count = await User.countDocuments();

    const [sortField, sortDirection] = sort[0];
    const sortOptions = [(sortField !== 'id' ? sortField : '_id'), sortDirection];

    const users = await User.find({}, {}, { skip, limit, sort: [[sortOptions]] }).lean();

    const filtered = users.map((item) => ({
      id: item._id, // eslint-disable-line
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      companyName: item.companyName,
      jobTitle: item.jobTitle,
      confirmed: item.confirmed !== undefined ? item.confirmed : false,
      enabled: item.enabled !== undefined ? item.enabled : false,
    }));

    res.set('Content-Range', count);

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
