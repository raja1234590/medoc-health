const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeSlot');
const Doctor = require('../models/Doctor');

// Create a new time slot
router.post('/', async (req, res) => {
  try {
    const { doctor_id, start_time, end_time, max_capacity, is_active } = req.body;

    // Validate required fields
    if (!doctor_id || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id, start_time, and end_time are required'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const slot = new TimeSlot({
      doctor_id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      max_capacity: max_capacity || 10,
      is_active: is_active !== undefined ? is_active : true
    });

    await slot.save();
    await slot.populate('doctor_id', 'name specialization');

    res.status(201).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all time slots
router.get('/', async (req, res) => {
  try {
    const { doctor_id, skip = 0, limit = 100 } = req.query;
    const query = {};

    if (doctor_id) {
      query.doctor_id = doctor_id;
    }

    const slots = await TimeSlot.find(query)
      .populate('doctor_id', 'name specialization')
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ start_time: 1 });

    res.json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific time slot
router.get('/:id', async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id)
      .populate('doctor_id', 'name specialization');

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    res.json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get slot availability
router.get('/:id/availability', async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id)
      .populate('doctor_id', 'name specialization');

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    res.json({
      success: true,
      data: {
        slot_id: slot._id,
        doctor_id: slot.doctor_id._id,
        doctor_name: slot.doctor_id.name,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_capacity: slot.max_capacity,
        current_count: slot.current_count,
        available_slots: slot.max_capacity - slot.current_count,
        is_full: slot.current_count >= slot.max_capacity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
