const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const TokenAllocationEngine = require('../services/allocationEngine');
const { TokenSource, TokenStatus } = require('../models/Token');
const Doctor = require('../models/Doctor');

// Create and allocate a token
router.post('/', async (req, res) => {
  try {
    const { doctor_id, patient_name, source, is_emergency, notes, preferred_slot_id } = req.body;

    // Validate required fields
    if (!doctor_id || !patient_name || !source) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id, patient_name, and source are required'
      });
    }

    // Validate source
    if (!Object.values(TokenSource).includes(source)) {
      return res.status(400).json({
        success: false,
        message: `Invalid source. Must be one of: ${Object.values(TokenSource).join(', ')}`
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

    // Generate token number
    const tokenNumber = await TokenAllocationEngine.generateTokenNumber(doctor_id);

    // Create token
    const token = new Token({
      token_number: tokenNumber,
      doctor_id,
      patient_name,
      source,
      is_emergency: is_emergency || false,
      notes
    });

    await token.save();

    // Attempt allocation
    const result = await TokenAllocationEngine.allocateToken(token, preferred_slot_id);

    if (!result.success) {
      // Token created but not allocated - return with alternatives
      await token.populate('doctor_id', 'name');
      result.token = token;
    } else {
      await result.token.populate('slot_id doctor_id');
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all tokens
router.get('/', async (req, res) => {
  try {
    const { doctor_id, slot_id, status, skip = 0, limit = 100 } = req.query;
    const query = {};

    if (doctor_id) query.doctor_id = doctor_id;
    if (slot_id) query.slot_id = slot_id;
    if (status) {
      if (!Object.values(TokenStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(TokenStatus).join(', ')}`
        });
      }
      query.status = status;
    }

    const tokens = await Token.find(query)
      .populate('doctor_id', 'name specialization')
      .populate('slot_id', 'start_time end_time max_capacity')
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tokens.length,
      data: tokens
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific token
router.get('/:id', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('doctor_id', 'name specialization')
      .populate('slot_id', 'start_time end_time max_capacity current_count');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Manually trigger allocation for a pending token
router.post('/:id/allocate', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    const result = await TokenAllocationEngine.allocateToken(token);
    
    if (result.token) {
      await result.token.populate('slot_id doctor_id');
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel a token
router.post('/:id/cancel', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    const { reason } = req.body;
    const success = await TokenAllocationEngine.cancelToken(token, reason);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel token in current state'
      });
    }

    await token.populate('slot_id doctor_id');

    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark token as no-show
router.post('/:id/no-show', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    const success = await TokenAllocationEngine.markNoShow(token);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark token as no-show in current state'
      });
    }

    await token.populate('slot_id doctor_id');

    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reallocate token to different slot
router.post('/:id/reallocate', async (req, res) => {
  try {
    const { new_slot_id } = req.body;

    if (!new_slot_id) {
      return res.status(400).json({
        success: false,
        message: 'new_slot_id is required'
      });
    }

    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    const result = await TokenAllocationEngine.reallocateToken(token, new_slot_id);

    if (result.token) {
      await result.token.populate('slot_id doctor_id');
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create emergency token
router.post('/emergency', async (req, res) => {
  try {
    const { doctor_id, patient_name, notes } = req.body;

    if (!doctor_id || !patient_name) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id and patient_name are required'
      });
    }

    const result = await TokenAllocationEngine.handleEmergencyInsertion(
      doctor_id,
      patient_name,
      notes
    );

    if (result.token) {
      await result.token.populate('slot_id doctor_id');
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get alternative available slots for a token
router.get('/:id/alternatives', async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    const availableSlots = await TokenAllocationEngine.findAvailableSlots(token.doctor_id);

    const alternatives = availableSlots.slice(0, 10).map(slot => ({
      slot_id: slot._id,
      doctor_id: slot.doctor_id._id,
      doctor_name: slot.doctor_id.name,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_capacity: slot.max_capacity,
      current_count: slot.current_count,
      available_slots: slot.max_capacity - slot.current_count,
      is_full: slot.current_count >= slot.max_capacity
    }));

    res.json({
      success: true,
      count: alternatives.length,
      data: alternatives
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
