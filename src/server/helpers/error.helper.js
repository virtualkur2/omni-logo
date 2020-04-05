const errorHelper = (error, req, res, next) => {
  const errorName = getErrorName(error);
  const errorMessage = getErrorMessage(error);
  let httpStatusCode;
  switch(errorName) {
    case 'ValidationError':
      httpStatusCode = 400;
      break;
    case 'CastError':
      httpStatusCode = 400;
      break;
    default:
      httpStatusCode = error.httpStatusCode ? error.httpStatusCode : 500;
  }
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
  const errorStack = error.stack.split("\n");
  const caller_line = errorStack.length > 1 ? errorStack[1] : errorStack[0];
  const errorCaller = ~caller_line.indexOf("at ") ? caller_line.slice(caller_line.indexOf("at ") + 2, caller_line.length): caller_line;
  return errorCaller;
}

module.exports = errorHelper;
