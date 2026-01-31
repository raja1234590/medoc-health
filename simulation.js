/**
 * Simulation script for one OPD day with multiple doctors.
 * 
 * This script simulates a realistic OPD day scenario with:
 * - Multiple doctors with different time slots
 * - Tokens from various sources
 * - Real-world events (cancellations, no-shows, emergency insertions)
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

class OPDSimulation {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
    this.doctors = [];
    this.slots = [];
    this.tokens = [];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createDoctors() {
    console.log('\n=== Creating Doctors ===');
    const doctorsData = [
      { name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
      { name: 'Dr. Michael Chen', specialization: 'Orthopedics' },
      { name: 'Dr. Priya Sharma', specialization: 'General Medicine' }
    ];

    for (const docData of doctorsData) {
      try {
        const response = await axios.post(`${this.baseUrl}/api/doctors`, docData);
        if (response.data.success) {
          this.doctors.push(response.data.data);
          console.log(`✓ Created ${response.data.data.name} (ID: ${response.data.data._id})`);
        }
      } catch (error) {
        console.log(`✗ Failed to create ${docData.name}: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  async createTimeSlots(date) {
    console.log('\n=== Creating Time Slots ===');
    
    const slotTimes = [
      [9, 10], [10, 11], [11, 12],
      [14, 15], [15, 16], [16, 17]
    ];

    for (const doctor of this.doctors) {
      for (const [startHour, endHour] of slotTimes) {
        const startTime = new Date(date);
        startTime.setHours(startHour, 0, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(endHour, 0, 0, 0);

        const slotData = {
          doctor_id: doctor._id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          max_capacity: Math.floor(Math.random() * 5) + 8, // 8-12
          is_active: true
        };

        try {
          const response = await axios.post(`${this.baseUrl}/api/slots`, slotData);
          if (response.data.success) {
            this.slots.push(response.data.data);
            console.log(
              `✓ Created slot ${startHour}:00-${endHour}:00 for ${doctor.name} ` +
              `(Capacity: ${response.data.data.max_capacity})`
            );
          }
        } catch (error) {
          console.log(`✗ Failed to create slot: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }

  async createOnlineBookingTokens(date) {
    console.log('\n=== Creating Online Booking Tokens ===');
    
    for (const doctor of this.doctors) {
      const numBookings = Math.floor(Math.random() * 3) + 3; // 3-5
      for (let i = 0; i < numBookings; i++) {
        const tokenData = {
          doctor_id: doctor._id,
          patient_name: `Online Patient ${i + 1}`,
          source: 'online_booking',
          is_emergency: false
        };

        try {
          const response = await axios.post(`${this.baseUrl}/api/tokens`, tokenData);
          if (response.data.success) {
            this.tokens.push(response.data.token);
            console.log(
              `✓ Online booking for ${doctor.name}: ${response.data.token.token_number}`
            );
          } else {
            console.log(`⚠ Online booking created but not allocated: ${response.data.message}`);
          }
        } catch (error) {
          console.log(`✗ Failed to create online booking: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }

  async createWalkInTokens() {
    console.log('\n=== Creating Walk-in Tokens ===');
    
    for (const doctor of this.doctors) {
      const numWalkins = Math.floor(Math.random() * 3) + 2; // 2-4
      for (let i = 0; i < numWalkins; i++) {
        const tokenData = {
          doctor_id: doctor._id,
          patient_name: `Walk-in Patient ${i + 1}`,
          source: 'walk_in',
          is_emergency: false
        };

        try {
          const response = await axios.post(`${this.baseUrl}/api/tokens`, tokenData);
          if (response.data.success) {
            this.tokens.push(response.data.token);
            console.log(`✓ Walk-in for ${doctor.name}: ${response.data.token.token_number}`);
          } else {
            console.log(`⚠ Walk-in created but not allocated: ${response.data.message}`);
          }
        } catch (error) {
          console.log(`✗ Failed to create walk-in: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }

  async createPaidPriorityTokens() {
    console.log('\n=== Creating Paid Priority Tokens ===');
    
    for (const doctor of this.doctors) {
      const numPriority = Math.floor(Math.random() * 2) + 1; // 1-2
      for (let i = 0; i < numPriority; i++) {
        const tokenData = {
          doctor_id: doctor._id,
          patient_name: `Priority Patient ${i + 1}`,
          source: 'paid_priority',
          is_emergency: false
        };

        try {
          const response = await axios.post(`${this.baseUrl}/api/tokens`, tokenData);
          if (response.data.success) {
            this.tokens.push(response.data.token);
            console.log(`✓ Paid priority for ${doctor.name}: ${response.data.token.token_number}`);
          } else {
            console.log(`⚠ Priority token created but not allocated: ${response.data.message}`);
          }
        } catch (error) {
          console.log(`✗ Failed to create priority token: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }

  async createFollowUpTokens() {
    console.log('\n=== Creating Follow-up Tokens ===');
    
    for (const doctor of this.doctors) {
      const numFollowups = Math.floor(Math.random() * 3) + 1; // 1-3
      for (let i = 0; i < numFollowups; i++) {
        const tokenData = {
          doctor_id: doctor._id,
          patient_name: `Follow-up Patient ${i + 1}`,
          source: 'follow_up',
          is_emergency: false
        };

        try {
          const response = await axios.post(`${this.baseUrl}/api/tokens`, tokenData);
          if (response.data.success) {
            this.tokens.push(response.data.token);
            console.log(`✓ Follow-up for ${doctor.name}: ${response.data.token.token_number}`);
          } else {
            console.log(`⚠ Follow-up created but not allocated: ${response.data.message}`);
          }
        } catch (error) {
          console.log(`✗ Failed to create follow-up: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }

  async simulateCancellations() {
    console.log('\n=== Simulating Cancellations ===');
    
    if (this.tokens.length === 0) return;

    const numCancellations = Math.min(Math.floor(Math.random() * 2) + 2, this.tokens.length); // 2-3
    const tokensToCancel = this.tokens
      .filter(t => t.status === 'allocated')
      .sort(() => Math.random() - 0.5)
      .slice(0, numCancellations);

    for (const token of tokensToCancel) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/api/tokens/${token._id}/cancel`,
          { reason: 'Patient cancelled appointment' }
        );
        if (response.data.success) {
          console.log(`✓ Cancelled token ${token.token_number}`);
          token.status = 'cancelled';
        }
      } catch (error) {
        console.log(`✗ Failed to cancel token: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  async simulateNoShows() {
    console.log('\n=== Simulating No-Shows ===');
    
    const allocatedTokens = this.tokens.filter(t => t.status === 'allocated');
    if (allocatedTokens.length === 0) return;

    const numNoshows = Math.min(Math.floor(Math.random() * 2) + 1, allocatedTokens.length); // 1-2
    const tokensNoshow = allocatedTokens
      .sort(() => Math.random() - 0.5)
      .slice(0, numNoshows);

    for (const token of tokensNoshow) {
      try {
        const response = await axios.post(`${this.baseUrl}/api/tokens/${token._id}/no-show`);
        if (response.data.success) {
          console.log(`✓ Marked token ${token.token_number} as no-show`);
          token.status = 'no_show';
        }
      } catch (error) {
        console.log(`✗ Failed to mark no-show: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  async simulateEmergencyInsertions() {
    console.log('\n=== Simulating Emergency Insertions ===');
    
    for (const doctor of this.doctors) {
      if (Math.random() < 0.5) { // 50% chance
        const emergencyData = {
          doctor_id: doctor._id,
          patient_name: 'Emergency Patient',
          notes: 'Urgent case requiring immediate attention'
        };

        try {
          const response = await axios.post(
            `${this.baseUrl}/api/tokens/emergency`,
            emergencyData
          );
          if (response.data.success) {
            this.tokens.push(response.data.token);
            console.log(
              `✓ Emergency insertion for ${doctor.name}: ${response.data.token.token_number}`
            );
          } else {
            console.log(`⚠ Emergency insertion failed: ${response.data.message}`);
          }
        } catch (error) {
          console.log(`✗ Failed to create emergency token: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }

  async printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('SIMULATION SUMMARY');
    console.log('='.repeat(60));

    try {
      // Get current state
      const tokensResponse = await axios.get(`${this.baseUrl}/api/tokens`);
      const allTokens = tokensResponse.data.data || [];

      // Group by doctor
      for (const doctor of this.doctors) {
        const doctorTokens = allTokens.filter(t => t.doctor_id._id === doctor._id);
        console.log(`\n${doctor.name} (${doctor.specialization}):`);
        console.log(`  Total tokens: ${doctorTokens.length}`);

        // Count by status
        const statusCounts = {};
        const sourceCounts = {};
        for (const token of doctorTokens) {
          statusCounts[token.status] = (statusCounts[token.status] || 0) + 1;
          sourceCounts[token.source] = (sourceCounts[token.source] || 0) + 1;
        }

        console.log(`  Status breakdown:`);
        for (const [status, count] of Object.entries(statusCounts)) {
          console.log(`    - ${status}: ${count}`);
        }

        console.log(`  Source breakdown:`);
        for (const [source, count] of Object.entries(sourceCounts)) {
          console.log(`    - ${source}: ${count}`);
        }
      }

      // Slot utilization
      console.log(`\nSlot Utilization:`);
      const slotsResponse = await axios.get(`${this.baseUrl}/api/slots`);
      const allSlots = slotsResponse.data.data || [];

      for (const slot of allSlots) {
        const utilization = (slot.current_count / slot.max_capacity) * 100;
        console.log(
          `  Slot ${slot._id}: ${slot.current_count}/${slot.max_capacity} ` +
          `(${utilization.toFixed(1)}%)`
        );
      }
    } catch (error) {
      console.log(`Error fetching summary: ${error.message}`);
    }
  }

  async run() {
    console.log('='.repeat(60));
    console.log('OPD TOKEN ALLOCATION SYSTEM - SIMULATION');
    console.log('='.repeat(60));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Step 1: Create doctors
    await this.createDoctors();
    await this.sleep(500);

    // Step 2: Create time slots
    await this.createTimeSlots(today);
    await this.sleep(500);

    // Step 3: Create tokens from various sources
    await this.createOnlineBookingTokens(today);
    await this.sleep(500);

    await this.createWalkInTokens();
    await this.sleep(500);

    await this.createPaidPriorityTokens();
    await this.sleep(500);

    await this.createFollowUpTokens();
    await this.sleep(500);

    // Step 4: Simulate real-world events
    await this.simulateCancellations();
    await this.sleep(500);

    await this.simulateNoShows();
    await this.sleep(500);

    await this.simulateEmergencyInsertions();
    await this.sleep(500);

    // Step 5: Print summary
    await this.printSummary();

    console.log('\n' + '='.repeat(60));
    console.log('SIMULATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nAPI running at: ${this.baseUrl}`);
    console.log(`Health check: ${this.baseUrl}/health`);
  }
}

// Run simulation
if (require.main === module) {
  // Check if server is running
  axios.get(`${BASE_URL}/health`)
    .then(response => {
      if (response.data.status === 'healthy') {
        console.log('✓ Server is running');
        const simulation = new OPDSimulation();
        simulation.run().catch(console.error);
      } else {
        console.log('✗ Server is not responding correctly');
        process.exit(1);
      }
    })
    .catch(error => {
      console.log('✗ Cannot connect to server. Please start the server first:');
      console.log('  npm run dev');
      process.exit(1);
    });
}

module.exports = OPDSimulation;
