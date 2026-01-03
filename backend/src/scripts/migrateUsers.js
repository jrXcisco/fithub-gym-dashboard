const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const User = require('../models/User');

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users without gymUuid
    const usersWithoutGymUuid = await User.find({ 
      $or: [
        { gymUuid: { $exists: false } },
        { gymUuid: null },
        { gymUuid: '' }
      ]
    });

    console.log(`Found ${usersWithoutGymUuid.length} users without gymUuid`);

    for (const user of usersWithoutGymUuid) {
      user.role = 'admin';
      user.gymUuid = uuidv4();
      user.gymName = user.gymName || `${user.firstName}'s Gym`;
      await user.save();
      console.log(`Updated user: ${user.email} with gymUuid: ${user.gymUuid}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers();
