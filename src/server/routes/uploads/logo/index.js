const path = require('path');
const authController = require('../../../controllers/auth.controller');
const logoController = require('../../../controllers/logo.controller');
const baseAPIpath = require('../../../../config').env.BASE_URI;

const logoRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'logos'))
    // .get(authController.requireSignin);
    .get(authController.requireSignin, logoController.list)
    .post(authController.requireSignin, logoController.uploadArray, logoController.create)
    .delete(authController.requireSignin, authController.hasAuthorization, logoController.remove);

  router.route(path.join(baseAPIpath, 'logos/id/:logoId'))
    .get(authController.requireSignin, logoController.list)
    .delete(authController.requireSignin, authController.hasAuthorization, logoController.remove);
  
  router.param('logoId', logoController.logoById);
  
  return router;
}

module.exports = logoRoutes;
