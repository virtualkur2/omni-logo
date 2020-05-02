const path = require('path');
const authController = require('../../controllers/auth.controller');
const baseAPIpath = require('../../../config').env.BASE_URI;


const authRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'auth/login'))
    .post(authController.signin);
  router.route(path.join(baseAPIpath, 'auth/logout'))
    .post(authController.signout);
  
  router.route(path.join(baseAPIpath, 'auth/activate'))
    .get(authController.activate)
  return router;
}

module.exports = authRoutes;
