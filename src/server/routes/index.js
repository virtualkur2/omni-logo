const authRoutes = require('./auth');
const usersRoutes = require('./users');
const uploadsRoutes = require('./uploads');
const quotesRoutes = require('./quotes');
const nicolasRoutes = require('./nicolas');
const tukiRoutes = require('./tuki');
const rnaRoutes = require('./rna');

const routes = (router) => {
  authRoutes(router);
  usersRoutes(router);
  uploadsRoutes(router);
  quotesRoutes(router);
  nicolasRoutes(router);
  rnaRoutes(router);
  tukiRoutes(router);

  return router;
}

module.exports = routes;
