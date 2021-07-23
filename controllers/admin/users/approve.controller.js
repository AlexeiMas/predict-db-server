const { User, ApprovalToken } = require('../../../models');
const services = require('../../../services');

module.exports = async (req, res) => {
  const SUCCESS = 'User has been approved';
  const TOKEN_NOT_FOUND = 'Token not found';
  const USER_NOT_FOUND = 'User not found';

  try {
    const { userId, token } = req.params;

    const existToken = await ApprovalToken.findOne({ token });

    if (!existToken) return res.status(404).send(TOKEN_NOT_FOUND);

    const existUser = await User.findById(existToken.user);

    if (!existUser || userId !== existToken.user.toString()) return res.status(404).send(USER_NOT_FOUND);

    existUser.enabled = true;
    existUser.save();

    existToken.remove();

    await services.email.sendEmail({
      to: existUser.email,
      subject: 'Your account has been enabled',
      html: `
        <h1>Your account has been enabled</h1>
        <p>You can login into dashboard now</p>
      `,
    });

    return res.status(200).send(SUCCESS);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
