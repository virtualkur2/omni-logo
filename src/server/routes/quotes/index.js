const path = require('path');
const baseAPIpath = require('../../../config').env.BASE_URI;
const quoteController = require('../../controllers/quote.controller');

const quotesRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'quotes/random'))
    .get(quoteController.getRandom);

  router.route(path.join(baseAPIpath, '/quotes/author'))
    .get(quoteController.getByAuthor);
  
  router.route(path.join(baseAPIpath, '/quotes/group/author'))
    .get(quoteController.groupByAuthor);

  return router
}

module.exports = quotesRoutes;