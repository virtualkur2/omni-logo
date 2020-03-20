const Quote = require('../models/quote.model');

const quoteController = {
  getRandom: (req, res, next) => {
    Quote.getRandom((error, quote) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      return res.status(200).json({
        message: 'Random quote selected.',
        data: quote
      });
    });
  }
}

module.exports = quoteController;