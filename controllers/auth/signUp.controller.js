const { v4: uuid } = require('uuid');
const { User, ApprovalToken } = require('../../models');
const services = require('../../services');

const generateApprovalToken = async (userId) => {
  const { token } = await ApprovalToken.create({ token: uuid(), user: userId });
  return token;
};

module.exports = async (req, res) => {
  const ALREADY_EXISTS = 'User already exists';
  try {
    const exist = await User.findOne({ email: req.body.email.trim() });

    if (exist) return res.status(403).send(ALREADY_EXISTS);

    const created = await User.create(req.body);

    const userId = created._id; // eslint-disable-line
    const credentials = await services.jwt.updateTokens(userId);
    const user = {
      id: userId,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
    };

    const token = await generateApprovalToken(userId);
    const approvalLink = `${process.env.APP_URL}/v1/admin/users/approve/${userId}/${token}`;

    await services.email.sendEmail({
      to: process.env.SENDGRID_ADMIN_EMAIL,
      subject: 'New user was signed up',
      html: `
        <h1>New user was signed up</h1>
        <p><b>Email address</b>: ${created.email}</p>
        <p><b>First name</b>: ${created.firstName}</p>
        <p><b>Last name</b>: ${created.lastName}</p>
        <p><b>Company</b>: ${created.companyName}</p>
        <p></p>
        <p>Click to link below to approve this user:</p>
        <p><a href="${approvalLink}">Approve user</a></p>
        <p></p>
        <p>If you don't see the link, copy and paste string below into your browser: ${approvalLink}</p>
      `,
    });

    return res.json({ user, credentials });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
