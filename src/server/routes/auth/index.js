const path = require('path');
const authController = require('../../controllers/auth.controller');
const baseAPIpath = require('../../../config').env.BASE_URI;


const authRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'login'))
    .post(authController.signin);
  router.route(path.join(baseAPIpath, 'logout'))
    .post(authController.signout);
  
  return router;
}

module.exports = authRoutes;
