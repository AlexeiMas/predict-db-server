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
      subject: 'Your PredictDb account has been approved',
      html: `
        <h1>Welcome to PredictDb! ��</h1>
        <br>
        <p>Your account for PredictDb is now ready to go.</p>
        <br>
        <p>You can login into <a href='https://pdb.imagentherapeutics.com'>PredictDb</a> now. ��</p>
      `,
    });

    return res.status(200).send(SUCCESS);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
