/**
 * Calendar Sync Executor - Comprehensive Test Suite
 * Tests RFC 5545 iCalendar parsing, conflict detection, and time slot suggestions
 */

import {
  CalendarSyncExecutor,
  CalendarEvent,
  EventAttendee,
  CalendarSyncConfig,
  TimeConflict,
  TimeSlot
} from './index';

describe('CalendarSyncExecutor', () => {
  let executor: CalendarSyncExecutor;

  beforeEach(() => {
    executor = new CalendarSyncExecutor();
  });

  describe('Basic Initialization', () => {
    it('should create executor instance with correct node type', () => {
      expect(executor.nodeType).toBe('calendar-sync');
      expect(executor.category).toBe('email-integration');
      expect(executor.description).toContain('iCalendar');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required parameters', () => {
      const invalidConfigs = [
        { emailBody: '', userEmail: 'user@example.com', tenantId: 'test' },
        { emailBody: 'test', userEmail: '', tenantId: 'test' },
        { emailBody: 'test', userEmail: 'user@example.com', tenantId: '' }
      ];

      invalidConfigs.forEach(config => {
        const result = executor.validate({
          id: 'test',
          type: 'calendar-sync',
          parameters: config as any
        });
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate email address format', () => {
      const result = executor.validate({
        id: 'test',
        type: 'calendar-sync',
        parameters: {
          emailBody: 'test',
          userEmail: 'invalid-email',
          tenantId: 'test'
        } as any
      });
      expect(result.valid).toBe(false);
    });

    it('should accept valid configuration', () => {
      const result = executor.validate({
        id: 'test',
        type: 'calendar-sync',
        parameters: {
          emailBody: 'test',
          userEmail: 'user@example.com',
          tenantId: 'test'
        } as any
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('iCalendar Parsing', () => {
    const validICalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:123e4567-e89b-12d3-a456-426614174000
DTSTAMP:20260124T100000Z
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Team Meeting
DESCRIPTION:Quarterly team sync
LOCATION:Conference Room A
ORGANIZER;CN=John Doe:mailto:john@example.com
ATTENDEE;CN=Jane Smith;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:jane@example.com
ATTENDEE;CN=Bob Johnson;ROLE=OPT-PARTICIPANT;PARTSTAT=TENTATIVE:mailto:bob@example.com
CREATED:20260123T100000Z
LAST-MODIFIED:20260123T120000Z
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:OPAQUE
CATEGORIES:Work,Meeting
END:VEVENT
END:VCALENDAR`;

    it('should parse basic calendar event', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Team Meeting',
        emailBody: validICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.status).toBe('success');
      expect(result.output.event).toBeDefined();
      expect(result.output.event!.title).toBe('Team Meeting');
      expect(result.output.event!.location).toBe('Conference Room A');
    });

    it('should extract event metadata correctly', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Team Meeting',
        emailBody: validICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      const event = result.output.event!;
      expect(event.eventId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(event.organizer).toBe('john@example.com');
      expect(event.organizerName).toBe('Jane Smith'); // CN parsed from ORGANIZER
      expect(event.status).toBe('CONFIRMED');
      expect(event.transparency).toBe('OPAQUE');
      expect(event.sequence).toBe(0);
    });

    it('should parse attendees with RSVP status', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Team Meeting',
        emailBody: validICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      const attendees = result.output.event!.attendees;
      expect(attendees.length).toBe(2);

      // Find specific attendees
      const jane = attendees.find(a => a.email === 'jane@example.com');
      expect(jane).toBeDefined();
      expect(jane!.rsvpStatus).toBe('ACCEPTED');
      expect(jane!.role).toBe('REQ-PARTICIPANT');
      expect(jane!.isRequired).toBe(true);

      const bob = attendees.find(a => a.email === 'bob@example.com');
      expect(bob).toBeDefined();
      expect(bob!.rsvpStatus).toBe('TENTATIVE');
      expect(bob!.role).toBe('OPT-PARTICIPANT');
      expect(bob!.isRequired).toBe(false);
    });

    it('should parse event dates in ISO 8601 format', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Team Meeting',
        emailBody: validICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      const event = result.output.event!;
      expect(event.startTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(event.endTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Verify times are in correct order
      expect(new Date(event.startTime) < new Date(event.endTime)).toBe(true);
    });

    it('should extract categories from event', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Team Meeting',
        emailBody: validICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      const categories = result.output.event!.categories;
      expect(categories).toContain('Work');
      expect(categories).toContain('Meeting');
    });

    it('should handle missing optional fields', async () => {
      const minimalICalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-123
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Meeting
ORGANIZER:mailto:organizer@example.com
END:VEVENT
END:VCALENDAR`;

      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: minimalICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.status).toBe('success');
      expect(result.output.event!.description).toBeUndefined();
      expect(result.output.event!.location).toBeUndefined();
      expect(result.output.event!.recurrenceRule).toBeUndefined();
    });

    it('should reject event without UID', async () => {
      const noUidICalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Meeting
ORGANIZER:mailto:organizer@example.com
END:VEVENT
END:VCALENDAR`;

      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: noUidICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('CALENDAR_PARSE_ERROR');
    });

    it('should reject event with missing dates', async () => {
      const noDatesICalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-123
SUMMARY:Meeting
ORGANIZER:mailto:organizer@example.com
END:VEVENT
END:VCALENDAR`;

      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: noDatesICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.status).toBe('error');
    });
  });

  describe('Attendee Tracking', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:event-123
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Meeting
ORGANIZER:mailto:organizer@example.com
ATTENDEE;CN=User;PARTSTAT=NEEDS-ACTION:mailto:user@example.com
ATTENDEE;PARTSTAT=DECLINED:mailto:declined@example.com
ATTENDEE;PARTSTAT=ACCEPTED:mailto:accepted@example.com
END:VEVENT
END:VCALENDAR`;

    it('should track user RSVP status', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: icalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.userRsvpStatus).toBe('NEEDS-ACTION');
    });

    it('should default RSVP to NEEDS-ACTION if user not found', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: icalendar,
        userEmail: 'unknown@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.userRsvpStatus).toBe('NEEDS-ACTION');
    });
  });

  describe('Conflict Detection', () => {
    const eventICalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:new-event
DTSTART:20260131T143000Z
DTEND:20260131T153000Z
SUMMARY:New Meeting
ORGANIZER:mailto:organizer@example.com
END:VEVENT
END:VCALENDAR`;

    it('should detect conflicts with existing events', async () => {
      const existingEvent: CalendarEvent = {
        eventId: 'existing-1',
        title: 'Existing Meeting',
        startTime: '2026-01-31T14:00:00Z',
        endTime: '2026-01-31T15:00:00Z',
        organizer: 'organizer@example.com',
        attendees: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        sequence: 0,
        status: 'CONFIRMED',
        transparency: 'OPAQUE'
      };

      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [existingEvent],
        detectConflicts: true,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.conflicts).toBeDefined();
      expect(result.output.conflicts!.length).toBeGreaterThan(0);

      const conflict = result.output.conflicts![0];
      expect(conflict.eventTitle).toBe('Existing Meeting');
      expect(conflict.overlapMinutes).toBeGreaterThan(0);
    });

    it('should classify conflicts as major or minor', async () => {
      const partialOverlap: CalendarEvent = {
        eventId: 'partial',
        title: 'Partial Meeting',
        startTime: '2026-01-31T13:45:00Z',
        endTime: '2026-01-31T14:15:00Z',
        organizer: 'organizer@example.com',
        attendees: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        sequence: 0,
        status: 'CONFIRMED',
        transparency: 'OPAQUE'
      };

      const fullOverlap: CalendarEvent = {
        eventId: 'full',
        title: 'Full Meeting',
        startTime: '2026-01-31T14:00:00Z',
        endTime: '2026-01-31T15:30:00Z',
        organizer: 'organizer@example.com',
        attendees: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        sequence: 0,
        status: 'CONFIRMED',
        transparency: 'OPAQUE'
      };

      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [partialOverlap, fullOverlap],
        detectConflicts: true,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      const conflicts = result.output.conflicts!;
      expect(conflicts.length).toBe(2);

      // Partial overlap should be 'minor'
      const minorConflict = conflicts.find(c => c.eventTitle === 'Partial Meeting');
      expect(minorConflict?.severity).toBe('minor');

      // Full overlap should be 'major'
      const majorConflict = conflicts.find(c => c.eventTitle === 'Full Meeting');
      expect(majorConflict?.severity).toBe('major');
    });

    it('should detect overlap duration in minutes', async () => {
      const overlappingEvent: CalendarEvent = {
        eventId: 'overlap',
        title: 'Overlapping Meeting',
        startTime: '2026-01-31T14:15:00Z',
        endTime: '2026-01-31T14:45:00Z',
        organizer: 'organizer@example.com',
        attendees: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        sequence: 0,
        status: 'CONFIRMED',
        transparency: 'OPAQUE'
      };

      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [overlappingEvent],
        detectConflicts: true,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      const conflict = result.output.conflicts![0];
      expect(conflict.overlapMinutes).toBe(30); // 30 minute overlap
    });

    it('should not detect conflicts if detectConflicts is false', async () => {
      const existingEvent: CalendarEvent = {
        eventId: 'existing',
        title: 'Existing Meeting',
        startTime: '2026-01-31T14:00:00Z',
        endTime: '2026-01-31T15:00:00Z',
        organizer: 'organizer@example.com',
        attendees: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        sequence: 0,
        status: 'CONFIRMED',
        transparency: 'OPAQUE'
      };

      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [existingEvent],
        detectConflicts: false,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.conflicts).toBeUndefined();
    });
  });

  describe('Time Slot Suggestions', () => {
    const eventICalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:new-event
DTSTART:20260131T093000Z
DTEND:20260131T103000Z
SUMMARY:New Meeting
ORGANIZER:mailto:organizer@example.com
END:VEVENT
END:VCALENDAR`;

    it('should suggest available time slots', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [],
        suggestTimeSlots: true,
        suggestionHoursAhead: 24,
        suggestionSlotDuration: 60,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.suggestedSlots).toBeDefined();
      expect(result.output.suggestedSlots!.length).toBeGreaterThan(0);

      // All suggested slots should be available
      const slots = result.output.suggestedSlots!;
      expect(slots[0].availabilityScore).toBeGreaterThanOrEqual(80);
    });

    it('should rank slots by availability score', async () => {
      const busyEvent: CalendarEvent = {
        eventId: 'busy',
        title: 'Busy Time',
        startTime: '2026-01-31T13:00:00Z',
        endTime: '2026-01-31T14:00:00Z',
        organizer: 'organizer@example.com',
        attendees: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        sequence: 0,
        status: 'CONFIRMED',
        transparency: 'OPAQUE'
      };

      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [busyEvent],
        suggestTimeSlots: true,
        suggestionHoursAhead: 24,
        suggestionSlotDuration: 60,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      const slots = result.output.suggestedSlots!;
      // Slots should be sorted by availability score descending
      for (let i = 0; i < slots.length - 1; i++) {
        expect(slots[i].availabilityScore).toBeGreaterThanOrEqual(slots[i + 1].availabilityScore);
      }
    });

    it('should return maximum 5 suggestions', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [],
        suggestTimeSlots: true,
        suggestionHoursAhead: 168, // 1 week
        suggestionSlotDuration: 60,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.suggestedSlots!.length).toBeLessThanOrEqual(5);
    });

    it('should not suggest slots if suggestTimeSlots is false', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'New Meeting',
        emailBody: eventICalendar,
        userEmail: 'user@example.com',
        existingEvents: [],
        suggestTimeSlots: false,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.suggestedSlots).toBeUndefined();
    });
  });

  describe('Metrics and Performance', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:event-123
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Meeting
DESCRIPTION:Test description
ORGANIZER:mailto:organizer@example.com
ATTENDEE:mailto:attendee1@example.com
ATTENDEE:mailto:attendee2@example.com
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT
END:VCALENDAR`;

    it('should track parsing duration', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: icalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.metrics.parseDurationMs).toBeGreaterThanOrEqual(0);
      expect(result.duration).toBeGreaterThanOrEqual(result.output.metrics.parseDurationMs);
    });

    it('should count attendees', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: icalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.metrics.attendeeCount).toBe(2);
    });

    it('should detect recurrence', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: icalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.metrics.hasRecurrence).toBe(true);
      expect(result.output.event!.recurrenceRule).toBeDefined();
    });

    it('should update conflict metrics', async () => {
      const existingEvent: CalendarEvent = {
        eventId: 'existing',
        title: 'Existing',
        startTime: '2026-01-31T14:00:00Z',
        endTime: '2026-01-31T15:00:00Z',
        organizer: 'org@example.com',
        attendees: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        sequence: 0,
        status: 'CONFIRMED',
        transparency: 'OPAQUE'
      };

      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: icalendar,
        userEmail: 'user@example.com',
        existingEvents: [existingEvent],
        detectConflicts: true,
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.metrics.conflictCount).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing iCalendar format', async () => {
      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: 'Just a plain text email with no calendar data',
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.status).toBe('error');
      expect(result.output.errors[0].code).toBe('INVALID_ICALENDAR');
    });

    it('should handle line folding in iCalendar', async () => {
      const foldedICalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:event-123
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Meeting with very long title that
 continues on the next line
ORGANIZER:mailto:organizer@example.com
END:VEVENT
END:VCALENDAR`;

      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: foldedICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.status).toBe('success');
      expect(result.output.event!.title).toContain('Meeting');
    });

    it('should handle case-insensitive email matching for RSVP', async () => {
      const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:event-123
DTSTART:20260131T140000Z
DTEND:20260131T150000Z
SUMMARY:Meeting
ORGANIZER:mailto:organizer@example.com
ATTENDEE;PARTSTAT=ACCEPTED:mailto:User@Example.COM
END:VEVENT
END:VCALENDAR`;

      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: icalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.output.userRsvpStatus).toBe('ACCEPTED');
    });

    it('should handle date-only format (no time)', async () => {
      const dateOnlyICalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:event-123
DTSTART:20260131
DTEND:20260201
SUMMARY:All-day event
ORGANIZER:mailto:organizer@example.com
END:VEVENT
END:VCALENDAR`;

      const config: CalendarSyncConfig = {
        emailSubject: 'Meeting',
        emailBody: dateOnlyICalendar,
        userEmail: 'user@example.com',
        tenantId: 'test'
      };

      const result = await executor.execute(
        {
          id: 'test',
          type: 'calendar-sync',
          parameters: config
        } as any,
        {} as any,
        {} as any
      );

      expect(result.status).toBe('success');
      expect(result.output.event).toBeDefined();
    });
  });
});
