const mongoose = require('mongoose');
const config = require('../../config');
const hashHelper = require('../helpers/hash.helper');

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
    required: 'Field \'userName\' is required.',
    unique: 'This \'userName\' was already taken.'
  },
  email: {
    type: String,
    trim: true,
    unique: 'This email already exists.',
    match: [emailRegex, 'Please fill in a valid email address.'],
    required: 'Field \'email\' is required.',
    index: true
  },
  hashed_password: {
    type: String,
    required: 'Field \'password\' is required.',
    minlength: [config.pass.length, `Password must have at least ${config.pass.length} characters.`]
  },
  pepper: {
    value: {
      type: String
    },
    pre: {
      type: Boolean,
      default: true
    }
  },
  services: {
    type: Array,
    default: []
  },
  active: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
  },
  subscribe: {
    type: Boolean,
    default: false
  }
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});

// The password string provided by the user is not stored directly in the user
// document. Instead, it is handled as a virtual field.
// Everytime the field 'password' is found in the body's profile, it will be set here.
// So, if an user change the password later (or send the same password again),
// it will be stored here and the field 'hashed_password' is going to be modified.

UserSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.pepper.value = hashHelper.createPepper();
    this.pepper.pre = Math.round(Math.random()) ? true : false;
    this.hashed_password = undefined;
  })
  .get(function() {
    return this._password;
  });

UserSchema.methods = {
  authenticate: async function(password) {
    try {
      const password_attempt = this.pepper.pre ? `${this.pepper.value}${password}` : `${password}${this.pepper.value}`;
      const isAuthenticated = await hashHelper.isPasswordCorrect(password_attempt, this.hashed_password);
      return { isAuthenticated, isActive: this.active}
    } catch(e) {
      throw e;
    }
  },
  hashPassword: async function(password) {
    if(!password) {
      return this.invalidate('password', `Field \'password\' is required.`);
    }
    if(password && password.length < config.pass.length) {
      return this.invalidate('password', `Field \'password\' must have at least ${config.pass.length} characters.`);
    }
    try {
      const pepperedPassword = this.pepper.pre ? `${this.pepper.value}${password}` : `${password}${this.pepper.value}`;
      return await hashHelper.hashPassword(pepperedPassword);
    } catch (e) {
      throw e;
    }
  },
  getSafeData: function() {
    let safeData = {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      services: this.services,
      avatar: this.avatar,
    };
    return safeData;
  }
}

// Validation over hashed_password field
// TODO: Needs attention over this validate middleware
UserSchema.path('hashed_password').validate(function(value) {
  // Not using value of hashed_password, instead validate virtual password field before saving the hash
  if(this.password && this.password.length < config.pass.length) {
    this.invalidate('password', value);
  }
}, null);

// Create hash for password storage
// using await since hashPassword() is an async method
UserSchema.pre('validate', async function(next) {
  const user = this;
  if(!user.isNew && !user.isModified('hashed_password')) {
    // check if user's password has been changed
    // if not, continue with next middleware
    next();
  } else {
    const password = user.password;
    try {
      user.hashed_password = await user.hashPassword(password);
      next();
    } catch(e) {
      console.error(`Error hashing password for user ${user.name}`);
      console.error(`Message: ${e.message}`);
      e.httpStatusCode = 500;
      next(e);
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
// Ofrecemos atención remota en línea por personal altamente capacitado, con absoluta seguridad.
// Permita que la experiencia acceda a su escritorio y le ayude a resolver de forma profesional todas las incidencias desde la comodidad de su hogar.
