const crypto = require('crypto');
const { User, ResetPasswordToken } = require('../../models');
const services = require('../../services');

const sendRecoveryLink = async (req, res) => {
  const SUCCESS = 'Success';
  const NOT_FOUND = 'User not found';

  try {
    const { email } = req.body;

    const exist = await User.findOne({ email });

    if (!exist) return res.status(404).send(NOT_FOUND);

    const token = await ResetPasswordToken.create({
      user: exist._id, // eslint-disable-line
      token: crypto.randomBytes(32).toString('hex'),
    });

    const resetPasswordUrl = `${process.env.RESET_PASSWORD_URL}?token=${token.token}`;

    await services.email.sendEmail({
      to: email,
      subject: 'Recovery password',
      html: `
        <h1>Reset password</h1>
        <p>Click URL below to reset your password and create new one</p>
        <p><a href="${resetPasswordUrl}">Reset Password</a></p>
        <p>If you don't see the link, copy this URL to your browser: ${resetPasswordUrl}</p>
      `,
    });

    return res.status(200).send(SUCCESS);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const checkToken = async (req, res) => {
  const NOT_FOUND = 'Token not found';

  try {
    const { token } = req.params;

    const existToken = await ResetPasswordToken.findOne({ token });

    if (!existToken) return res.status(404).send(NOT_FOUND);

    return res.status(200).json({ userId: existToken.user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const setupNewPassword = async (req, res) => {
  const SUCCESS = 'Success';
  const TOKEN_NOT_FOUND = 'Token not found';
  const USER_NOT_FOUND = 'User not found';

  try {
    const { userId, token } = req.params;
    const { password } = req.body;

    const existToken = await ResetPasswordToken.findOne({ token });

    if (!existToken) return res.status(404).send(TOKEN_NOT_FOUND);

    const existUser = await User.findById(existToken.user);

    if (!existUser || userId !== existToken.user.toString()) return res.status(404).send(USER_NOT_FOUND);

    existUser.password = password;

    await existUser.save();
    await existToken.remove();

    return res.status(200).send(SUCCESS);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = { sendRecoveryLink, checkToken, setupNewPassword };
