# Calendar Sync Plugin - Phase 6

RFC 5545 iCalendar format parsing and calendar event management for email workflow integration.

## Features

- **RFC 5545 Parsing**: Full iCalendar format parsing with VEVENT component extraction
- **Event Metadata**: Extract titles, descriptions, locations, dates, times, organizers, attendees
- **Attendee Tracking**: RSVP status tracking (ACCEPTED, DECLINED, TENTATIVE, NEEDS-ACTION)
- **Conflict Detection**: Automatic detection of scheduling conflicts with existing calendar events
- **Time Slot Suggestions**: Smart time slot recommendation using free/busy algorithm
- **Multi-Tenant Support**: Tenant ID filtering for secure calendar operations
- **Comprehensive Validation**: Input validation and RFC compliance checking
- **Error Recovery**: Graceful handling of malformed iCalendar data

## Installation

```bash
npm install @metabuilder/workflow-plugin-calendar-sync
```

## Configuration

### CalendarSyncConfig

```typescript
interface CalendarSyncConfig {
  // Email subject containing the invitation
  emailSubject: string;

  // Email body with embedded iCalendar format
  emailBody: string;

  // MIME type of calendar data (optional)
  calendarMimeType?: string;

  // User's email for attendee matching
  userEmail: string;

  // User's existing calendar events for conflict detection
  existingEvents?: CalendarEvent[];

  // Enable conflict detection (default: true)
  detectConflicts?: boolean;

  // Enable time slot suggestions (default: true)
  suggestTimeSlots?: boolean;

  // Hours to look ahead for suggestions (default: 7 days)
  suggestionHoursAhead?: number;

  // Slot duration in minutes (default: 60)
  suggestionSlotDuration?: number;

  // Tenant ID for multi-tenant context
  tenantId: string;
}
```

## Usage Examples

### Basic Calendar Event Parsing

```typescript
import { calendarSyncExecutor } from '@metabuilder/workflow-plugin-calendar-sync';

const config = {
  emailSubject: 'Team Meeting',
  emailBody: icalendarContent,
  userEmail: 'user@example.com',
  tenantId: 'acme-corp'
};

const result = await calendarSyncExecutor.execute(node, context, state);

if (result.status === 'success') {
  console.log('Event:', result.output.event);
  console.log('User RSVP:', result.output.userRsvpStatus);
}
```

### With Conflict Detection

```typescript
const config = {
  emailSubject: 'Meeting',
  emailBody: icalendarContent,
  userEmail: 'john@example.com',
  existingEvents: [
    {
      eventId: 'event-1',
      title: 'Existing Meeting',
      startTime: '2026-01-31T14:00:00Z',
      endTime: '2026-01-31T15:00:00Z',
      organizer: 'org@example.com',
      attendees: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      sequence: 0,
      status: 'CONFIRMED',
      transparency: 'OPAQUE'
    }
  ],
  detectConflicts: true,
  tenantId: 'acme-corp'
};

const result = await calendarSyncExecutor.execute(node, context, state);

if (result.output.conflicts && result.output.conflicts.length > 0) {
  console.log('Scheduling conflicts detected:');
  result.output.conflicts.forEach(conflict => {
    console.log(`  - ${conflict.eventTitle} (${conflict.overlapMinutes}min overlap)`);
  });
}
```

### With Time Slot Suggestions

```typescript
const config = {
  emailSubject: 'Meeting',
  emailBody: icalendarContent,
  userEmail: 'user@example.com',
  existingEvents: userCalendarEvents,
  suggestTimeSlots: true,
  suggestionHoursAhead: 48, // 2 days
  suggestionSlotDuration: 30, // 30 minute slots
  tenantId: 'acme-corp'
};

const result = await calendarSyncExecutor.execute(node, context, state);

console.log('Suggested time slots:');
result.output.suggestedSlots?.forEach((slot, idx) => {
  console.log(`  ${idx + 1}. ${slot.startTime} - ${slot.endTime}`);
  console.log(`     Availability: ${slot.availabilityScore}%`);
  if (slot.conflicts.length > 0) {
    console.log(`     Conflicts: ${slot.conflicts.join(', ')}`);
  }
});
```

## iCalendar Format

Supported input formats:

### Embedded in Email Body

```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MetaBuilder//Calendar//EN
BEGIN:VEVENT
UID:123e4567-e89b-12d3-a456-426614174000
DTSTAMP:20260124T100000Z
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Team Meeting
DESCRIPTION:Quarterly sync
LOCATION:Conference Room A
ORGANIZER;CN=John Doe:mailto:john@example.com
ATTENDEE;CN=Jane Smith;PARTSTAT=ACCEPTED:mailto:jane@example.com
ATTENDEE;CN=Bob Johnson;PARTSTAT=TENTATIVE:mailto:bob@example.com
CREATED:20260123T100000Z
LAST-MODIFIED:20260123T120000Z
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:OPAQUE
RRULE:FREQ=WEEKLY;COUNT=10
CATEGORIES:Work,Meeting
END:VEVENT
END:VCALENDAR
```

### Supported Properties

| Property | Required | Description |
|----------|----------|-------------|
| UID | Yes | Unique event identifier |
| DTSTART | Yes | Event start time (RFC 3339 format) |
| DTEND | Yes | Event end time |
| SUMMARY | Yes | Event title |
| ORGANIZER | Yes | Organizer email |
| DESCRIPTION | No | Event description |
| LOCATION | No | Event location |
| ATTENDEE | No | Event attendees (repeating) |
| RRULE | No | Recurrence rule |
| CATEGORIES | No | Event categories (comma-separated) |
| STATUS | No | TENTATIVE, CONFIRMED, CANCELLED |
| TRANSP | No | TRANSPARENT (free) or OPAQUE (busy) |

### Attendee RSVP Status

- **NEEDS-ACTION**: No response yet (default)
- **ACCEPTED**: Attendee confirmed attendance
- **DECLINED**: Attendee declined
- **TENTATIVE**: Attendee tentatively accepted

### Attendee Roles

- **REQ-PARTICIPANT**: Required attendee (default)
- **OPT-PARTICIPANT**: Optional attendee
- **CHAIR**: Meeting organizer/chair
- **NON-PARTICIPANT**: Informational attendee

## Output Interfaces

### CalendarEvent

```typescript
interface CalendarEvent {
  eventId: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  location?: string;
  organizer: string;
  organizerName?: string;
  attendees: EventAttendee[];
  recurrenceRule?: string;
  createdAt: string;
  lastModified: string;
  sequence: number;
  status: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
  transparency: 'TRANSPARENT' | 'OPAQUE';
  categories?: string[];
}
```

### TimeConflict

```typescript
interface TimeConflict {
  eventTitle: string;
  conflictStartTime: string;
  conflictEndTime: string;
  severity: 'minor' | 'major'; // minor: partial, major: full overlap
  overlapMinutes: number;
}
```

### TimeSlot

```typescript
interface TimeSlot {
  startTime: string;
  endTime: string;
  availabilityScore: number; // 0-100
  conflicts: string[]; // Conflicting event titles
  isAvailable: boolean; // true if score >= 100
}
```

## Workflow Integration

### Node Configuration

```json
{
  "id": "parse-calendar",
  "type": "calendar-sync",
  "parameters": {
    "emailSubject": "{{ $trigger.email.subject }}",
    "emailBody": "{{ $trigger.email.body }}",
    "userEmail": "{{ $context.userEmail }}",
    "existingEvents": "{{ $context.calendarEvents }}",
    "detectConflicts": true,
    "suggestTimeSlots": true,
    "tenantId": "{{ $context.tenantId }}"
  }
}
```

### Output Variables

```javascript
// Next node can access:
result.event           // Parsed CalendarEvent
result.userRsvpStatus  // RSVP status for current user
result.conflicts       // Array of TimeConflict
result.suggestedSlots  // Array of TimeSlot
result.metrics         // Parsing metrics
result.errors          // Array of CalendarError
result.warnings        // Array of warning messages
```

## Error Handling

### Error Codes

- **INVALID_ICALENDAR**: No iCalendar format found in email body
- **MISSING_UID**: Event UID is required
- **INVALID_DATES**: Missing or invalid DTSTART/DTEND
- **PARSE_ERROR**: iCalendar parsing failed

### Example Error Handling

```typescript
const result = await calendarSyncExecutor.execute(node, context, state);

if (result.status === 'error') {
  console.error('Parse failed:', result.error);
  console.error('Error code:', result.errorCode);
  // Fallback logic
} else if (result.status === 'partial') {
  console.warn('Parse warnings:');
  result.output.warnings.forEach(w => console.warn(`  - ${w}`));
  // Handle partial results
}
```

## Performance Characteristics

- **Parsing time**: <50ms for typical events
- **Conflict detection**: O(n) where n = existing events
- **Time slot suggestions**: O(n*m) where n = hours ahead, m = existing events
- **Memory**: ~500KB per event + attendees

## Testing

Run the comprehensive test suite:

```bash
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm test -- --coverage
```

Test coverage includes:

- RFC 5545 iCalendar parsing
- Event metadata extraction
- Attendee RSVP tracking
- Conflict detection (partial and full overlaps)
- Time slot suggestion algorithm
- Edge cases (line folding, date-only events, missing fields)
- Error handling and validation
- Performance metrics

## RFC 5545 Compliance

This plugin implements the following RFC 5545 features:

- VCALENDAR container component
- VEVENT event component
- DTSTART, DTEND date/time properties
- ATTENDEE with PARTSTAT and ROLE parameters
- ORGANIZER with CN (common name) parameter
- RRULE recurrence rules (parsing only)
- CATEGORIES comma-separated list
- TRANSP transparency (TRANSPARENT/OPAQUE)
- STATUS (TENTATIVE/CONFIRMED/CANCELLED)
- SEQUENCE version tracking
- CREATED, LAST-MODIFIED timestamps

## Limitations

- Recurrence rules parsed but not expanded (calendar service handles expansion)
- Timezone information in dates converted to UTC
- Custom iCalendar extensions ignored
- Maximum attachment size: determined by email service

## Future Enhancements

- Recurrence rule expansion (RRULE FREQ, UNTIL, COUNT)
- Timezone-aware scheduling
- Integration with external calendar services
- Custom event properties
- Event update/modification tracking
- Batch event processing

## Related Plugins

- **email-parser**: RFC 5322 email parsing with MIME support
- **imap-sync**: IMAP server synchronization
- **attachment-handler**: Email attachment processing
- **draft-manager**: Email draft management

## Security Considerations

- All email processing is sandboxed
- Tenant ID filtering ensures data isolation
- iCalendar parsing validates all input
- XSS-safe event metadata handling
- No external network calls

## License

MIT - See LICENSE file in repository
