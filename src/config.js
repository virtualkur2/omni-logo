const config = {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
  },
  jwt: {
    SECRET: process.env.JWT_SECRET || '3FDB85062057CBB0110A1B94D2880C535CFD6A8EF6412B7D398F11A743B3B276',
    expTime: 21600000, // milliseconds for 6 hours
  },
  pass: {
    length: 8,
  },
  pepper: {
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
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.NODE_ENV === 'production' ? true : false, // this is for MAILGUN
    auth: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD
    }
  },
  cookie: {
    maxAge: 21600000, // milliseconds for 6 hours
    secure: process.env.NODE_ENV ? true : false,
    signed: true,
    name: 'OmniPC',
    SECRET: process.env.COOKIE_SECRET || '~Y[Q-J/Wo*oZ67"i7b}s4Z&l)`EBr!:)_<utSPrK*X&JCj"1]55,Zs!O:M2vl[b'
  },
  mongo: {
    URI: process.env.MONGO_URI || 'mongodb://localhost:27017/omnipc_db'
  }
}

module.exports = config;