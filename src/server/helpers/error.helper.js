const errorHelper = (error, req, res, next) => {
  const errorName = getErrorName(error);
  const errorMessage = getErrorMessage(error);
  const httpStatusCode = error.httpStatusCode || 500;
  return res.status(httpStatusCode).json({
    error: errorName,
    message: errorMessage,
    status: httpStatusCode
  });
}

const getErrorName = (error) => {
  if(error.errors && Array.isArray(error.errors) && error.errors.length) {
    // first error name only
    return error.errors[0].name;
  }
  return error.name;
}

const getErrorMessage = (error) => {
  if(error.errorType && error.errorType === 'MongoError' && error.code && (error.code === 11000 || error.code === 11001)) {
    return getUniqueErrorMessage(error);
  }
  if(error.errors && Array.isArray(error.errors) && error.errors.length) {
    // first error message only
    return error.errors[0].message;
  }
  return error.message;
}

const getUniqueErrorMessage = (error) => {
  let message = 'Document already exists';
  const start = error.message.lastIndexOf('.$');
  const end = error.message.lastIndexOf('_1');
  if(start > 0 && end > start + 2) {
    let fieldname = error.message.substring(start + 2, end);
    message = `${fieldname.chartAt(0).toUpperCase()}${fieldname.slice(1)} already exists.`
  }
  return message;
}

module.exports = errorHelper;
