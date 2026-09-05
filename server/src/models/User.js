const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// Pre-save safeguard to enforce single Admin rule and role immutability
UserSchema.pre('save', async function (next) {
  if (this.isModified('role')) {
    if (!this.isNew) {
      return next(new Error('User role cannot be changed.'));
    }
    if (this.role === 'admin') {
      const existingAdminCount = await mongoose.model('User').countDocuments({
        role: 'admin',
        _id: { $ne: this._id },
      });
      if (existingAdminCount > 0) {
        return next(new Error('Only one Admin account is allowed in KrishiKhata.'));
      }
    }
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
