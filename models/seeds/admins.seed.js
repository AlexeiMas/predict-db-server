const db = require('../index');

const ADMIN = {
  email: 'admin@admin.com',
  password: 'admin',
  firstName: 'Admin',
  lastName: 'Admin',
};

const fillAdmin = () => db.Admins
  .findOne({ email: ADMIN.email })
  .then((exists) => (exists !== null ? exists : db.Admins.create(ADMIN)));

module.exports = { fillAdmin };
