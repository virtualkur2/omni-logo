const authRoutes = require('./auth');
const usersRoutes = require('./users');

const routes = (router) => {
  authRoutes(router);
  usersRoutes(router);
  return router;
}

module.exports = routes;