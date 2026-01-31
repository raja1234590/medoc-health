const mongoose = require('mongoose');

const TokenSource = {
  ONLINE_BOOKING: 'online_booking',
  WALK_IN: 'walk_in',
  PAID_PRIORITY: 'paid_priority',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency'
};

const TokenStatus = {
  PENDING: 'pending',
  ALLOCATED: 'allocated',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

const tokenSchema = new mongoose.Schema({
  token_number: {
    type: String,
    required: [true, 'Token number is required'],
    unique: true,
    index: true
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  slot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    default: null
  },
  patient_name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  source: {
    type: String,
    enum: Object.values(TokenSource),
    required: [true, 'Token source is required']
  },
  status: {
    type: String,
    enum: Object.values(TokenStatus),
    default: TokenStatus.PENDING
  },
  priority_score: {
    type: Number,
    default: 0
  },
  allocated_at: {
    type: Date,
    default: null
  },
  cancelled_at: {
    type: Date,
    default: null
  },
  is_emergency: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
tokenSchema.index({ doctor_id: 1, status: 1 });
tokenSchema.index({ slot_id: 1, status: 1 });
tokenSchema.index({ priority_score: 1 });
tokenSchema.index({ created_at: 1 });

module.exports = mongoose.model('Token', tokenSchema);
module.exports.TokenSource = TokenSource;
module.exports.TokenStatus = TokenStatus;
