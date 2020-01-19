const mongoose = require('mongoose');

const LogoSchema = new mongoose.Schema({
  file: {
    fieldname: {
      type: String,
    },
    originalname: {
      type: String,
      required: `Field 'originalName' is required.`
    },
    encoding: {
      type: String,
    },
    mimetype: {
      type: String,
    },
    size: {
      type: String,
    },
    destination: {
      type: String,
    },
    filename: {
      type: String,
      required: `Field 'filename' is required.`
    },
    path: {
      type: String,
    }
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  title: {
    type: String,
    required: `Field 'title' is required.`
  },
  readOnly: {
    type: Boolean,
    default: false
  }
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});

LogoSchema.methods = {
  getSafeData: function() {
    let safeData = {
      _id: this._id,
      title: this.title,
      by: this.by,
      file: {
        encoding: this.file.encoding,
        mimetype: this.file.mimetype,
        size: this.file.size,
        filename: this.file.filename
      }
    };
    return safeData;
  }
}

module.exports = mongoose.model('Logo', LogoSchema);
