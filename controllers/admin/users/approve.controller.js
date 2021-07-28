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
      subject: 'Welcome to PredictDb!',
      html: `
        <h1>Welcome to PredictDb!/h1>
        <br>
        <p>Your account for PredictDb is now ready to go.</p>
        <br>
        <p>You can login into <a href='https://pdb.imagentherapeutics.com'>PredictDb here</a>./p>
        <br/>
        <br/>
        <br/>
        <p class="x_MsoNormal" style="text-align:justify"><a href="https://imagentherapeutics.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-linkindex="0"><span lang="EN-GB" style="color:windowtext; text-decoration:none"><img naturalheight="0" naturalwidth="0" src="https://imagentherapeutics.com/wp-content/uploads/2020/06/Logo-New-Rect-Smoothed-1.png" border="0" width="253" height="121" id="x_Picture_x0020_1" style="width: 2.6333in; height: 1.2583in;" ></span></a><span lang="EN-GB" style=""></span></p>
      `,
    });

    return res.status(200).send(SUCCESS);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
