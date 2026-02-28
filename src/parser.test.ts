import { describe, it, expect } from 'vitest';
import { parse } from './parser';

describe('JSON string parsing', () => {
  it('parses a simple string', () => {
    expect(parse('"hello"')).toBe('hello');
  });
});
