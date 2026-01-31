/**
 * Token Allocation Engine
 * 
 * Core algorithm for token allocation with:
 * - Per-slot hard limit enforcement
 * - Dynamic reallocation
 * - Priority-based allocation
 * - Emergency handling
 */

const Token = require('../models/Token');
const TimeSlot = require('../models/TimeSlot');
const { TokenSource, TokenStatus } = require('../models/Token');

class TokenAllocationEngine {
  // Priority scores for different token sources (higher = more priority)
  static PRIORITY_SCORES = {
    [TokenSource.EMERGENCY]: 1000,
    [TokenSource.PAID_PRIORITY]: 100,
    [TokenSource.FOLLOW_UP]: 50,
    [TokenSource.ONLINE_BOOKING]: 30,
    [TokenSource.WALK_IN]: 10,
  };

  static EARLY_BOOKING_BONUS = 5; // Bonus for tokens created well in advance

  /**
   * Calculate priority score for a token
   * Higher score = higher priority
   */
  static calculatePriorityScore(token) {
    // Emergency tokens always get highest priority
    if (token.is_emergency || token.source === TokenSource.EMERGENCY) {
      return 1000;
    }

    let baseScore = this.PRIORITY_SCORES[token.source] || 0;

    // Early booking bonus (tokens created > 24 hours in advance)
    if (token.createdAt && token.slot_id) {
      const slot = token.slot_id; // This will be populated later
      // We'll calculate this after slot is known
    }

    return baseScore;
  }

  /**
   * Find available slots for a doctor
   * Returns slots ordered by preference
   */
  static async findAvailableSlots(doctorId, preferredSlotId = null, startTime = null, endTime = null) {
    const query = {
      doctor_id: doctorId,
      is_active: true,
      $expr: { $lt: ['$current_count', '$max_capacity'] }
    };

    if (startTime) {
      query.start_time = { $gte: startTime };
    }
    if (endTime) {
      query.end_time = { $lte: endTime };
    }

    let slots = await TimeSlot.find(query)
      .sort({ start_time: 1 })
      .populate('doctor_id', 'name specialization')
      .exec();

    // Prioritize preferred slot if provided
    if (preferredSlotId) {
      const preferredIndex = slots.findIndex(s => s._id.toString() === preferredSlotId.toString());
      if (preferredIndex > -1) {
        const preferred = slots.splice(preferredIndex, 1)[0];
        slots.unshift(preferred);
      }
    }

    return slots;
  }

  /**
   * Allocate a token to a slot
   */
  static async allocateToken(token, preferredSlotId = null) {
    try {
      // Calculate priority score
      token.priority_score = this.calculatePriorityScore(token);
      await token.save();

      // Find available slots
      const availableSlots = await this.findAvailableSlots(
        token.doctor_id,
        preferredSlotId
      );

      if (availableSlots.length === 0) {
        // No slots available - return alternatives for future slots
        const futureSlots = await TimeSlot.find({
          doctor_id: token.doctor_id,
          is_active: true,
          start_time: { $gt: new Date() }
        })
          .sort({ start_time: 1 })
          .limit(5)
          .populate('doctor_id', 'name')
          .exec();

        const alternativeSlots = futureSlots.map(slot => ({
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

        return {
          success: false,
          message: 'No available slots at this time',
          alternative_slots: alternativeSlots
        };
      }

      // Select best available slot
      let selectedSlot = availableSlots[0];

      // Check if slot is full (double-check after query)
      if (selectedSlot.current_count >= selectedSlot.max_capacity) {
        // Try to reallocate lower priority tokens
        const reallocated = await this.tryReallocation(selectedSlot, token);
        if (!reallocated) {
          // Reallocation failed, try next slot
          if (availableSlots.length > 1) {
            selectedSlot = availableSlots[1];
          } else {
            return {
              success: false,
              message: 'All slots are full. Cannot allocate token.'
            };
          }
        }
      }

      // Refresh slot to get latest count
      selectedSlot = await TimeSlot.findById(selectedSlot._id);

      // Allocate token to slot
      token.slot_id = selectedSlot._id;
      token.status = TokenStatus.ALLOCATED;
      token.allocated_at = new Date();
      await token.save();

      // Increment slot count atomically
      await TimeSlot.findByIdAndUpdate(
        selectedSlot._id,
        { $inc: { current_count: 1 } }
      );

      await token.populate('slot_id doctor_id');

      return {
        success: true,
        token: token,
        message: `Token allocated to slot starting at ${selectedSlot.start_time}`
      };

    } catch (error) {
      console.error('Error allocating token:', error);
      return {
        success: false,
        message: `Error allocating token: ${error.message}`
      };
    }
  }

  /**
   * Try to reallocate lower priority tokens from a slot
   */
  static async tryReallocation(slot, incomingToken) {
    // Get tokens in slot ordered by priority (lowest first)
    const tokensInSlot = await Token.find({
      slot_id: slot._id,
      status: TokenStatus.ALLOCATED,
      _id: { $ne: incomingToken._id }
    })
      .sort({ priority_score: 1 })
      .exec();

    // Try to move lower priority tokens to other slots
    for (const tokenToMove of tokensInSlot) {
      if (incomingToken.priority_score <= tokenToMove.priority_score) {
        // Incoming token doesn't have higher priority, can't reallocate
        break;
      }

      // Find alternative slot for this token
      const alternativeSlots = await this.findAvailableSlots(
        tokenToMove.doctor_id,
        null,
        slot.start_time // Prefer slots after current
      );

      // Remove current slot from alternatives
      const filteredAlternatives = alternativeSlots.filter(
        s => s._id.toString() !== slot._id.toString()
      );

      if (filteredAlternatives.length > 0) {
        // Move token to alternative slot
        const oldSlot = await TimeSlot.findById(tokenToMove.slot_id);
        const newSlot = filteredAlternatives[0];

        // Use transaction-like operations
        await TimeSlot.findByIdAndUpdate(
          oldSlot._id,
          { $inc: { current_count: -1 } }
        );

        tokenToMove.slot_id = newSlot._id;
        await tokenToMove.save();

        await TimeSlot.findByIdAndUpdate(
          newSlot._id,
          { $inc: { current_count: 1 } }
        );

        console.log(
          `Reallocated token ${tokenToMove.token_number} from slot ${oldSlot._id} ` +
          `to slot ${newSlot._id} to make room for higher priority token`
        );
        return true;
      }
    }

    return false;
  }

  /**
   * Cancel a token and free up the slot
   */
  static async cancelToken(token, reason = null) {
    try {
      if ([TokenStatus.COMPLETED, TokenStatus.CANCELLED].includes(token.status)) {
        return false;
      }

      // Free up slot if allocated
      if (token.slot_id) {
        await TimeSlot.findByIdAndUpdate(
          token.slot_id,
          { $inc: { current_count: -1 } }
        );
      }

      token.status = TokenStatus.CANCELLED;
      token.cancelled_at = new Date();
      if (reason) {
        token.notes = reason;
      }
      await token.save();

      // Try to allocate pending tokens to the freed slot
      if (token.slot_id) {
        await this.processPendingTokensForSlot(token.slot_id);
      }

      console.log(`Token ${token.token_number} cancelled`);
      return true;

    } catch (error) {
      console.error('Error cancelling token:', error);
      return false;
    }
  }

  /**
   * Mark a token as no-show
   */
  static async markNoShow(token) {
    try {
      if (token.status !== TokenStatus.ALLOCATED) {
        return false;
      }

      // Free up slot
      if (token.slot_id) {
        await TimeSlot.findByIdAndUpdate(
          token.slot_id,
          { $inc: { current_count: -1 } }
        );
      }

      token.status = TokenStatus.NO_SHOW;
      await token.save();

      // Try to allocate pending tokens
      if (token.slot_id) {
        await this.processPendingTokensForSlot(token.slot_id);
      }

      console.log(`Token ${token.token_number} marked as no-show`);
      return true;

    } catch (error) {
      console.error('Error marking no-show:', error);
      return false;
    }
  }

  /**
   * Handle emergency token insertion
   */
  static async handleEmergencyInsertion(doctorId, patientName, notes = null) {
    try {
      // Find next available slot for the doctor
      const nextSlot = await TimeSlot.findOne({
        doctor_id: doctorId,
        is_active: true,
        start_time: { $gte: new Date() }
      })
        .sort({ start_time: 1 })
        .exec();

      if (!nextSlot) {
        return {
          success: false,
          message: 'No future slots available for emergency insertion'
        };
      }

      // Generate token number
      const tokenNumber = await this.generateTokenNumber(doctorId);

      // Create emergency token
      const emergencyToken = new Token({
        token_number: tokenNumber,
        doctor_id: doctorId,
        patient_name: patientName,
        source: TokenSource.EMERGENCY,
        is_emergency: true,
        notes: notes,
        priority_score: 1000,
        status: TokenStatus.PENDING
      });

      await emergencyToken.save();

      // Allocate emergency token (will force reallocation if needed)
      const result = await this.allocateToken(emergencyToken, nextSlot._id);

      if (result.success) {
        console.log(`Emergency token ${tokenNumber} inserted successfully`);
      }

      return result;

    } catch (error) {
      console.error('Error handling emergency insertion:', error);
      return {
        success: false,
        message: `Error handling emergency: ${error.message}`
      };
    }
  }

  /**
   * Reallocate a token to a different slot
   */
  static async reallocateToken(token, newSlotId) {
    try {
      const newSlot = await TimeSlot.findById(newSlotId);
      if (!newSlot) {
        return {
          success: false,
          message: 'Target slot not found'
        };
      }

      if (newSlot.current_count >= newSlot.max_capacity) {
        return {
          success: false,
          message: 'Target slot is full'
        };
      }

      // Free old slot
      if (token.slot_id) {
        await TimeSlot.findByIdAndUpdate(
          token.slot_id,
          { $inc: { current_count: -1 } }
        );
      }

      // Allocate to new slot
      token.slot_id = newSlotId;
      token.allocated_at = new Date();
      await token.save();

      await TimeSlot.findByIdAndUpdate(
        newSlotId,
        { $inc: { current_count: 1 } }
      );

      await token.populate('slot_id doctor_id');

      console.log(`Token ${token.token_number} reallocated to slot ${newSlotId}`);

      return {
        success: true,
        token: token,
        message: `Token reallocated to slot starting at ${newSlot.start_time}`
      };

    } catch (error) {
      console.error('Error reallocating token:', error);
      return {
        success: false,
        message: `Error reallocating token: ${error.message}`
      };
    }
  }

  /**
   * Process pending tokens that might fit into a slot
   */
  static async processPendingTokensForSlot(slotId) {
    const slot = await TimeSlot.findById(slotId);
    if (!slot || slot.current_count >= slot.max_capacity) {
      return;
    }

    // Find pending tokens for the same doctor, ordered by priority
    const pendingTokens = await Token.find({
      status: TokenStatus.PENDING,
      slot_id: null,
      doctor_id: slot.doctor_id
    })
      .sort({ priority_score: -1 })
      .exec();

    // Try to allocate pending tokens to this slot
    for (const token of pendingTokens) {
      if (slot.current_count < slot.max_capacity) {
        token.slot_id = slotId;
        token.status = TokenStatus.ALLOCATED;
        token.allocated_at = new Date();
        await token.save();

        await TimeSlot.findByIdAndUpdate(
          slotId,
          { $inc: { current_count: 1 } }
        );

        console.log(`Auto-allocated pending token ${token.token_number} to slot ${slotId}`);
        break; // Only allocate one at a time
      }
    }
  }

  /**
   * Generate unique token number
   */
  static async generateTokenNumber(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

    // Count tokens created today for this doctor
    const count = await Token.countDocuments({
      doctor_id: doctorId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Use last 4 characters of doctor ID or a sequential number
    const doctorIdStr = doctorId.toString();
    const doctorNum = doctorIdStr.length >= 4 
      ? doctorIdStr.slice(-4) 
      : doctorIdStr.padStart(4, '0');

    return `DOC${doctorNum}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
}

module.exports = TokenAllocationEngine;
