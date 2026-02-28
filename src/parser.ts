export class JsonParser{
  private input:string;
  private pos:number;
  constructor(input:string){
    this.input=input;
    this.pos=0;
  }
  static parse(input:string):unknown{
    const parser=new JsonParser(input.trim());
    const result=parser.parseValue();
    parser.skipWhitespace();
    if (parser.pos!==parser.input.length){
      throw new SyntaxError(
        `Unexpected character '${parser.current()}' at postion '${parser.pos}'`
      );
    }
    return result;
  }

  private current(): string {
    return this.input[this.pos];
  }

  private advance(): string{
    return this.input[this.pos++];
  }

  private expect(ch:string): void{
    if(this.current()!==ch){
      throw new SyntaxError(
        `Expected '${ch}' but got '${this.current}' at position '${this.pos}'`
      );
    }
    this.advance();
  }

  private isAtEnd(): boolean{
    return this.pos>=this.input.length;
  }
  private skipWhitespace(): void{
    while(!this.isAtEnd() && /[\s]/.test(this.current())){
      this.advance();
    }
  }
  
  private parseValue(): unknown{
    this.skipWhitespace();
    if(this.isAtEnd()){
      throw new SyntaxError("unexpected end of input");
    }
    const ch=this.current();
    if(ch==='"') return this.parseString();

    throw new SyntaxError(
      `Unexpected character '${ch}' at position ${this.pos}`
    );

  }

  private parseString(): string{
    this.expect('"');
    let result="";
    while(!this.isAtEnd() && this.current()!='"'){
      const ch=this.current();
      if(ch.charCodeAt(0)<=0x1f){
        throw new SyntaxError(
          `Unecaped control character at position ${this.pos}`
        )
      }
      if (ch==="\\"){
        result+=this.parseEscape();
      }else{
        result+=this.advance();
      }

      if(this.isAtEnd()){
        throw new SyntaxError("unterminated string");
      }
    }
    this.expect('"');
    return result;
  }

  private parseEscape(): string{
    this.advance();
    if(this.isAtEnd()){
      throw new SyntaxError("Unterminated string");
    }
    const ch=this.advance();
    switch(ch){
      case '"': return '"';
      case "\\": return "\\";
      case "/": return "/";
      case "b": return "\b";
      case "f": return "\f";
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "u": return this.parseUnicode();
      default:
        throw new SyntaxError(
          `Invalid escape character '\\${ch}' at position ${this.pos-1}`
        );
    }
  }

  private parseUnicode(): string{
    let hex="";
    for (let i=0;i<4;i++){
      if (this.isAtEnd()){
        throw new SyntaxError("Unterminated string");
      }
      const ch=this.current();
      if (!/[0-9a-fA-F]/.test(ch)){
        throw new SyntaxError(
          `Invalid unicode hex digit '${ch}'`
        );
      }
      hex+=this.advance();
    }
      return String.fromCharCode(parseInt(hex,16));
  }
}

