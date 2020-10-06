const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    masterKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } },
);

AdminSchema.methods = {
  getInfo: function (cb) {
    return this.populate('userId', cb);
  },
};
AdminSchema.statics.getAll = function (cb) {
  return this.find({}).populate('userId', cb);
};

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
