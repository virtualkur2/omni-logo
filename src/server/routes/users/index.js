const authController = require('../../controllers/auth.controller');
const userController = require('../../controllers/user.controller');
const baseAPIpath = require('../../../config').env.BASE_URI;

const userRoutes = (router) => {
  router.route(`${baseAPIpath}/users/id/:userId`)
    .get(authController.requireSignin, authController.hasAuthorization, userController.read)
    .put(authController.requireSignin, authController.hasAuthorization, userController.update)
    .delete(authController.requireSignin, authController.hasAuthorization, userController.remove);

  router.route(`${baseAPIpath}/users/email/:userEmail`)
    .get(authController.requireSignin, authController.hasAuthorization, userController.read)
    .put(authController.requireSignin, authController.hasAuthorization, userController.update)
    .delete(authController.requireSignin, authController.hasAuthorization, userController.remove);

  router.route(`${baseAPIpath}/users`)
    .post(userController.create);
  
  router.param('userId', userController.userById);
  router.param('userEmail', userController.userByEmail);
  
  return router;
}

module.exports = userRoutes;