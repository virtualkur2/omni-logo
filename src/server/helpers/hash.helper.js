const crypto = require('crypto');

// Global Options
const saltLength = 16;  // Length of generated salt
const keyLength = 33;   // Length of derived key
const options = {
  cost: 2**16,              // Default: 2**14 (N)
  blocksize: 16,             // Default: 8 (r)
  parallelization: 2,       // Default: 1 (p)
  maxmem: 256 * 1024 * 1024  //Default: 32 *1024 *1024
}
const pepperOptions = {
  length: 16,
  // don't include '$' sign in pepper's chars string
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ|!@#%&()=?ç[]{}.,;+-*/~_:abcdefghijklmnopqrstuvwxyz0123456789',
  shuffle: function(str) {
    // Fisher-Yates shuffle https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    let arr = str.split('');
    let len = arr.length;
    for(let index = len - 1; index > 0; index--) {
      let shuffled_index = Math.floor(Math.random() * (index + 1));
      let tmp = arr[index];
      arr[index] = arr[shuffled_index];
      arr[shuffled_index] = tmp;
    }
    return arr.join('');
  }
};

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
    
    const values = getValues(hashedPassword);
    if(!values) {
      if(!cb) {
        return Promise.reject(typeError);
      }
      if(cb instanceof Function) {
        return cb(typeError, null);
      }
      throw typeError;
    }
    
    if(!cb) {
      return new Promise((resolve, reject) => {
        crypto.scrypt(passwordAttempt, values.salt, values.keyLength, values.options, (err, derivedKey) => {
          if(err) {
            return reject(err);
          }
          resolve(derivedKey.toString('base64') === values.hash);
        });
      });
    }
    
    if(cb instanceof Function) {
      crypto.scrypt(passwordAttempt, values.salt, values.keyLength, values.options, (err, derivedKey) => {
        if(err) {
          return cb(err, null);
        }
        cb(null, derivedKey.toString('base64') === values.hash);
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
  },
  createPepper: function() {
    const chars = pepperOptions.shuffle(pepperOptions.chars);
    let pepper = [];
    for(let i = 0; i < pepperOptions.length; i++) {
      pepper.push(chars[ Math.round(Math.random() * (chars.length - 1)) ]);
    }
    return pepper.join('');
  }
}

const constructPassword = (hash, salt) => {
  // DONE: write a PHC String compatible format for hashed password
  // source: https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
  // example of format:
  // $scrypt$k=<value>$N=<value>$r=<value>$p=<value>$mem=<value>$salt$hash
  return `$scrypt$k=${keyLength}$N=${options.cost}$r=${options.blocksize}$p=${options.parallelization}$mem=${options.maxmem}$${salt}$${hash}`;
}

const genSalt = () => {
  return crypto.randomBytes(saltLength).toString('base64');
}

const getValues = (hashedPassword) => {
  // TODO: check if hashedPassword has the right format
  // source: https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
  // example of format:
  // $scrypt$k=<value>$N=<value>$r=<value>$p=<value>$mem=<value>$salt$hash
  const rawValues = hashedPassword.split('$');
  if(rawValues.length !== 9) return;
  if(rawValues[0] === '') rawValues.shift();
  const values = {
    keyLength: parseInt(rawValues[1].split('=')[1], 10),
    options: {
      cost: parseInt(rawValues[2].split('=')[1], 10),
      blocksize: parseInt(rawValues[3].split('=')[1], 10),
      parallelization: parseInt(rawValues[4].split('=')[1], 10),
      maxmem: parseInt(rawValues[5].split('=')[1], 10)
    },
    salt: rawValues[6],
    hash: rawValues[7]
  }
  return values;
}

module.exports = helper;
