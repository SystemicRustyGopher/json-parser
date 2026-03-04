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

describe('Json number parsing', () => {
  it("parses zero",() =>{
    expect(JsonParser.parse("0")).toBe(0);
  });
  it("parses positive integers",() =>{
    expect(JsonParser.parse("420")).toBe(420);
    expect(JsonParser.parse("1234")).toBe(1234);
  });
  it("parses negative integers",() =>{
    expect(JsonParser.parse("-1")).toBe(-1);
  });
  it("parses negative zero",() =>{
    expect(JsonParser.parse("-0")).toBe(-0);
  })
  it("rejects leading zeros",() =>{
    expect(() => JsonParser.parse("01")).toThrow(SyntaxError);
  });
  it("rejects standalone minus",() =>{
    expect(() => JsonParser.parse("-")).toThrow(SyntaxError);
  });
  it("rejects plus prefix",() =>{
    expect(() => JsonParser.parse("+343")).toThrow(SyntaxError);
  });
});


describe('Json number parsing - fractions', () => {
  it("parses decimal numbers",() =>{
    expect(JsonParser.parse("3.14")).toBe(3.14);
    expect(JsonParser.parse("0.5")).toBe(0.5);
    expect(JsonParser.parse("-0.14")).toBe(-0.14);
  });
  it("rejects trailing dot",() =>{
    expect(() => JsonParser.parse("1.")).toThrow(SyntaxError);
  });
  it("rejects leading dot",() =>{
    expect(() => JsonParser.parse(".1")).toThrow(SyntaxError);
  });
});


describe('Json number parsing - exponents', () => {
  it("parses exponent notation",() =>{
    expect(JsonParser.parse("1e2")).toBe(100);
    expect( JsonParser.parse("1E2")).toBe(100);
    expect(JsonParser.parse("1e+2")).toBe(100);
    expect(JsonParser.parse("1e-2")).toBeCloseTo(0.01);
  });
  it("parses combined fraction and exponent",() =>{
    expect(JsonParser.parse("3.14e2")).toBe(314);
    expect(JsonParser.parse("-2.5e-1")).toBe(-0.25);
  });
  it("rejects exponents without digits",() =>{
    expect(() => JsonParser.parse("1e")).toThrow(SyntaxError);
    expect(() => JsonParser.parse("1e+")).toThrow(SyntaxError);
  });
});

describe('Json array parsing', () => {
  it("parses empty array",() =>{
    expect(JsonParser.parse("[]")).toEqual([]);
  });
  it("parses single element",() =>{
    expect(JsonParser.parse("[1]")).toEqual([1]);
  });
  it("parses multiple elements",() =>{
    expect(JsonParser.parse("[1,2,3]")).toEqual([1,2,3]);
  });
  it("parses mixed types",() =>{
        expect(JsonParser.parse('[1,"hello",null]')).toEqual([1,"hello",null]);
  });
  it("parses nested arrays",() =>{
        expect(JsonParser.parse("[[1,2],[3,4]]")).toEqual([[1,2],[3,4]]);
  });
  it("handles whitespace variations",() =>{
        expect(JsonParser.parse("[[1,  2],[3 ,4]]")).toEqual([[1,2],[3,4]]);
  });
   it("rejects trailing commans",() =>{
        expect(() => JsonParser.parse("[[1,  2],[3 ,4]],")).toThrow(SyntaxError);
  });
    it("rejects unclosed error",() =>{
        expect(() => JsonParser.parse("[[1,  2],[3 ,4]")).toThrow(SyntaxError);
  });
   it("rejects missing comma",() =>{
        expect(() => JsonParser.parse("[[1,  2][3 ,4]")).toThrow(SyntaxError);
  });
});

  describe('Json object parsing', () => {
  it("parses empty object",() =>{
    expect(JsonParser.parse("{}")).toEqual({});
  });
  it("parses single key",() =>{
    expect(JsonParser.parse('{"a":1}')).toEqual({a:1});
  });
  it("parses multiple keys",() =>{
    expect(JsonParser.parse('{"a":1,"b":2}')).toEqual({a:1,b:2});
  });
  it("parses mixed keys",() =>{
        expect(JsonParser.parse('{"a":1,"b":[2,3],"c":null}')).toEqual({a:1,b:[2,3],c:null});
  });
  it("parses nested objects",() =>{
        expect(JsonParser.parse('{"a":{"b":1}}')).toEqual({"a":{"b":1}});
  });
  it("handles whitespace variations",() =>{
        expect(JsonParser.parse('{"a"   :    1}')).toEqual({a:1});
  });
   it("rejects trailing commans",() =>{
        expect(() => JsonParser.parse('{"a":1},')).toThrow(SyntaxError);
  });
    it("rejects unclosed error",() =>{
        expect(() => JsonParser.parse('{"a":1')).toThrow(SyntaxError);
  });
   it("rejects missing comma",() =>{
        expect(() => JsonParser.parse('{"a":1}{"b":2}')).toThrow(SyntaxError);
  });
});