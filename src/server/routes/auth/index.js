const authController = require('../../controllers/auth.controller');
const baseAPIpath = require('../../../config').env.BASE_URI;


const authRoutes = (router) => {
  router.route(`${baseAPIpath}/login`)
    .post(authController.signin);
  router.route(`${baseAPIpath}/logout`)
    .post(authController.signout);
  
  return router;
}

module.exports = authRoutes;
