const notFoundHelper = (req, res, next) => {
  const error = new Error(`Resource not found: '${req.originalUrl}'.`);
  error.name = 'NotFoundError';
  error.httpStatusCode = 404;
  return next(error);
}

module.exports = notFoundHelper;
