const mongoose = require('mongoose');

const LogoSchema = new mongoose.Schema({
  path: {
    type: String,
    required: '\'path\' field is required.'
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  title: {
    type: String,
    default: `OmniPC Logo Contest - ${Date.now()}`
  }
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});

module.exports = mongoose.model('Logo', LogoSchema);
