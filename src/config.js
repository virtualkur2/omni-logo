const config = {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
  },
  jwt: {
    SECRET: process.env.JWT_SECRET || '3FDB85062057CBB0110A1B94D2880C535CFD6A8EF6412B7D398F11A743B3B276'
  },
  pass: {
    length: 8,
  },
  salt: {
    rounds: 12,
    length: 16,
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ|!@#$%&()=?ç[]{}.,;+-*/~_:abcdefghijklmnopqrstuvwxyz0123456789'
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
    maxAge: 1800000, // milliseconds
    secure: process.env.NODE_ENV ? true : false,
    signed: true,
    name: 'OmniPC',
    SECRET: process.env.COOKIE_SECRET || '~Y[Q-J/Wo*oZ67"i7b}s4Z&l)`EBr!:)_<utSPrK*X&JCj"1]55,Zs!O:M2vl[b'
  },
}

module.exports = config;