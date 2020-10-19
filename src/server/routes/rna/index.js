const path = require('path');
const baseAPIpath = require('../../../config').env.BASE_URI;

const rnaRoutes = (router) => {
  router.route(path.join(baseAPIpath, 'rna'))
    .get((req, res, next) => {
      const rnaOptions = {
        root: path.join(__basedir, 'public/rna'),
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      }
      console.log('RNA route \'GET\' petition');
      const indexFile = 'index.html';
      res.sendFile(indexFile, rnaOptions, error => {
        if(error){
          console.info(`Error sending 'indexFile': ${error.message}`);
          next(error);
        }
        console.log(`Sent: ${indexFile}`);
      });
    })
  
  return router;
}

module.exports = rnaRoutes;
