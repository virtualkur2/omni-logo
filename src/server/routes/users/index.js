const path = require('path');
const authController = require('../../controllers/auth.controller');
const userController = require('../../controllers/user.controller');
const emailController = require('../../controllers/email.controller');
const baseAPIpath = require('../../../config').env.BASE_URI;

const userRoutes = (router) => {
  router
    .route(path.join(baseAPIpath, 'users/id/:userId'))
    .get(
      authController.requireSignin,
      authController.hasAuthorization,
      userController.read,
    )
    .put(
      authController.requireSignin,
      authController.hasAuthorization,
      userController.update,
    )
    .delete(
      authController.requireSignin,
      authController.hasAuthorization,
      userController.remove,
    );

  router
    .route(path.join(baseAPIpath, 'users/email/:userEmail'))
    .get(
      authController.requireSignin,
      authController.hasAuthorization,
      userController.read,
    )
    .put(
      authController.requireSignin,
      authController.hasAuthorization,
      userController.update,
    )
    .delete(
      authController.requireSignin,
      authController.hasAuthorization,
      userController.remove,
    );

  router
    .route(path.join(baseAPIpath, 'users'))
    .post(
      // authController.validateCaptcha,
      userController.create,
      emailController.sendActivateEmail,
    )
    .get(
      // authController.requireSignin,
      // authController.hasAuthorization,
      // authController.isAdmin,
      userController.list,
    );

  router.param('userId', userController.userById);
  router.param('userEmail', userController.userByEmail);

  return router;
};

module.exports = userRoutes;
