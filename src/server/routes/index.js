const authRoutes = require('./auth');
const usersRoutes = require('./users');
const uploadsRoutes = require('./uploads');

const routes = (router) => {
  authRoutes(router);
  usersRoutes(router);
  uploadsRoutes(router);
  
  return router;
}

module.exports = routes;
