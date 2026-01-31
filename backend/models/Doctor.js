const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
