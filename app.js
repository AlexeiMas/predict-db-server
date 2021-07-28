const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { fillAdmin } = require('./models/seeds/admins.seed');

const app = express();
const useSwagger = /true/gi.test(process.env.USE_SWAGGER);
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 140, // limit each IP to 140 requests per windowMs
});

app.use(helmet());
app.use(cors({
  origin: '*',
  exposedHeaders: ['Content-Range'],
  preflightContinue: true,
}));
app.use(express.json({ extended: true }));
app.use(limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

if (useSwagger) {
  app.use('/v1/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use('/v1/search', require('./routes/search.route'));
app.use('/v1/details', require('./routes/details.route'));
app.use('/v1/filters', require('./routes/filters/index'));
app.use('/v1/export', require('./routes/export.route'));
app.use('/v1/auth', require('./routes/auth/index'));
app.use('/v1/admin/auth', require('./routes/admin/auth/index'));
app.use('/v1/admin/users', require('./routes/admin/users/index'));

fillAdmin();

module.exports = app;
