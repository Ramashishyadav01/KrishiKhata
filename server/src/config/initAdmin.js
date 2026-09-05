const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || 'Ram Ashish Yadav';
    const adminMobile = (process.env.ADMIN_MOBILE || '7860470800').toString().trim();
    const adminRawPassword = process.env.ADMIN_PASSWORD || 'admin@123';

    if (!adminMobile) {
      console.log('[initAdmin] No ADMIN_MOBILE set in .env. Skipping admin sync.');
      return;
    }

    // 1. Demote any user that currently has role 'admin' but whose mobile != adminMobile
    await User.updateMany(
      { role: 'admin', mobile: { $ne: adminMobile } },
      { $set: { role: 'operator' } }
    );

    // 2. Check if user with adminMobile exists
    let adminUser = await User.findOne({ mobile: adminMobile });

    if (adminUser) {
      let updateFields = { role: 'admin', status: 'active' };

      if (adminName && adminUser.name !== adminName.trim()) {
        updateFields.name = adminName.trim();
      }

      // Verify password match; update hash if changed
      const isPasswordMatch = await bcrypt.compare(adminRawPassword, adminUser.password);
      if (!isPasswordMatch) {
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(adminRawPassword, salt);
      }

      await User.updateOne({ _id: adminUser._id }, { $set: updateFields });
      console.log(`[initAdmin] Admin account (${adminMobile}) synced with role "admin".`);
    } else {
      // 3. Create Admin user if doesn't exist
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminRawPassword, salt);

      await User.create({
        name: adminName.trim(),
        mobile: adminMobile,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
      });
      console.log(`[initAdmin] Created new Admin account (${adminMobile}) with role "admin".`);
    }
  } catch (error) {
    console.error('[initAdmin] Error initializing Admin account:', error.message);
  }
};

module.exports = initAdmin;
