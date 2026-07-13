const mongoose = require('mongoose');

/**
 * Singleton settings document (only one should ever exist). Controllers
 * use Settings.getSingleton() to fetch-or-create it on first access.
 */
const settingsSchema = new mongoose.Schema(
  {
    libraryName: { type: String, default: 'School Library' },
    borrowDurationDays: { type: Number, default: 14 },
    finePerDay: { type: Number, default: 5 },
    maxActiveBorrows: { type: Number, default: 5 },
    allowStudentSelfRegistration: { type: Boolean, default: true },
    contactEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
