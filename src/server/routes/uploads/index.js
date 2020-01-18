const logoRoutes = require('./logo');

const uploadRoutes = (router) => {
  logoRoutes(router);
  return router;
}

module.exports = uploadRoutes;
