const logoRoutes = require('./logo');


const path = require('path');
const baseAPIpath = require('../../../config').env.BASE_URI;
const uploadHelper = require('../../helpers/file.upload.helper');
const staticPath = require('../../../config').paths.public;

const acceptedFileTypes = /\.(jpg|jpeg|png|gif)$/
const acceptedFiles = acceptedFileTypes.source.substring(acceptedFileTypes.source.indexOf('('), acceptedFileTypes.source.lastIndexOf(')') + 1);
const imagePath = path.join(__basedir, staticPath, 'upload');
const fieldName = 'avatarImage';

const imageFilter = (req, file, cb) => {
  if(!file.originalname.match(acceptedFileTypes)) {
    return cb(new TypeError(`Unknown image type. Expected one of: ${acceptedFiles}`), false);
  }
  cb(null, true);
}

const uploadImage = uploadHelper.uploadFile(imagePath, imageFilter).single(fieldName);


const uploadRoutes = (router) => {
  logoRoutes(router);
  
  
  router.route(path.join(baseAPIpath, 'upload'))
  .post(/*uploadImage,*/ (req,res,next) => {
    let info = undefined;

    if(req.file) {
      info = {
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
      }
    }
    if(req.files) {
      info = [];
      req.files.forEach(file => {
        info.push({
          mimetype: file.mimetype,
          size: file.size,
          originalname: file.originalname
        })
      });
    }

    if(!info) {
      let error = new ReferenceError('File not properly proccessed at Server, please tray again later');
      error.httpStatusCode = 500;
      return next(error);
    }
    
    res.status(200).json({
      message: `File received from: ${req.headers['x-forwarded-for']}`,
      fileInfo: info
    });
  });
  return router;
}

module.exports = uploadRoutes;
