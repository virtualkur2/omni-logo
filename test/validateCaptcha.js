const utils = require('../src/server/utils');

const validateCaptcha = utils.validateCaptcha;

validateCaptcha()
.then(console.log)
.catch(console.error);