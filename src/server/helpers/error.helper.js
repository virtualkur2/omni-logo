const errorHelper = (error, req, res, next) => {
  const errorName = getErrorName(error);
  const errorMessage = getErrorMessage(error);
  const httpStatusCode = errorName === 'ValidationError' ? 400 : (error.httpStatusCode ? error.httpStatusCode : 500);
  console.error('An error ocurred in:');
  console.info(getErrorCallee(error));
  console.info(`errorName: ${errorName}`);
  console.info(`Message: ${errorMessage}`);
  console.info(`httpStatusCode: ${httpStatusCode}`);
  console.error('---------------------------------------------');
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
  // console.log(error.keyValue);
  // console.log(typeof error.keyValue);

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

getErrorCallee = (error) => {
  const caller_line = error.stack.split("\n")[4];
  const start = caller_line.indexOf("at ");
  return caller_line.slice(start + 2, caller_line.length);
}

module.exports = errorHelper;
