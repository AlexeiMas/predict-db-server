const Admin = require('../admins.model');

const ADMIN = {
  email: 'admin@admin.com',
  password: 'admin',
  firstName: 'Admin',
  lastName: 'Admin',
};

const fillAdmin = () => Admin
  .findOne({ email: ADMIN.email })
  .then((exists) => (exists !== null ? exists : Admin.create(ADMIN)));

module.exports = { fillAdmin };
