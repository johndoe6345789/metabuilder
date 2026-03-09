# Connection 1:1 Constraint Test Plan

## Issue Description
Two purple arrows (or multiple arrows) coming from the same connection point on an idea card. Each handle should support exactly ONE connection (1:1 constraint).

## Implementation Details

### Core Logic
The `validateAndRemoveConflicts` function enforces the 1:1 constraint:
- For any new connection, it checks all existing edges
- Removes edges that conflict with the source handle OR target handle
- Returns filtered edges, count of removed edges, and conflict descriptions

### Key Functions Modified
1. **onConnect** - Creates new connections with conflict resolution
2. **onReconnect** - Remaps existing connections with conflict resolution
3. **validateAndRemoveConflicts** - Core validation logic (new)

## Test Cases

### Test Case 1: Basic Connection Creation
**Steps:**
1. Go to Feature Idea Cloud
2. Click the 🔍 Debug button to open the debug panel
3. Drag from Idea A's right handle to Idea B's left handle
4. Verify in debug panel that:
   - Idea A's right handle shows ✓ (occupied)
   - Idea B's left handle shows ✓ (occupied)
   - Total edges increased by 1

**Expected Result:** Connection created successfully, both handles marked as occupied

### Test Case 2: Prevent Multiple Connections from Same Source Handle
**Steps:**
1. Create connection: Idea A[right] → Idea B[left]
2. Verify connection exists in debug panel
3. Try to create: Idea A[right] → Idea C[left]
4. Check debug panel and toast notification

**Expected Result:**
- Toast shows "Connection remapped! (1 old connection removed)"
- Idea A's right handle now connects to Idea C only
- Old connection to Idea B is removed
- Debug panel shows only 1 connection from Idea A's right handle

### Test Case 3: Prevent Multiple Connections to Same Target Handle
**Steps:**
1. Create connection: Idea A[right] → Idea B[left]
2. Try to create: Idea C[right] → Idea B[left]
3. Check debug panel

**Expected Result:**
- Toast shows "Connection remapped! (1 old connection removed)"
- Idea B's left handle now connects from Idea C only
- Old connection from Idea A is removed
- Debug panel shows only 1 connection to Idea B's left handle

### Test Case 4: Reconnection (Remapping) from Source
**Steps:**
1. Create connection: Idea A[right] → Idea B[left]
2. Drag the source end (at Idea A) to Idea A's bottom handle
3. Check debug panel

**Expected Result:**
- Connection now goes from Idea A[bottom] → Idea B[left]
- Idea A's right handle is now free (○)
- Idea A's bottom handle is now occupied (✓)
- Toast shows "Connection remapped!"

### Test Case 5: Reconnection (Remapping) to Different Target
**Steps:**
1. Create connection: Idea A[right] → Idea B[left]
2. Drag the target end (at Idea B) to Idea C's left handle
3. Check debug panel

**Expected Result:**
- Connection now goes from Idea A[right] → Idea C[left]
- Idea B's left handle is now free (○)
- Idea C's left handle is now occupied (✓)

### Test Case 6: Reconnection with Conflict Resolution
**Steps:**
1. Create connection 1: Idea A[right] → Idea B[left]
2. Create connection 2: Idea C[right] → Idea D[left]
3. Drag connection 2's target from Idea D to Idea B's left handle
4. Check debug panel

**Expected Result:**
- Connection 1 is removed (conflict on Idea B's left handle)
- Connection 2 now goes: Idea C[right] → Idea B[left]
- Toast shows "Connection remapped! (1 conflicting connection removed)"
- Idea B's left handle shows only 1 connection total

### Test Case 7: Database Persistence
**Steps:**
1. Create several connections with various conflict resolutions
2. Note the final state in the debug panel
3. Refresh the page (F5)
4. Open debug panel again

**Expected Result:**
- All connections persist exactly as they were
- No duplicate connections on any handle
- Debug panel shows same state as before refresh

### Test Case 8: Console Logging Verification
**Steps:**
1. Open browser DevTools console
2. Create a new connection
3. Look for log entries starting with `[Connection]`

**Expected Result:**
```
[Connection] New connection attempt: { source: "idea-X[right]", target: "idea-Y[left]" }
[Connection Validator] Conflicts detected and resolved: [...]  // (if conflicts exist)
[Connection] New edge created: edge-123456789
[Connection] Total edges after addition: N
[Connection] Edges by handle: [...]
```

### Test Case 9: Multiple Handles Per Node
**Steps:**
1. Create 4 different connections from a single idea using all 4 handles:
   - Idea A[left] ← Idea B[right]
   - Idea A[right] → Idea C[left]
   - Idea A[top] ← Idea D[bottom]
   - Idea A[bottom] → Idea E[top]
2. Check debug panel for Idea A

**Expected Result:**
- All 4 handles show ✓ (occupied)
- Total connections for Idea A: 4
- Each handle has exactly 1 connection
- No conflicts exist

### Test Case 10: Edge Case - Same Source and Target
**Steps:**
1. Create connection: Idea A[right] → Idea B[left]
2. Create connection: Idea C[right] → Idea D[left]
3. Remap connection 2 to: Idea A[right] → Idea B[left]

**Expected Result:**
- Connection 1 is removed (conflicts on BOTH source AND target)
- Connection 2 takes over both handles
- Toast shows "Connection remapped! (1 conflicting connection removed)"
- Only 1 arrow exists between Idea A and Idea B

## Visual Indicators in Debug Panel

The debug panel shows a grid for each idea card with 4 handle positions:
- `← ✓` or `← ○` (left handle - incoming)
- `→ ✓` or `→ ○` (right handle - outgoing)
- `↑ ✓` or `↑ ○` (top handle - incoming)
- `↓ ✓` or `↓ ○` (bottom handle - outgoing)

Green background = Handle is occupied (✓)
Gray background = Handle is free (○)

## Success Criteria

✅ All test cases pass
✅ No multiple arrows from/to same connection point
✅ Automatic conflict resolution works correctly
✅ Changes persist to database
✅ Console logs provide clear debugging information
✅ Toast notifications inform user of remapping
✅ Debug panel accurately reflects connection state

## How to Run Tests

1. Navigate to Feature Idea Cloud page in the app
2. Click the 🔍 debug icon in the top-right panel
3. Follow each test case step-by-step
4. Verify expected results using:
   - Visual inspection of arrows on canvas
   - Debug panel handle occupancy display
   - Toast notifications
   - Browser console logs
5. Test persistence by refreshing the page

## Notes for Developer

- The debug panel is ONLY for testing and can be removed once all tests pass
- All console.log statements with `[Connection]` and `[Reconnection]` prefixes are for debugging
- The validateAndRemoveConflicts function is the core of the 1:1 constraint
- Each handle ID is either 'left', 'right', 'top', 'bottom', or 'default'
- The logic treats missing sourceHandle/targetHandle as 'default'
