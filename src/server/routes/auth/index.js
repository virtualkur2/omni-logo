const authController = require('../../controllers/auth.controller');

const baseAPIpath = '/api';

const authRoutes = (router) => {
  router.route(`${baseAPIpath}/login`)
    .post(authController.signin);
  router.route(`${baseAPIpath}/logout`)
    .post(authController.signout);
  
  return router;
}

module.exports = authRoutes;
