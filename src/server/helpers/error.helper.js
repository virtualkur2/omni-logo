const errorHelper = (error, req, res, next) => {
  const errorName = getErrorName(error);
  const errorMessage = getErrorMessage(error);
  const httpStatusCode = error.httpStatusCode || errorName === 'ValidationError' ? 400 : 500;
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
  console.log(error.keyValue);
  console.log(typeof error.keyValue);

  if(error.name === 'MongoError' && error.code && (error.code === 11000 || error.code === 11001)) {
    const keys = Object.keys(error.keyValue);
    return `User with ${keys[0]}: '${error.keyValue[keys[0]]}' already exists.`
  }
  if(error.errors && Array.isArray(error.errors) && error.errors.length) {
    // first error message only
    return error.errors[0].message;
  }
  return error.message;
}

module.exports = errorHelper;
