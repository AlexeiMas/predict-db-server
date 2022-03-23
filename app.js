const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-document');
const { fillAdmin } = require('./models/seeds/admins.seed');

const USE_SWAGGER = /true/gi.test(process.env.USE_SWAGGER);
const USE_LOGGER = /^development$/.test(process.env.NODE_ENV);

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX = 140; // limit each IP to 140 requests per windowMs
const LIMITER = rateLimit({ windowMs: WINDOW_MS, max: MAX });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*', exposedHeaders: ['Content-Range'], preflightContinue: true }));
app.use(express.json({ extended: true }));

if (USE_LOGGER) app.use(logger('dev'));
if (USE_SWAGGER) app.use('/v1/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/v1/search', helmet(), LIMITER, require('./routes/search.route'));
app.use('/v1/details', helmet(), LIMITER, require('./routes/details.route'));
app.use('/v1/filters', helmet(), LIMITER, require('./routes/filters/index'));
app.use('/v1/export', helmet(), LIMITER, require('./routes/export.route'));
app.use('/v1/plot-scatter', helmet(), LIMITER, require('./routes/plots/scatter.route'));
app.use('/v1/plot-violin', helmet(), LIMITER, require('./routes/plots/violin.route'));
app.use('/v1/plot-heatmap', helmet(), LIMITER, require('./routes/plots/heatmap.route'));
app.use('/v1/plot-oncoprint', helmet(), LIMITER, require('./routes/plots/oncoprint.route'));
app.use('/v1/plot-lollipop', helmet(), LIMITER, require('./routes/plots/lollipop.route'));
app.use('/v1/auth', helmet(), LIMITER, require('./routes/auth/index'));
app.use('/v1/admin/auth', helmet(), LIMITER, require('./routes/admin/auth'));
app.use('/v1/admin/users', helmet(), LIMITER, require('./routes/admin/users/index'));
app.use('/v1/admin/manage-admins', require('./routes/admin/manage-admins/index'));

fillAdmin();

module.exports = app;
