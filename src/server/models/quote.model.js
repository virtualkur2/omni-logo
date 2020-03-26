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

QuoteSchema.statics = {
  getRandom: function(cb) {
    this.estimatedDocumentCount(function(err, count) {
      if(err) {
        return cb(err, null);
      }
      const rand = Math.floor(Math.random() * count);
      this.findOne().skip(rand).exec(cb);
    }.bind(this));
  },
  getByAuthor: function(author, cb) {
    const authorAgregate = [
      {$match: { author: author}},
      {$group: 
        {_id: '$author', quotes:{ $push: '$quote'}}
      }
    ];
    this.aggregate(authorAgregate).exec(cb);
  },
  groupByAuthor: function(cb) {
    const groupAggregate = [
      {$project: {author: 1, quote: 1, _id:0}},
      {$group: 
        {_id: '$author', quotes:{ $push: '$quote'}}
      }
    ];
    this.aggregate(groupAggregate).exec(cb);
  }
}

const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = Quote;
