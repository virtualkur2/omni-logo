const path = require('path');
const authController = require('../../controllers/auth.controller');
const userController = require('../../controllers/user.controller');
const baseAPIpath = require('../../../config').env.BASE_URI;


const authRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'login'))
    .post(authController.signin);
  router.route(path.join(baseAPIpath, 'logout'))
    .post(authController.signout);
  
  router.route(path.join(baseAPIpath, 'activate'))
    .get(authController.verifyEmail, userController.activate);
  
  return router;
}

module.exports = authRoutes;
