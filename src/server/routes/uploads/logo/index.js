const path = require('path');
const authController = require('../../../controllers/auth.controller');
const baseAPIpath = require('../../../../config').env.BASE_URI;

const logoRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'logo'))
    .get(authController.requireSignin);
  
  return router;
}

module.exports = logoRoutes;
