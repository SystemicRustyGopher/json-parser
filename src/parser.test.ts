import { describe, it, expect } from 'vitest';
import { JsonParser } from './parser';

describe('JSON string parsing', () => {
  it('parses a simple string', () => {
    expect(JsonParser.parse('"hello"')).toBe('hello');
  });
   it('parses escape sequences', () => {
    expect(JsonParser.parse('""')).toBe("");
  });
   it('parses string with whitepace around the word', () => {
    expect(JsonParser.parse(' "hello"  ')).toBe('hello');
  });
   it('parses a simple string', () => {
    expect(JsonParser.parse('"hello\\nworld"')).toBe('hello\nworld');
    expect(JsonParser.parse('"tab\\there"')).toBe('tab\there');
    expect(JsonParser.parse('"back\\\\slash"')).toBe('back\\slash');
    expect(JsonParser.parse('"quote\\"here"')).toBe('quote"here');
    expect(JsonParser.parse('"slash\\/here"')).toBe('slash/here');

  });
   it('parses unicode escapes', () => {
    expect(JsonParser.parse('"\\u0041"')).toBe('A');
    expect(JsonParser.parse('"\\u00e9"')).toBe('é');
  });
   it('rejects unterminated strings', () => {
    expect(() => JsonParser.parse('"hello')).toThrow(SyntaxError);
  });
   it('rejects invalid escape sequences', () => {
    expect(() => JsonParser.parse('"hello\\x"')).toThrow(SyntaxError);
  });
   it('rejects unescaped control characters', () => {
    expect(()=> JsonParser.parse('"hello\nworld"')).toThrow(SyntaxError);
  });
   it('rejects trailing contents', () => {
    expect(()=> JsonParser.parse('"hello" "world"')).toThrow(SyntaxError);
  });
});
