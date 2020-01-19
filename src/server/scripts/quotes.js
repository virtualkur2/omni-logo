const dbHelper = require('../server/helpers/db.helper');
const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  quote_en: {
    type: String,
    required: true
  },
  quote_es: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
});

