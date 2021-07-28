const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || process.env.APP_PORT || 3001;

process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection', err); // eslint-disable-line
  process.exit(1);
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    app.listen(PORT, () => console.log(`Listening on port ${PORT}...`)); // eslint-disable-line
  } catch (e) {
    console.log('[ERROR]', e); // eslint-disable-line
    process.exit(1);
  }
};

start();
