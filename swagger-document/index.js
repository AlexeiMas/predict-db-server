const definitions = require('./definitions');
const paths = require('./paths');
const securityDefinitions = require('./securityDefinitions');

module.exports = {
  swagger: '2.0',
  info: {
    description: '<a rel="noopener noreferrer" target="_self" href="/">Go Back to Welcome</a>',
    version: '0.1.0',
    title: 'Imagen Therapeutics API',
  },
  basePath: '/v1',
  tags: [{ name: 'search' }, { name: 'details' }],
  schemes: ['http', 'https'],
  paths,
  securityDefinitions,
  definitions,
};
