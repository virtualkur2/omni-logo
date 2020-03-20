const authRoutes = require('./auth');
const usersRoutes = require('./users');
const uploadsRoutes = require('./uploads');
const quotesRoutes = require('./quotes');

const routes = (router) => {
  authRoutes(router);
  usersRoutes(router);
  uploadsRoutes(router);
  quotesRoutes(router);
  
  return router;
}

module.exports = routes;
