class JsonParser{
    private String input;
    private int pos=0;
    String parseString(){
        expect('"');
        StringBuilder sb=new StringBuilder();
        while( peek() !='"'){
            char c=next();
            if (c=='\\'){
                sb.append(parseEscape());
            }else{
                sb.append(c);
            }
        }
        expect('"');
        return sb.toString();
    }
    char peek(){
        return input.charAt(pos);
    }
    char next(){
        return input.charAt(pos++);
    }
    void expect(char c){
        if(next()!=c) throw new RuntimeException("Expected:"+c);
    }
    char parseEscape(){
        char c=next();
        switch(c){
            case '"': return '"';
            case '\\': return '\\';
            case '/' :return '/';
            case 'b': return '\b';
            case 'f': return '\f';
            case 'n': return '\n';
            case 'r': return '\r';
            case 't': return '\t';
            default: throw new RuntimeException("Invalid escape:\\"+c);

        }
    }
    public static void main(String [] args){
    JsonParser p=new JsonParser();
    p.input="\"hello\"";
    p.pos=0;
    System.out.println(p.parseString());
}
}