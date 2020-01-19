const mongoose = require('mongoose');

const LogoSchema = new mongoose.Schema({
  path: {
    type: String,
    required: `Field 'path' is required.`
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  title: {
    type: String,
    required: `Field 'title' is required.`
  },
  originalName: {
    type: String,
    required: `Field 'originalName' is required.`
  },
  readOnly: {
    type: Boolean,
    default: false
  }
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});

module.exports = mongoose.model('Logo', LogoSchema);
