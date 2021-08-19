const path = require('path');
const fs = require('fs');
const baseAPIpath = require('../../../config').env.BASE_URI;

const tukiRouter = router => {
  router.route(path.join(baseAPIpath, 'tuki/robbery'))
  .get((req, res, next) => {
    console.log('TukiBot robbery fails gif list requested');
    fs.readdir(path.join(__basedir, 'public/tuki/'),(error, files) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      let robberyFails = files.filter(file => {
        return /^robbery.*/.test(file);
      });
      return res.status(200).json({
        message: 'Succeed',
        data: robberyFails
      });
    });
  });

  return router;
}

module.exports = tukiRouter;
