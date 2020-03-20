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

QuoteSchema.statics.getRandom = function(cb) {
  this.estimatedDocumentCount(function(err, count) {
    if(err) {
      return cb(err, null);
    }
    const rand = Math.floor(Math.random() * count);
    this.findOne().skip(rand).exec(cb);
  }.bind(this));
}

const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = Quote;
