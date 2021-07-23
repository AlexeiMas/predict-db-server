const bcrypt = require('bcryptjs');
const Admin = require('../admins.model');

const ADMIN = {
  email: 'admin@admin.com',
  password: 'admin',
  firstName: 'Admin',
  lastName: 'Admin',
};

const fillAdmin = async () => {
  try {
    const exist = await Admin.findOne({ email: ADMIN.email });

    if (exist) return;

    await Admin.create({
      email: ADMIN.email,
      password: bcrypt.hashSync(ADMIN.password, 8),
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
    });
  } catch (error) {
    console.log(error); // eslint-disable-line
  }
};

module.exports = { fillAdmin };
