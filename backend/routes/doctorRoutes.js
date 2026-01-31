const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Create a new doctor
router.post('/', async (req, res) => {
  try {
    const { name, specialization } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name is required'
      });
    }

    const doctor = new Doctor({ name, specialization });
    await doctor.save();

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { skip = 0, limit = 100 } = req.query;
    const doctors = await Doctor.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
