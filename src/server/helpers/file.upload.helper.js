const multer = require('multer');
const mime = require('mime');
const path = require('path');
const fs = require('fs');

const fileNameLength = 32;

const randomFileName = (length) => {
  return [...Array(length)].map((element) => (~~(Math.random()*36)).toString(36)).join('');
}

const fileUploadHelper = {
  uploadFile: (filePath, fileFilter) => {
    const storage = multer.diskStorage({
      destination: filePath,
      filename: (req, file, cb) => {
        let extension = path.extname(file.originalname);
        ext = ext.length > 2 ? ext : `.${mime.extension(file.mimetype)}`;
        let filename = `${randomFileName(fileNameLength)}.${extension}`;
        cb(null, filename);
      }
    });
    return multer({storage, fileFilter});
  },
  unlinkFile: (filePath, fileName, cb) => {
    if(!(cb instanceof Function)) {
      const typeError = new TypeError('Invalid callback argument, expected a Function.');
      cb(typeError, null);
    }
    const fullPath = path.join(filePath, fileName);
    fs.stat(fullPath, (error, stats) => {
      if(error) return cb(error, null);
      if(!stats.isFile()) return cb(new TypeError(`There's no such file: ${fileName}`), null);
      fs.unlink(fullPath, (error) => {
        if(error) {
          error.fullPath = fullPath;
          return cb(error, null);
        }
        return cb(null, true);
      });
    })
  }
}

module.exports = fileUploadHelper;
