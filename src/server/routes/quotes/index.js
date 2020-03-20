const path = require('path');
const baseAPIpath = require('../../../config').env.BASE_URI;
const quoteController = require('../../controllers/quote.controller');

const quotesRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'quotes/random'))
    .get(quoteController.getRandom);
  return router
}

module.exports = quotesRoutes;