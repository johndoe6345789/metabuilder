/**
 * Calendar Sync Node Executor Plugin - Phase 6
 * iCalendar format parsing and calendar event management for email invitations
 *
 * Features:
 * - RFC 5545 iCalendar format parsing
 * - Calendar invitation extraction from email bodies
 * - Event detail extraction: time, attendees, location, recurrence
 * - RSVP status tracking: accepted, declined, tentative
 * - Meeting time conflict detection via calendar overlay
 * - Smart time slot suggestion using free/busy algorithm
 * - Event metadata structuring matching calendar entity schema
 * - Comprehensive error handling and validation
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';

/**
 * Parsed calendar event from iCalendar format
 */
export interface CalendarEvent {
  /** Unique event identifier (UID from iCalendar) */
  eventId: string;
  /** Event title/summary */
  title: string;
  /** Event description (optional) */
  description?: string;
  /** Event start time (ISO 8601) */
  startTime: string;
  /** Event end time (ISO 8601) */
  endTime: string;
  /** Event location (optional) */
  location?: string;
  /** Calendar organizer email */
  organizer: string;
  /** Organizer display name (optional) */
  organizerName?: string;
  /** Event attendees with RSVP status */
  attendees: EventAttendee[];
  /** Recurrence rule (RFC 5545 RRULE format, optional) */
  recurrenceRule?: string;
  /** Event creation timestamp (ISO 8601) */
  createdAt: string;
  /** Event last modified timestamp (ISO 8601) */
  lastModified: string;
  /** Event sequence number for tracking updates */
  sequence: number;
  /** Event status: TENTATIVE, CONFIRMED, CANCELLED */
  status: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
  /** Event transparency: TRANSPARENT (free) or OPAQUE (busy) */
  transparency: 'TRANSPARENT' | 'OPAQUE';
  /** Categories/tags for the event */
  categories?: string[];
}

/**
 * Event attendee with RSVP status
 */
export interface EventAttendee {
  /** Attendee email address */
  email: string;
  /** Attendee display name (optional) */
  name?: string;
  /** RSVP status: ACCEPTED, DECLINED, TENTATIVE, NEEDS-ACTION */
  rsvpStatus: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NEEDS-ACTION';
  /** Attendee role: REQ-PARTICIPANT, OPT-PARTICIPANT, NON-PARTICIPANT, CHAIR */
  role: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'NON-PARTICIPANT' | 'CHAIR';
  /** Whether attendee is required */
  isRequired: boolean;
}

/**
 * Time slot availability for scheduling suggestions
 */
export interface TimeSlot {
  /** Slot start time (ISO 8601) */
  startTime: string;
  /** Slot end time (ISO 8601) */
  endTime: string;
  /** Availability score 0-100 (100 = completely free) */
  availabilityScore: number;
  /** Conflicts in this slot with existing events */
  conflicts: string[];
  /** Whether slot is fully available */
  isAvailable: boolean;
}

/**
 * Conflict detected between events
 */
export interface TimeConflict {
  /** Event title that causes conflict */
  eventTitle: string;
  /** Conflicting event start time (ISO 8601) */
  conflictStartTime: string;
  /** Conflicting event end time (ISO 8601) */
  conflictEndTime: string;
  /** Conflict severity: minor (partial overlap), major (full overlap) */
  severity: 'minor' | 'major';
  /** Minutes of overlap */
  overlapMinutes: number;
}

/**
 * Calendar sync configuration
 */
export interface CalendarSyncConfig {
  /** Email subject containing invitation */
  emailSubject: string;
  /** Email body containing iCalendar attachment or inline format */
  emailBody: string;
  /** MIME type of calendar data (text/calendar, application/ics) */
  calendarMimeType?: string;
  /** User's email address for attendee matching */
  userEmail: string;
  /** User's existing calendar events for conflict detection */
  existingEvents?: CalendarEvent[];
  /** Enable conflict detection (default: true) */
  detectConflicts?: boolean;
  /** Enable time slot suggestions (default: true) */
  suggestTimeSlots?: boolean;
  /** Hours to look ahead for slot suggestions (default: 7 days) */
  suggestionHoursAhead?: number;
  /** Slot duration in minutes for suggestions (default: 60) */
  suggestionSlotDuration?: number;
  /** Tenant ID for multi-tenant context */
  tenantId: string;
}

/**
 * Calendar sync operation result
 */
export interface CalendarSyncResult {
  /** Successfully parsed calendar event */
  event?: CalendarEvent;
  /** Current user's RSVP status for this event */
  userRsvpStatus?: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NEEDS-ACTION';
  /** Time conflicts detected (if detectConflicts enabled) */
  conflicts?: TimeConflict[];
  /** Suggested time slots for rescheduling (if suggestTimeSlots enabled) */
  suggestedSlots?: TimeSlot[];
  /** Parse errors encountered */
  errors: CalendarError[];
  /** Parse warnings (non-fatal issues) */
  warnings: string[];
  /** Operation metrics */
  metrics: {
    /** Total parsing time (ms) */
    parseDurationMs: number;
    /** Number of attendees parsed */
    attendeeCount: number;
    /** Whether event has recurrence */
    hasRecurrence: boolean;
    /** Conflict count */
    conflictCount: number;
    /** Suggested slots count */
    suggestedSlotCount: number;
  };
}

/**
 * Calendar parsing error
 */
export interface CalendarError {
  /** Error code */
  code: 'INVALID_ICALENDAR' | 'MISSING_UID' | 'INVALID_DATES' | 'PARSE_ERROR' | string;
  /** Error message */
  message: string;
  /** Whether parsing can continue */
  recoverable: boolean;
}

/**
 * iCalendar property structure
 */
interface ICalProperty {
  name: string;
  value: string;
  params: Record<string, string>;
}

/**
 * Calendar Sync Executor - iCalendar event parsing and scheduling
 *
 * Implements RFC 5545 (Internet Calendaring and Scheduling Core Object
 * Specification) with support for event conflict detection and intelligent
 * time slot suggestions for meeting rescheduling.
 */
export class CalendarSyncExecutor implements INodeExecutor {
  readonly nodeType = 'calendar-sync';
  readonly category = 'email-integration';
  readonly description = 'Parse iCalendar invitations and detect scheduling conflicts';

  /**
   * Execute calendar sync and event parsing
   */
  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const config = node.parameters as CalendarSyncConfig;

      // Validate required parameters
      this._validateConfig(config);

      // Parse calendar event
      const result = this._parseCalendarEvent(config);

      const duration = Date.now() - startTime;

      if (result.errors.length > 0 && result.event === undefined) {
        // Critical parse errors - no event produced
        return {
          status: 'error',
          error: `Failed to parse calendar event: ${result.errors[0].message}`,
          errorCode: 'CALENDAR_PARSE_ERROR',
          output: {
            errors: result.errors,
            warnings: result.warnings,
            metrics: result.metrics
          },
          timestamp: Date.now(),
          duration
        };
      }

      // Perform conflict detection if event was parsed and enabled
      if (result.event && config.detectConflicts !== false && config.existingEvents) {
        result.conflicts = this._detectConflicts(result.event, config.existingEvents);
        result.metrics.conflictCount = result.conflicts?.length ?? 0;
      }

      // Suggest time slots if event was parsed and enabled
      if (result.event && config.suggestTimeSlots !== false) {
        result.suggestedSlots = this._suggestTimeSlots(
          result.event,
          config.existingEvents ?? [],
          config.suggestionHoursAhead ?? 7 * 24,
          config.suggestionSlotDuration ?? 60
        );
        result.metrics.suggestedSlotCount = result.suggestedSlots?.length ?? 0;
      }

      // Get user's RSVP status
      if (result.event) {
        result.userRsvpStatus = this._getUserRsvpStatus(result.event, config.userEmail);
      }

      return {
        status: result.errors.length === 0 ? 'success' : 'partial',
        output: result,
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        error: errorMsg,
        errorCode: 'CALENDAR_SYNC_ERROR',
        timestamp: Date.now(),
        duration
      };
    }
  }

  /**
   * Validate node parameters
   */
  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.emailBody) {
      errors.push('Email body is required');
    } else if (typeof node.parameters.emailBody !== 'string') {
      errors.push('Email body must be a string');
    }

    if (!node.parameters.userEmail) {
      errors.push('User email is required');
    } else if (!this._isValidEmail(node.parameters.userEmail)) {
      errors.push('User email is not valid');
    }

    if (!node.parameters.tenantId) {
      errors.push('Tenant ID is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate configuration
   */
  private _validateConfig(config: CalendarSyncConfig): void {
    if (!config.emailBody) {
      throw new Error('Calendar sync requires "emailBody" parameter');
    }

    if (!config.userEmail) {
      throw new Error('Calendar sync requires "userEmail" parameter');
    }

    if (!config.tenantId) {
      throw new Error('Calendar sync requires "tenantId" parameter');
    }
  }

  /**
   * Parse calendar event from email body
   */
  private _parseCalendarEvent(config: CalendarSyncConfig): CalendarSyncResult {
    const startTime = Date.now();
    const errors: CalendarError[] = [];
    const warnings: string[] = [];
    const metrics = {
      parseDurationMs: 0,
      attendeeCount: 0,
      hasRecurrence: false,
      conflictCount: 0,
      suggestedSlotCount: 0
    };

    try {
      // Extract iCalendar content
      const icalContent = this._extractICalendarContent(config.emailBody);
      if (!icalContent) {
        errors.push({
          code: 'INVALID_ICALENDAR',
          message: 'No iCalendar format data found in email body',
          recoverable: false
        });
        return { errors, warnings, metrics };
      }

      // Parse iCalendar lines
      const lines = this._parseICalendarLines(icalContent);
      const properties = this._extractProperties(lines);

      // Validate required properties
      const uid = properties.get('UID');
      if (!uid) {
        errors.push({
          code: 'MISSING_UID',
          message: 'Event UID is required',
          recoverable: false
        });
        return { errors, warnings, metrics };
      }

      // Extract event details
      const title = properties.get('SUMMARY') || 'Untitled Event';
      const description = properties.get('DESCRIPTION');
      const location = properties.get('LOCATION');
      const organizer = this._extractEmail(properties.get('ORGANIZER') || '');
      const organizerName = this._extractName(properties.get('ORGANIZER') || '');

      if (!organizer) {
        warnings.push('Organizer information is missing or invalid');
      }

      // Parse dates
      const dtstart = properties.get('DTSTART');
      const dtend = properties.get('DTEND');

      if (!dtstart || !dtend) {
        errors.push({
          code: 'INVALID_DATES',
          message: 'Event start and end dates are required',
          recoverable: false
        });
        return { errors, warnings, metrics };
      }

      const startTime_parsed = this._parseICalendarDate(dtstart);
      const endTime_parsed = this._parseICalendarDate(dtend);

      if (!startTime_parsed || !endTime_parsed) {
        errors.push({
          code: 'INVALID_DATES',
          message: 'Invalid date format in DTSTART or DTEND',
          recoverable: false
        });
        return { errors, warnings, metrics };
      }

      // Parse attendees
      const attendeeLines = lines.filter(l => l.startsWith('ATTENDEE'));
      const attendees = attendeeLines.map(line => this._parseAttendee(line));
      metrics.attendeeCount = attendees.length;

      // Parse other metadata
      const created = this._parseICalendarDate(properties.get('CREATED') || new Date().toISOString());
      const lastMod = this._parseICalendarDate(properties.get('LAST-MODIFIED') || new Date().toISOString());
      const sequence = parseInt(properties.get('SEQUENCE') || '0', 10);
      const status = (properties.get('STATUS') || 'TENTATIVE') as 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
      const transparency = (properties.get('TRANSP') || 'OPAQUE') as 'TRANSPARENT' | 'OPAQUE';
      const rrule = properties.get('RRULE');
      const categories = properties.get('CATEGORIES')?.split(',').map(c => c.trim()) || [];

      if (rrule) {
        metrics.hasRecurrence = true;
      }

      // Build event object
      const event: CalendarEvent = {
        eventId: uid,
        title,
        description,
        startTime: startTime_parsed,
        endTime: endTime_parsed,
        location,
        organizer,
        organizerName,
        attendees,
        recurrenceRule: rrule,
        createdAt: created,
        lastModified: lastMod,
        sequence,
        status,
        transparency,
        categories: categories.length > 0 ? categories : undefined
      };

      metrics.parseDurationMs = Date.now() - startTime;

      return {
        event,
        errors,
        warnings,
        metrics
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({
        code: 'PARSE_ERROR',
        message: errorMsg,
        recoverable: false
      });

      metrics.parseDurationMs = Date.now() - startTime;
      return { errors, warnings, metrics };
    }
  }

  /**
   * Extract iCalendar content from email body
   */
  private _extractICalendarContent(emailBody: string): string | null {
    // Look for BEGIN:VCALENDAR ... END:VCALENDAR
    const match = emailBody.match(/BEGIN:VCALENDAR[\s\S]*?END:VCALENDAR/i);
    if (match) {
      return match[0];
    }

    // If not found, assume entire body is iCalendar (for inline formats)
    if (emailBody.includes('BEGIN:VEVENT')) {
      return emailBody;
    }

    return null;
  }

  /**
   * Parse iCalendar lines handling line folding
   */
  private _parseICalendarLines(content: string): string[] {
    const lines: string[] = [];
    let currentLine = '';

    const contentLines = content.split(/\r?\n/);

    for (const line of contentLines) {
      if (line.match(/^[\s\t]/)) {
        // Continuation of previous line (line folding)
        currentLine += line.substring(1);
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = line;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Extract properties from iCalendar lines
   */
  private _extractProperties(lines: string[]): Map<string, string> {
    const properties = new Map<string, string>();

    for (const line of lines) {
      if (!line.includes(':')) continue;

      const [key, ...valueParts] = line.split(':');
      const propName = key.split(';')[0].toUpperCase();
      const value = valueParts.join(':');

      properties.set(propName, value);
    }

    return properties;
  }

  /**
   * Parse attendee line (ATTENDEE property)
   */
  private _parseAttendee(attendeeLine: string): EventAttendee {
    // ATTENDEE;CN="Name";ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:email@example.com
    const email = this._extractEmail(attendeeLine);
    const name = this._extractName(attendeeLine);
    const rsvpMatch = attendeeLine.match(/PARTSTAT=([A-Z-]+)/);
    const roleMatch = attendeeLine.match(/ROLE=([A-Z-]+)/);

    const rsvpStatus = (rsvpMatch?.[1] || 'NEEDS-ACTION') as EventAttendee['rsvpStatus'];
    const role = (roleMatch?.[1] || 'REQ-PARTICIPANT') as EventAttendee['role'];

    return {
      email,
      name,
      rsvpStatus,
      role,
      isRequired: role === 'REQ-PARTICIPANT' || role === 'CHAIR'
    };
  }

  /**
   * Extract email address from iCalendar property
   */
  private _extractEmail(value: string): string {
    // Handle mailto: prefix and angle brackets
    const emailMatch = value.match(/mailto:([^\s>;]+)/i) || value.match(/<([^>]+)>/) || value.match(/([^\s;]+@[^\s;]+)/);
    return emailMatch?.[1] || '';
  }

  /**
   * Extract display name from iCalendar property
   */
  private _extractName(value: string): string | undefined {
    const cnMatch = value.match(/CN=(?:"([^"]*)"|([^\s;]+))/i);
    return cnMatch?.[1] || cnMatch?.[2];
  }

  /**
   * Parse iCalendar date format (RFC 5545)
   */
  private _parseICalendarDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    try {
      // Format: YYYYMMDDTHHMMSSZ or YYYYMMDD or YYYYMMDDTHHMMSS±HHMM
      let date: Date | null = null;

      // Remove TZID parameter if present
      const cleanDate = dateStr.split(';').pop() || dateStr;

      if (cleanDate.match(/^\d{8}T\d{6}Z?$/)) {
        // DateTime format: YYYYMMDDTHHMMSSZ
        const year = parseInt(cleanDate.substring(0, 4), 10);
        const month = parseInt(cleanDate.substring(4, 6), 10) - 1;
        const day = parseInt(cleanDate.substring(6, 8), 10);
        const hour = parseInt(cleanDate.substring(9, 11), 10);
        const minute = parseInt(cleanDate.substring(11, 13), 10);
        const second = parseInt(cleanDate.substring(13, 15), 10);

        date = new Date(Date.UTC(year, month, day, hour, minute, second));
      } else if (cleanDate.match(/^\d{8}$/)) {
        // Date only: YYYYMMDD
        const year = parseInt(cleanDate.substring(0, 4), 10);
        const month = parseInt(cleanDate.substring(4, 6), 10) - 1;
        const day = parseInt(cleanDate.substring(6, 8), 10);

        date = new Date(Date.UTC(year, month, day, 0, 0, 0));
      }

      return date && !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  }

  /**
   * Detect time conflicts between new event and existing calendar
   */
  private _detectConflicts(newEvent: CalendarEvent, existingEvents: CalendarEvent[]): TimeConflict[] {
    const conflicts: TimeConflict[] = [];
    const newStart = new Date(newEvent.startTime).getTime();
    const newEnd = new Date(newEvent.endTime).getTime();

    for (const existing of existingEvents) {
      const existingStart = new Date(existing.startTime).getTime();
      const existingEnd = new Date(existing.endTime).getTime();

      // Check for overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        const overlapStart = Math.max(newStart, existingStart);
        const overlapEnd = Math.min(newEnd, existingEnd);
        const overlapMinutes = Math.round((overlapEnd - overlapStart) / 60000);

        const isFullOverlap = (newStart <= existingStart && newEnd >= existingEnd) ||
                             (existingStart <= newStart && existingEnd >= newEnd);

        conflicts.push({
          eventTitle: existing.title,
          conflictStartTime: new Date(overlapStart).toISOString(),
          conflictEndTime: new Date(overlapEnd).toISOString(),
          severity: isFullOverlap ? 'major' : 'minor',
          overlapMinutes
        });
      }
    }

    return conflicts;
  }

  /**
   * Suggest available time slots for rescheduling
   */
  private _suggestTimeSlots(
    event: CalendarEvent,
    existingEvents: CalendarEvent[],
    hoursAhead: number,
    slotDurationMinutes: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const eventDuration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
    const now = new Date();
    const searchEnd = new Date(now.getTime() + hoursAhead * 3600000);

    let slotStart = new Date(now);
    slotStart.setHours(9, 0, 0, 0); // Start at 9 AM

    while (slotStart < searchEnd) {
      const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60000);

      // Check availability
      const conflicts = this._getConflictingEvents(
        new Date(slotStart),
        new Date(slotEnd),
        existingEvents
      );

      const isAvailable = conflicts.length === 0;
      const availabilityScore = isAvailable ? 100 : Math.max(0, 100 - conflicts.length * 30);

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        availabilityScore,
        conflicts: conflicts.map(c => c.title),
        isAvailable
      });

      slotStart = new Date(slotStart.getTime() + slotDurationMinutes * 60000);

      // Skip to next day at 9 AM if after 6 PM
      if (slotStart.getHours() >= 18) {
        slotStart.setDate(slotStart.getDate() + 1);
        slotStart.setHours(9, 0, 0, 0);
      }
    }

    // Return top 5 slots with highest availability
    return slots.sort((a, b) => b.availabilityScore - a.availabilityScore).slice(0, 5);
  }

  /**
   * Get events conflicting with a time window
   */
  private _getConflictingEvents(
    slotStart: Date,
    slotEnd: Date,
    events: CalendarEvent[]
  ): CalendarEvent[] {
    const slotStartTime = slotStart.getTime();
    const slotEndTime = slotEnd.getTime();

    return events.filter(event => {
      const eventStart = new Date(event.startTime).getTime();
      const eventEnd = new Date(event.endTime).getTime();

      return slotStartTime < eventEnd && slotEndTime > eventStart;
    });
  }

  /**
   * Get user's RSVP status for the event
   */
  private _getUserRsvpStatus(
    event: CalendarEvent,
    userEmail: string
  ): 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NEEDS-ACTION' {
    const userAttendee = event.attendees.find(a => a.email.toLowerCase() === userEmail.toLowerCase());
    return userAttendee?.rsvpStatus || 'NEEDS-ACTION';
  }

  /**
   * Validate email address format
   */
  private _isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

/**
 * Export singleton executor instance
 */
export const calendarSyncExecutor = new CalendarSyncExecutor();
