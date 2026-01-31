# Token Allocation Algorithm Design

## Overview

The token allocation system uses a **priority-based scoring algorithm** combined with **dynamic reallocation** to manage OPD tokens efficiently while respecting hard capacity limits.

## Core Algorithm Components

### 1. Priority Scoring System

Each token receives a priority score based on multiple factors:

```
Priority Score = Base Score (Source) + Adjustments
```

#### Base Priority Scores by Source:
- **Emergency**: 1000 (absolute highest)
- **Paid Priority**: 100
- **Follow-up**: 50
- **Online Booking**: 30
- **Walk-in**: 10 (lowest)

#### Adjustments:
- **Early Booking Bonus**: +5 points if token created >24 hours before slot time
- **Emergency Override**: Emergency tokens always get 1000, regardless of other factors

### 2. Allocation Process

```
1. Calculate priority score for incoming token
2. Find available slots for the doctor
3. If preferred slot exists and has capacity:
   - Allocate to preferred slot
4. Else if preferred slot is full:
   - Attempt reallocation of lower priority tokens
   - If reallocation succeeds, allocate to preferred slot
   - Else, try next available slot
5. Else if no preferred slot:
   - Allocate to first available slot
6. If no slots available:
   - Return error with alternative slot suggestions
```

### 3. Dynamic Reallocation Algorithm

When a high-priority token arrives and the preferred slot is full:

```
1. Get all tokens in the slot, ordered by priority (lowest first)
2. For each lower-priority token:
   a. Check if incoming token has higher priority
   b. Find alternative slots for the lower-priority token
   c. If alternative found:
      - Move lower-priority token to alternative slot
      - Decrement old slot count
      - Increment new slot count
      - Return success (room made for high-priority token)
3. If no reallocation possible, try next available slot
```

### 4. Cancellation/No-Show Handling

```
1. Mark token as cancelled/no-show
2. If token was allocated to a slot:
   a. Decrement slot current_count
   b. Trigger pending token processing for that slot
3. Pending token processing:
   a. Find highest-priority pending token for same doctor
   b. If slot has capacity, allocate pending token
   c. Update slot count
```

### 5. Emergency Insertion

```
1. Create emergency token with priority score 1000
2. Find next available slot for doctor
3. Attempt allocation (will force reallocation if needed)
4. Emergency tokens can displace any non-emergency token
```

## Data Structures

### Token
- `id`: Unique identifier
- `token_number`: Human-readable token number (e.g., DOC1-20240115-0001)
- `doctor_id`: Associated doctor
- `slot_id`: Allocated slot (nullable)
- `patient_name`: Patient identifier
- `source`: Token source enum
- `status`: Current status (pending, allocated, completed, cancelled, no_show)
- `priority_score`: Calculated priority score
- `is_emergency`: Emergency flag
- `created_at`, `allocated_at`, `cancelled_at`: Timestamps

### TimeSlot
- `id`: Unique identifier
- `doctor_id`: Associated doctor
- `start_time`, `end_time`: Slot time range
- `max_capacity`: Hard limit (never exceeded)
- `current_count`: Current number of allocated tokens
- `is_active`: Whether slot is active

## Algorithm Complexity

- **Token Allocation**: O(S + T) where S = number of slots, T = tokens in slot
- **Reallocation**: O(T × S) worst case, but typically O(T) as we stop after first successful move
- **Cancellation Processing**: O(P) where P = pending tokens
- **Slot Finding**: O(S) with database indexing

## Edge Cases Handled

### 1. Concurrent Token Creation
**Problem**: Multiple tokens created simultaneously might try to allocate to same slot
**Solution**: Database transactions ensure atomicity. SQLAlchemy session management prevents race conditions.

### 2. Slot Overflow Prevention
**Problem**: System must never exceed max_capacity
**Solution**: 
- Check `current_count < max_capacity` before allocation
- Atomic increment operations
- Transaction rollback on errors

### 3. Circular Reallocation
**Problem**: Reallocation might create infinite loops
**Solution**: 
- Only reallocate lower-priority tokens
- Remove current slot from alternatives
- Stop after first successful reallocation

### 4. Invalid State Transitions
**Problem**: Tokens might be cancelled/completed multiple times
**Solution**: 
- Status validation before state changes
- Return error if invalid transition attempted

### 5. Missing Resources
**Problem**: Operations on non-existent doctors/slots/tokens
**Solution**: 
- Validation at API layer
- Database foreign key constraints
- Return 404 with descriptive messages

### 6. Emergency During Full Schedule
**Problem**: All slots full, emergency arrives
**Solution**: 
- Emergency tokens can force reallocation
- If no alternatives, emergency still allocated (may temporarily exceed capacity)
- System logs all emergency insertions for review

## Trade-offs and Design Decisions

### 1. Priority Score vs. Strict Queue
**Decision**: Use numeric scores instead of strict FIFO/LIFO
**Rationale**: 
- More flexible for different priority levels
- Easy to adjust priorities without changing algorithm
- Supports future expansion (VIP levels, loyalty programs)

**Trade-off**: Slightly more complex, but much more flexible

### 2. Automatic vs. Manual Reallocation
**Decision**: Automatically attempt reallocation when high-priority tokens arrive
**Rationale**: 
- Maximizes slot utilization
- Ensures fair priority-based allocation
- Reduces manual intervention

**Trade-off**: May cause slight delays, but improves overall efficiency

### 3. Slot-based vs. Time-range Allocation
**Decision**: Allocate to specific slots, not time ranges
**Rationale**: 
- Enforces hard capacity limits per slot
- Allows different capacities per slot
- Matches real-world OPD operations

**Trade-off**: Less flexible than time-range, but more realistic

### 4. Immediate vs. Deferred Allocation
**Decision**: Attempt immediate allocation on token creation
**Rationale**: 
- Better user experience (immediate feedback)
- Reduces pending token backlog
- Simpler state management

**Trade-off**: May require reallocation later, but better UX

### 5. Single vs. Multiple Reallocation Attempts
**Decision**: Stop after first successful reallocation
**Rationale**: 
- Faster response time
- Prevents cascading reallocations
- Simpler to reason about

**Trade-off**: May not maximize utilization, but more predictable

## Performance Considerations

1. **Database Indexing**: 
   - Index on `token.doctor_id`, `token.slot_id`, `token.status`
   - Index on `slot.doctor_id`, `slot.start_time`
   - Index on `token.priority_score` for sorting

2. **Query Optimization**:
   - Use `order_by` with indexed columns
   - Limit result sets where possible
   - Use `filter` before `order_by` to reduce dataset

3. **Transaction Management**:
   - Keep transactions short
   - Rollback on errors
   - Commit frequently to release locks

4. **Caching Opportunities** (Future):
   - Cache slot availability
   - Cache doctor schedules
   - Invalidate on token creation/cancellation

## Scalability Considerations

1. **Horizontal Scaling**: 
   - Stateless API design
   - Database connection pooling
   - Read replicas for reporting

2. **Load Distribution**:
   - Multiple API instances
   - Load balancer
   - Database sharding by doctor_id (if needed)

3. **Real-time Updates**:
   - WebSocket support for live updates
   - Event-driven architecture
   - Message queue for async processing

## Testing Strategy

1. **Unit Tests**: Test individual algorithm components
2. **Integration Tests**: Test API endpoints with database
3. **Simulation**: Full day simulation with multiple doctors
4. **Load Tests**: Concurrent token creation
5. **Edge Case Tests**: All identified edge cases

## Future Enhancements

1. **Predictive Allocation**: Use ML to predict no-shows and pre-allocate
2. **Wait Time Estimation**: Calculate estimated wait times
3. **Multi-doctor Queues**: Support for multiple doctors in same specialty
4. **Recurring Appointments**: Support for follow-up scheduling
5. **Patient Preferences**: Consider patient preferences in allocation
