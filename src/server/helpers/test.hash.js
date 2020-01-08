const hashHelper = require('./hash.helper');

const password = 'S6ç~vSLL&c.D_Q1a12345678';
const savedHash = '$scrypt$k=33$N=65536$r=16$p=2$mem=268435456$CvBj1HrmcuRHZuhWvJ7Ikw==$ktyG9mlDODulMwEr7E3yytdyTEvqI2oZ7qY/Ao0GF0bl';

hashHelper.hashPassword(password, (error, hash) => {
  if(error) {
    return console.log(error.message);
  }
  console.log('Password Hashed:');
  console.log(hash);
  hashHelper.isPasswordCorrect(password, savedHash, (error, result) => {
    if(error) {
      return console.log(error.message);
    }
    console.log('Is Password correct comparing with pre saved hash?');
    console.log(result);
    hashHelper.isPasswordCorrect(password, hash, (error, result) => {
      if(error) {
        return console.log(error.message);
      }
      console.log('Is Password correct?');
      console.log(result);
    });
  });
});
