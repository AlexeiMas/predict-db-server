const { Schema, model } = require('mongoose');

const schema = new Schema({
  token: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date, default: Date.now },
});

module.exports = model('approval-tokens', schema, 'approval-tokens');
