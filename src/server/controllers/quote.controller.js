const Quote = require('../models/quote.model');

const quoteController = {
  get: (req, res, next) => {
    if(!req.quote) {
      const error = new ReferenceError('Data mismatch');
      error.httpStatusCode = 500;
      return next(error);
    }
    return res.status(200).json({
      message: 'Quote fetched',
      data: req.quote
    });
  },
  getAll: (req, res, next) => {
    Quote.estimatedDocumentCount((error, documentCount) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      if(req.query && req.query.search) {
        const searchTerm = new RegExp(req.query.search, 'i');
        Quote.find({quote: searchTerm}, (error, quotes) => {
          if(error) {
            error.httpStatusCode = 500;
            return next(error);
          }
          return res.status(200).json({
            message: quotes.length ? 'Search term did produce at least one result' : 'Search term did not produce any result',
            data: quotes,
            searchTerm: req.query.search,
            quotesReturned: quotes.length,
            totalQuotes: documentCount
          });
        });
      } else {
        let limit = (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) < 0) ? 0 : (parseInt(req.query.limit) > 15 ? 15 : parseInt(req.query.limit));
        let page = (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) < 1 || !limit) ? 1 : parseInt(req.query.page);
        paginateDocuments(Quote, {}, page, limit, (error, quotes) => {
          if(error) {
            error.httpStatusCode = 500;
            return next(error);
          }
          return res.status(200).json({
            message: 'All quotes',
            data: quotes,
            retrieved: quotes.length,
            total: documentCount,
            page,
            limit
          });
        });
      }
    });
  },
  getRandom: (req, res, next) => {
    if(req.query.approved) {
      if (req.query.approved === 'true' || req.query.approved === 'TRUE' || req.query.approved === 'True') {
        req.query.approved = true;
      } else if(req.query.approved === 'false' || req.query.approved === 'FALSE' || req.query.approved === 'False') {
        req.query.approved = false;
      } else {
        delete req.query.approved;
      }
    }
    Quote.getRandom(req.query, (error, quote) => {
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
  },
  getAllAuthors: (req, res, next) => {
    let sortFunction;
    if(req.query && req.query.sort) {
      if(req.query.sort === '1' ||
         req.query.sort === '+1' || /*Sugerencia de Asier el tocapelotas*/
         req.query.sort === 'asc' ||
         req.query.sort === 'Asc' || 
         req.query.sort === 'ASC') {
        sortFunction = (a, b) => {
          if(a > b) {
            return 1;
          } else if(b > a) {
            return -1;
          } else {
            return 0;
          }
        }
      } else if(req.query.sort === '-1' || req.query.sort === 'desc' || req.query.sort === 'Desc' || req.query.sort === 'DESC') {
        sortFunction = (a, b) => {
          if(a < b) {
            return 1;
          } else if(b < a) {
            return -1;
          } else {
            return 0;
          }
        }
      } else {
        const error = new TypeError(`Sort must be indicated using valid values. Ascending/Descending sort please use query parameter: 'sort=1' or 'sort=asc' or 'sort=DESC' or 'sort=-1' or 'sort=Desc'`);
        error.httpStatusCode = 400;
        return next(error);
      }
    }
    Quote.distinct('author', (error, authors) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      let data = sortFunction ? authors.sort(sortFunction) : authors;
      let limit = (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) < 1) ? 0 : (parseInt(req.query.limit) > 15 ? 15 : parseInt(req.query.limit));
      let page = (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) < 1 || !limit) ? 1 : parseInt(req.query.page);
      if(!limit) {
        return res.status(200).json({
          message: 'Authors gathered',
          data: data,
          retrieved: data.length,
          total: data.length,
          page,
          limit
        });
      }
      let startIndex = (page - 1) * limit;
      let endIndex = startIndex + limit;
      let pagedData = [];
      if(startIndex < data.length) {
        pagedData = endIndex >= data.length ? data.slice(startIndex) : data.slice(startIndex, endIndex);
      }
      return res.status(200).json({
        message: 'Authors gathered',
        data: pagedData,
        retrieved: pagedData.length,
        total: data.length,
        page,
        limit
      });
    });
  },
  quoteById: (req, res, next, id) => {
    if(!id) {
      const error = new ReferenceError('No ID provided');
      error.httpStatusCode = 400;
      return next(error);
    }
    Quote.findById(id, (error, quote) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      req.quote = quote;
      next();
    });
  }
}

const paginateDocuments = (Model, query, page, limit, cb) => {
  return Model.find(query)
    .skip(page > 0 ? ((page - 1) * limit) : 0 )
    .limit(limit)
    .exec(cb);
}

module.exports = quoteController;