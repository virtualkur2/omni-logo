const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    app_name: {
      type: String,
      required: `Path 'app_name' is required`,
    },
    app_url: {
      type: String,
      required: `Path 'app_url' is required`,
    },
    activate_url: {
      type: String,
      required: `Path 'activate_url' is required`,
    },
    redirect_url: {
      type: String,
      required: `Path 'redirect_url' is required`,
    },
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } },
);

const Application = mongoose.model('Application', ApplicationSchema);
module.exports = Application;
