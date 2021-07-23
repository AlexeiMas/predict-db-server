const { Schema, model } = require('mongoose');

const schema = new Schema({
  token: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = model('refresh-tokens', schema, 'refresh-tokens');
