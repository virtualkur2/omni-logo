const path = require('path');
const Logo = require('../models/logo.model');
const uploadHelper = require('../helpers/file.upload.helper');
const staticPath = require('../../config').paths.public;

const logoImagePath = path.join(__dirname, staticPath, 'logo');
const acceptedFileTypes = /\.(jpg|jpeg|png|gif|svg|ico|tiff)$/
const acceptedFiles = acceptedFileTypes.source.substring(acceptedFileTypes.source.indexOf('('), acceptedFileTypes.source.lastIndexOf(')') + 1);

const imageFilter = (req, file, cb) => {
  if(!file.originalname.match(acceptedFileTypes)) {
    return cb(new TypeError(`Unknown image type. Expected one of: ${acceptedFiles}`), false);
  }
  cb(null, true);
}

const uploadLogoImage = uploadHelper.uploadFile(logoImagePath, imageFilter);
const removeLogoImage = uploadHelper.unlinkFile;
const maxFilesUploadLimit = 10;
const logoFieldName = 'logoImage';

const paginateLogoImages = (pageNumber, logoImagesPerPage, userId) => {
  let filter = userId ? {by: userId} : {};
  return Logo.find(filter)
    .skip(pageNumber > 1 ? ((pageNumber - 1) * logoImagesPerPage): 0)
    .limit(logoImagesPerPage);
}

const logoController = {
  uploadArray: uploadLogoImage.array(logoFieldName, maxFilesUploadLimit),
  list: (req, res, next) => {
    let limit = (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) < 0? 0 : (parseInt(req.query.limit) > 50 ? 50 : parseInt(req.query.limit)));
    let page = (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) < 0 || !limit) ? 0 : parseInt(req.query.page);
    let userid = req.query.userid;
    paginateLogoImages(page, limit, userid).exec((error, logos) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      Logo.estimatedDocumentCount((error, total) => {
        if(error) {
          error.httpStatusCode = 500;
          return next(error);
        }
        const safeLogos = logos.map(logo => logo.getSafeData());
        return res.status(200).json({
          page: page,
          totalPage: limit,
          totalDocuments: total,
          logos: safeLogos
        });
      });
    });
  },
  create: (req, res, next) => {
    if(!req.files || !req.files.length) {
      let error = new ReferenceError(`No files to process in request.`);
      error.httpStatusCode = 400; // Bad request
      return next(error);
    }
    let listOfLogos = req.files.map((file, index) => {
      return new Logo({
        file: file,
        by: req.auth._id,
        title: (req.body.title && req.body.title.length && req.body.title[index]) || `OmniPC Logo - ${index} - by: ${req.auth._id}`,
        readOnly: (req.body.readOnly && req.body.readOnly.length && req.body.readOnly[index])
      });
    });

    Logo.insertMany(listOfLogos, (error, logos) => {
      if(error) {
        //first remove all files uploaded
        Promise.all(listOfLogos.map(logo => {
          removeLogoImage(logoImagePath, logo.file.filename)
          .then((fileName) => {
            console.info(`Successfully deleted: ${fileName}`);
          })
          .catch(error => {
            throw error;
          })
        }))
        .then(() => {
          error.httpStatusCode = 500;
          return next(error);
        })
        .catch(err => {
          err.httpStatusCode = 500;
          return next(err);
        });
      }
      const safeLogos = logos.map(logo => logo.getSafeData());
      return res.status(201).json({
        message: `File${safeLogos.length > 1? 's' : ''} successfully created.`,
        logos: safeLogos
      });
    });
    // logo.save((error, newLogo) => {
    //   // TODO: analize this part of code to see if we can improve on IO resources.
    //   if(error) {
    //     return removeLogoImage(logoImagePath, req.file.filename, (err, unlinked) => {
    //       if(err) {
    //         err.message = `${err.message} - Conflictive path: ${err.fullPath}`;
    //         err.httpStatusCode = 500;
    //         return next(err);
    //       }
    //       error.httpStatusCode = 500;
    //       return next(error);
    //     });
    //   }
    //   return res.status(201).json({
    //     message: `File succesfully created.`,
    //     logo: newLogo.getSafeData()
    //   });
    // });
  },
  remove: (req, res, next) => {

  },
  logoById: (req, res, next) => {

  },
}

module.exports = logoController;
