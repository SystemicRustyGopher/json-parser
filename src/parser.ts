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
    if(ch==='-' || (ch>='0' && ch<='9')) return this.parseInteger();
    if(ch==='t') return this.parseTrue();
    if(ch==='f') return this.parseFalse();
    if(ch==='n') return this.parseNull();
    if(ch==='[') return this.parseArray();
    if(ch==='{') return this.parseObject();


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

  private parseInteger(): number{
    let numStr="";
    if(this.current()==='-'){
      numStr+=this.advance();
    }
    if(this.isAtEnd()){
      throw new SyntaxError("Unexpected end of output");
    }
    if(this.current()==="0"){
      numStr+=this.advance();
      if(!this.isAtEnd() && /[0-9]/.test(this.current())){
        throw new SyntaxError("Leading zeros not expected");
      }
    }else if(/[1-9]/.test(this.current())){
      numStr+=this.advance()
      while(!this.isAtEnd() && /[0-9]/.test(this.current())){
        numStr+=this.advance();
      }
    }else{
      throw new SyntaxError(`Expected digit but got '${this.current()}' `);
    }

    if(!this.isAtEnd() && this.current()==="."){
      numStr+=this.advance();
      if(this.isAtEnd() || !/[0-9]/.test(this.current())){
        throw new SyntaxError("Expected digit after . at '${this.pos}'");
      }
       while(!this.isAtEnd() && /[0-9]/.test(this.current())){
        numStr+=this.advance();
       }

    }

    if(!this.isAtEnd() && (this.current()==="e" || this.current()==="E")){
      numStr+=this.advance();
      if(!this.isAtEnd() && (this.current()==="+" || this.current()==="-")){
        numStr+=this.advance();
      }
      if(this.isAtEnd() || !/[0-9]/.test(this.current())){
        throw new SyntaxError(
          `Expected digit in exponent at position ${this.pos}`
        );
      }

      while(!this.isAtEnd() && /[0-9]/.test(this.current())){
        numStr+=this.advance();
      }
    }

   

    return Number(numStr);
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

  private parseTrue(): boolean{
    this.expect("t");
    this.expect("r");
    this.expect("u");
    this.expect("e");
    return true;
  }

  private parseFalse(): boolean{
    this.expect("f");
    this.expect("a");
    this.expect("l");
    this.expect("s");
    this.expect("e");
    return false;
  }

  private parseNull(): null{
    this.expect("n");
    this.expect("u");
    this.expect("l");
    this.expect("l");
    return null;
  }

  private parseArray(): any[]{
    this.expect('[');
    if(!this.isAtEnd() && this.current()===']'){
    this.advance();
     return [];
    }
    const arr:any[]=[];
    arr.push(this.parseValue());
    this.skipWhitespace();
    while(!this.isAtEnd()){
      if(this.current()===']'){
        this.advance();
        return arr;
      }else if(this.current()===','){
        this.advance();
        this.skipWhitespace();
        if(!this.isAtEnd() && this.current()===']'){
          throw new SyntaxError("Trailing comma in array");
        }
        arr.push(this.parseValue());
        this.skipWhitespace();
      }else{
        throw new SyntaxError("Unexpected object found at '${this.pos()}'");
      }
      
      if(this.isAtEnd() && this.current()!==']'){
        throw new SyntaxError("Unexpected object found at '${this.pos()}'");
      }
    }
    throw new SyntaxError("unterminated array");
  }

  private parseKeyValue(obj: Record<string,unknown>): void{
    this.skipWhitespace();
    const key=this.parseString();
    this.skipWhitespace();
    this.expect(':');
    const value=(this.parseValue());
    obj[key]=value;
  }
  private parseObject(): object{
    this.expect('{');
    this.skipWhitespace();
    if(!this.isAtEnd() && this.current()==='}'){
      this.advance();
      return {};
    }
    const obj:Record<string,unknown>={}
    this.parseKeyValue(obj);
    this.skipWhitespace();

    while(!this.isAtEnd()){
      if(this.current()==='}'){
        this.advance();
        return obj;
      }else if(this.current()===','){
        this.advance();
        this.skipWhitespace();
        if(!this.isAtEnd() && this.current()==='}'){
          throw new SyntaxError("trailing comma in obj");
        }
        this.parseKeyValue(obj);
        this.skipWhitespace();
      }else{
        throw new SyntaxError("Unexpected obj");
      }
    }

        throw new SyntaxError("unterminated object");
  }
}

