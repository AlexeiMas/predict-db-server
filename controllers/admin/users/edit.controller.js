const { User } = require('../../../models');
const services = require('../../../services');

module.exports = async (req, res) => {
  const NOT_FOUND = 'User not found';
  const ALREADY_EXISTS = 'User already exists';

  try {
    const { id } = req.params;
    const {
      email, password, firstName, lastName, companyName, jobTitle, enabled,
    } = req.body;

    const exist = await User.findOne({ email, _id: { $ne: id } });

    if (exist) return res.status(403).send(ALREADY_EXISTS);

    const data = {
      ...(email ? { email } : {}),
      ...(password ? { password } : {}),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(companyName ? { companyName } : {}),
      ...(jobTitle ? { jobTitle } : {}),
      ...(enabled !== undefined ? { enabled } : {}),
    };

    const updated = await User.findOneAndUpdate({ _id: id }, data, { new: true });

    if (!updated) return res.status(404).send(NOT_FOUND);

    if (enabled === true) {
      await services.email.sendEmail({
        to: updated.email,
        subject: 'Welcome to PredictDb!',
        html: `
          <h1>Welcome to PredictDb!</h1>
          <br>
          <p>Your account for PredictDb is now ready to go.</p>
          <br>
          <p>You can login into <a href='https://pdb.imagentherapeutics.com'>PredictDb here</a>.</p>
          <br/>
          <br/>
          <br/>
          <p class="x_MsoNormal" style="text-align:justify"><a href="https://imagentherapeutics.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-linkindex="0"><span lang="EN-GB" style="color:windowtext; text-decoration:none"><img naturalheight="0" naturalwidth="0" src="https://imagentherapeutics.com/wp-content/uploads/2020/06/Logo-New-Rect-Smoothed-1.png" border="0" width="253" height="121" id="x_Picture_x0020_1" style="width: 2.6333in; height: 1.2583in;" ></span></a><span lang="EN-GB" style=""></span></p>
        `,
      });
    }
    if (enabled === false) {
      await services.email.sendEmail({
        to: updated.email,
        subject: 'Your account has been blocked',
        html: `
          <h1>Your account has been blocked</h1>
          <p>Contact with our administrator to get information</p>
        `,
      });
    }

    const filtered = {
      id: updated._id, // eslint-disable-line
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      companyName: updated.companyName,
      jobTitle: updated.jobTitle,
      confirmed: updated.confirmed,
      enabled: updated.enabled,
    };

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
