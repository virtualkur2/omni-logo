const multer = require('multer');
const mime = require('mime');
const path = require('path');
const fs = require('fs');

const fileNameLength = 32;
const maxFileSize = 2 ** 20; // this is for 1 Megabyte (1048576 bytes)
const limits = {
  fileSize: maxFileSize
}

const randomFileName = length => {
  return [...Array(length)].map((element) => (~~(Math.random()*36)).toString(36)).join('');
}

const fileUploadHelper = {
  uploadFile: (filePath, fileFilter) => {
    const storage = multer.diskStorage({
      destination: filePath,
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        ext = ext.length > 2 ? ext : `.${mime.extension(file.mimetype)}`;
        let filename = `${randomFileName(fileNameLength)}${ext}`;
        cb(null, filename);
      }
    });
    return multer({storage, fileFilter, limits});
  },
  unlinkFile: (filePath, fileName, cb) => {
    //check for callback otherwise return a Promise
    const fullPath = path.join(filePath, fileName);
    if(cb) {
      if(!(cb instanceof Function)) {
      }
      fs.stat(fullPath, (error, stats) => {
        if(error) return cb(error, null);
        if(!stats.isFile()) return cb(new TypeError(`There's no such file: ${fileName}`), null);
        fs.unlink(fullPath, error => {
          if(error) {
            error.fullPath = fullPath;
            return cb(error, null);
          }
          return cb(null, fileName);
        });
      });
    } else { // a Promise is returned
      return new Promise((resolve, reject) => {
        fs.stat(fullPath, (error, stats) => {
          if(error) {
            error.fullPath = fullPath;
            return reject(error);
          }
          if(!stats.isFile()) return reject(new TypeError(`There's no such file: ${fileName}`));
          fs.unlink(fullPath, error => {
            if(error) {
              error.fullPath = fullPath;
              return reject(error);
            }
            return resolve(fileName);
          });
        });
      });
    }
  }
}

module.exports = fileUploadHelper;
