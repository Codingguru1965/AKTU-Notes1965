import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

const email = process.env.ADMIN_INITIAL_EMAIL || 'admin@aktunotes1965.org';
const password = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecurePass1965!';
const name = process.env.ADMIN_INITIAL_NAME || 'Super Admin';

const run = async () => {
  try {
    await connectDB();

    console.log(`[Bootstrap] Checking admin account: ${email}`);
    let admin = await Admin.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 12);

    if (admin) {
      admin.password = hashedPassword;
      admin.name = name;
      admin.isActive = true;
      await admin.save();
      console.log(`[Bootstrap] Existing admin updated successfully.`);
    } else {
      admin = await Admin.create({
        email,
        password: hashedPassword,
        name,
        role: 'superadmin',
        isActive: true
      });
      console.log(`[Bootstrap] New admin created successfully.`);
    }

    console.log('===============================================');
    console.log(`Admin Email:    ${email}`);
    console.log(`Admin Password: [HIDDEN] (${password.length} characters)`);
    console.log('Status:         Active');
    console.log('===============================================');
  } catch (err) {
    console.error('[Bootstrap] Failed to create admin:', err.message);
  } finally {
    await disconnectDB();
  }
};

run();
