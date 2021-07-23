const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({
  to, subject, text, html,
}) => {
  try {
    const message = {
      to,
      from: { name: process.env.SENDGRID_FROM_NAME, email: process.env.SENDGRID_FROM_EMAIL },
      subject,
      text,
      html,
    };
    await sgMail.send(message);
  } catch (error) {
    console.log(error.response.body); // eslint-disable-line
  }
};

module.exports = { sendEmail };
