const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  start_time: {
    type: Date,
    required: [true, 'Start time is required']
  },
  end_time: {
    type: Date,
    required: [true, 'End time is required']
  },
  max_capacity: {
    type: Number,
    required: [true, 'Max capacity is required'],
    min: [1, 'Max capacity must be at least 1'],
    default: 10
  },
  current_count: {
    type: Number,
    default: 0,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
timeSlotSchema.index({ doctor_id: 1, start_time: 1 });
timeSlotSchema.index({ is_active: 1, current_count: 1 });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
