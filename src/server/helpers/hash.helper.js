const crypto = require('crypto');

// Default options
const saltLength = 16;  // Length of generated salt
const keyLength = 33;   // Length of derived key
const options = {
  cost: 2**14,              // Default: 2**14 (N)
  blocksize: 8,             // Default: 8 (r)
  parallelization: 1,       // Default: 1 (p)
  maxmem: 32 * 1024 * 1024  //Default: 32 *1024 *1024
}

const typeError = new TypeError('Invalid argument');

const helper = {
  isPasswordCorrect: (passwordAttempt, hashedPassword, cb) => {
    if(!passwordAttempt || !hashedPassword) {
      if(!cb) {
        return Promise.reject(typeError);
      }
      if(cb instanceof Function) {
        return cb(typeError, null);
      }
      throw typeError;
    }
    const salt = getSalt(hashedPassword);
    const options = {
      cost: getCost(hashedPassword)
    }
    const keyLength = getKeyLength(hashedPassword);

    if(!cb) {
      return new Promise((resolve, reject) => {
        crypto.scrypt(passwordAttempt, salt, keyLength, options, (err, derivedKey) => {
          if(err) {
            return reject(err);
          }
          resolve(derivedKey.toString('base64') === getDerived(hashedPassword));
        });
      });
    }
    if(cb instanceof Function) {
      crypto.scrypt(passwordAttempt, salt, keyLength, options, (err, derivedKey) => {
        if(err) {
          return cb(err, null);
        }
        cb(null, derivedKey.toString('base64') === getDerived(hashedPassword));
      });
    } else {
      throw typeError;
    }
  },
  hashPassword: (password, cb) => {
    if(!password) {
      if(!cb) {
        return Promise.reject(typeError);
      }
      if(cb instanceof Function) {
        return cb(typeError, null);
      }
      throw typeError;
    }

    const salt = genSalt();
    if(!cb) {
      return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, keyLength, options, (err, derivedKey) => {
          if(err) {
            return reject(err);
          }
          const constructedPassword = constructPassword(derivedKey.toString('base64'), salt);
          resolve(constructedPassword);
        });
      });
    }
    if(cb instanceof Function) {
      crypto.scrypt(password, salt, keyLength, options, (err, derivedKey) => {
        if(err) {
          return cb(err, null);
        }
        const constructedPassword = constructPassword(derivedKey.toString('base64'), salt);
        cb(null, constructedPassword);
      });
    } else {
      throw typeError;
    }
  }
}

const constructPassword = (hash, salt) => {
  // TODO: write a PHC String compatible format for hashed password
  // source: https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
  // example of format:
  // $scrypt$N=<value>$r=<value>$p=<value>$mem=<value>$salt$hash

  let str = '$scrypt$'
  str = str.concat(keyLength).concat('$');
  str = str.concat(options.cost).concat('$');
  str = str.concat(salt).concat('$');
  str = str.concat(hash);
  return str;
}

const genSalt = () => {
  // return a random string of 22 characters (original method returns a 24 with 2 padding characters)
  return crypto.randomBytes(saltLength).toString('base64').substring(0,22);
}

const getValues = (str) => {
  // TODO: check if str has the right format
  // example of format:
  // $scrypt$N=<value>$r=<value>$p=<value>$mem=<value>$salt$hash
  return str.split('$');
}

const getKeyLength = (savedPassword) => {
  return parseInt(getValues(savedPassword)[2], 10);
}

const getCost = (savedPassword) => {
  return parseInt(getValues(savedPassword)[3], 10);
}

const getSalt = (savedPassword) => {
  return getValues(savedPassword)[4];
}

const getDerived = (savedPassword) => {
  return getValues(savedPassword)[5];
}

module.exports = helper;