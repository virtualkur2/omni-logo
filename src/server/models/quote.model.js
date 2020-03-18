const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});

const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = Quote;
