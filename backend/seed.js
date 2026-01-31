/**
 * Seed script to populate database with initial data
 * Run: node backend/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const TimeSlot = require('./models/TimeSlot');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opd_tokens')
  .then(async () => {
    console.log('✓ Connected to MongoDB');
    
    try {
      // Clear existing data (optional - comment out if you want to keep existing data)
      // await Doctor.deleteMany({});
      // await TimeSlot.deleteMany({});
      
      // Check if doctors already exist
      const existingDoctors = await Doctor.countDocuments();
      if (existingDoctors > 0) {
        console.log(`\n⚠ ${existingDoctors} doctors already exist. Skipping seed.`);
        console.log('To re-seed, delete existing doctors first or comment out the check.');
        process.exit(0);
      }
      
      // Create doctors
      console.log('\n=== Creating Doctors ===');
      const doctors = [
        { name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
        { name: 'Dr. Michael Chen', specialization: 'Orthopedics' },
        { name: 'Dr. Priya Sharma', specialization: 'General Medicine' },
        { name: 'Dr. James Wilson', specialization: 'Pediatrics' },
        { name: 'Dr. Emily Davis', specialization: 'Dermatology' }
      ];
      
      const createdDoctors = await Doctor.insertMany(doctors);
      console.log(`✓ Created ${createdDoctors.length} doctors`);
      
      createdDoctors.forEach(doc => {
        console.log(`  - ${doc.name} (${doc.specialization})`);
      });
      
      // Create time slots for today
      console.log('\n=== Creating Time Slots ===');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const slotTimes = [
        [9, 10], [10, 11], [11, 12],
        [14, 15], [15, 16], [16, 17]
      ];
      
      let slotCount = 0;
      for (const doctor of createdDoctors) {
        for (const [startHour, endHour] of slotTimes) {
          const startTime = new Date(today);
          startTime.setHours(startHour, 0, 0, 0);
          
          const endTime = new Date(today);
          endTime.setHours(endHour, 0, 0, 0);
          
          await TimeSlot.create({
            doctor_id: doctor._id,
            start_time: startTime,
            end_time: endTime,
            max_capacity: Math.floor(Math.random() * 5) + 8, // 8-12
            is_active: true
          });
          slotCount++;
        }
      }
      
      console.log(`✓ Created ${slotCount} time slots`);
      
      console.log('\n✅ Seed completed successfully!');
      console.log('\nYou can now:');
      console.log('1. Start the server: npm run dev');
      console.log('2. Run simulation: npm run simulate');
      console.log('3. Access frontend: http://localhost:3000');
      
    } catch (error) {
      console.error('✗ Error seeding database:', error);
    } finally {
      mongoose.connection.close();
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  });
