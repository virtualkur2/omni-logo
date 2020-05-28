const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  pending: {
    type: Boolean,
    default: true
  },
  rejected: {
    type: Boolean,
    default: false
  }
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});

QuoteSchema.statics = {
  getRandom: function(filter, cb) {
    this.estimatedDocumentCount(function(err, count) {
      if(err) {
        return cb(err, null);
      }
      const rand = Math.floor(Math.random() * count);
      this.findOne(filter).skip(rand).exec(cb);
    }.bind(this));
  },
  getByAuthor: function(author, cb) {
    const authorAgregate = [
      {$match: { author: author}},
      {$group: 
        {_id: '$author', quotes:{ $push: {_id: '$_id', quote: '$quote', created: '$created', approved: '$approved', pending: '$pending', rejected: '$rejected'}}}
      }
    ];
    this.aggregate(authorAgregate).exec(cb);
  },
  groupByAuthor: function(cb) {
    const groupAggregate = [
      {$project: {updated: 0}},
      {$group: 
        {_id: '$author', quotes:{ $push: {_id: '$_id', quote: '$quote', created: '$created', approved: '$approved', pending: '$pending', rejected: '$rejected'}}}
      }
    ];
    this.aggregate(groupAggregate).exec(cb);
  }
}

const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = Quote;
