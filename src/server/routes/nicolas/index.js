const path = require('path');
const baseAPIpath = require('../../../config').env.BASE_URI;

const nicolasRoutes = (router) => {
  router.route(path.join(baseAPIpath,'nicolas'))
    .all((req, res, next) => {
      console.log(req.headers);
      console.log(req.body);
      console.log(req.query);
      res.status(201).json({
        status: 'OK',
        headers: req.headers,
        query: req.query,
        body: req.body
      });
    })
  
  return router;
}

module.exports = nicolasRoutes;