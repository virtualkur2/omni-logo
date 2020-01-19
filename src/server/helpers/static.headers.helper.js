const mime = require('mime');

const setStaticHeader = (res, path, stat) => {
  const mimeType = mime.getType(path);
  res.set('content-type', mimeType);
}

module.exports = setStaticHeader;
