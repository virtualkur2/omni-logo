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
  },
  getByAuthor: (req, res, next) => {
    if(!req.query || !req.query.name) {
      const error = new Error(`No author provided, please use url param: '${req.path}?name=<authorName>'`);
      console.log(req.hostname);
      error.httpStatusCode = 400;
      return next(error);
    }
    Quote.getByAuthor(req.query.name, (error, quotes) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      return res.status(200).json({
        message: `Quotes by ${req.query.name}.`,
        data: quotes,
      });
    });
  },
  groupByAuthor: (req, res, next) => {
    Quote.groupByAuthor((error, quotes) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      return res.status(200).json({
        message: `All quotes grouped by author.`,
        data: quotes,
      });
    });
  }
}

module.exports = quoteController;