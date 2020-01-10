const config = {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    BASE_URI: process.env.BASE_URI || '/',
    ACTIVATE_EMAIL_URI: process.env.ACTIVATE_EMAIL_URI || 'https://omnipc.ddns.net/api/activate',
  },
  jwt: {
    SECRET: process.env.JWT_SECRET || '3FDB85062057CBB0110A1B94D2880C535CFD6A8EF6412B7D398F11A743B3B276',
    expTime: 21600000, // milliseconds for 6 hours
    audience: 'https://omnipc.ddns.net',
    issuer: 'OmniPC',
    VERIFY_EMAIL_SECRET: process.env.JWT_SECRET || '29886D5CA2269F7B3D03801393626951EBCD2C2E899A277A6CBF437CE61F35DA',
    emailVerifyExpTime: 1800000, // milliseconds for 30 minutes
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
    name: 'OmniPC',
    SECRET: process.env.COOKIE_SECRET || '~Y[Q-J/Wo*oZ67"i7b}s4Z&l)`EBr!:)_<utSPrK*X&JCj"1]55,Zs!O:M2vl[b',
    options: {
      maxAge: 21600000, // milliseconds for 6 hours
      secure: true,
      signed: true,
    }
  },
  mongo: {
    URI: process.env.MONGO_URI || 'mongodb://localhost:27017/omnipc_db'
  }
}

module.exports = config;