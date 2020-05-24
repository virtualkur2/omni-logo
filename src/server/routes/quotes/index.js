const path = require('path');
const baseAPIpath = require('../../../config').env.BASE_URI;
const quoteController = require('../../controllers/quote.controller');

const quotesRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'quotes/random'))
    .get(quoteController.getRandom);

  router.route(path.join(baseAPIpath, '/quotes/authors'))
    .get(quoteController.getAllAuthors);
  
  router.route(path.join(baseAPIpath, '/quotes/author'))
    .get(quoteController.getByAuthor);
  
  router.route(path.join(baseAPIpath, '/quotes/group/author'))
    .get(quoteController.groupByAuthor);
  
  router.route(path.join(baseAPIpath, '/quotes/:quoteId'))
    .get(quoteController.get);

  router.route(path.join(baseAPIpath, '/quotes'))
    .get(quoteController.getAll);

  router.param('quoteId', quoteController.quoteById);
  
  return router
}

module.exports = quotesRoutes;