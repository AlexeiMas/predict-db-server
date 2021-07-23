require('dotenv').config({ path: '.env.local' });
const { describe, it } = require('mocha');
const assert = require('assert').strict;

const environmentConfig = require('./config/environment.config');

const allConfig = [
  environmentConfig,
];

const testEnvParam = (param) => {
  it(param, () => {
    assert.notStrictEqual(process.env[param], undefined, `${param} is not specified`);
  });
};

allConfig.map((config) => describe(config.title, () => {
  config.params.map((param) => testEnvParam(param));
}));
