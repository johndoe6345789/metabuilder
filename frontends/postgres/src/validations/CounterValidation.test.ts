import { describe, expect, it } from 'vitest';
import { CounterValidation } from './CounterValidation';

describe('CounterValidation', () => {
  it('should accept valid increment values', () => {
    expect(CounterValidation.safeParse({ increment: 1 }).success).toBe(true);
    expect(CounterValidation.safeParse({ increment: 2 }).success).toBe(true);
    expect(CounterValidation.safeParse({ increment: 3 }).success).toBe(true);
  });

  it('should reject increment below 1', () => {
    const result = CounterValidation.safeParse({ increment: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject increment above 3', () => {
    const result = CounterValidation.safeParse({ increment: 4 });
    expect(result.success).toBe(false);
  });

  it('should reject negative increments', () => {
    const result = CounterValidation.safeParse({ increment: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject non-number increment', () => {
    const result = CounterValidation.safeParse({ increment: 'one' });
    expect(result.success).toBe(false);
  });

  it('should reject missing increment', () => {
    const result = CounterValidation.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should parse valid object and return the increment', () => {
    const result = CounterValidation.parse({ increment: 2 });
    expect(result.increment).toBe(2);
  });
});
