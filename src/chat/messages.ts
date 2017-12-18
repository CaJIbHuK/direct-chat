export enum MessageType {
  TEXT,
  FILE
}

export class Message {
  type : MessageType;
  text : string;
  author : string;
  color : string;
  timestamp : number;
  sent : boolean;

  constructor(text, author, type = MessageType.TEXT, timestamp = null) {
    this.text = text;
    this.author = author;
    this.timestamp = timestamp || new Date().getTime();
    this.color = 'black';
    this.sent = false;
    this.type = type;
  }

  setColor(color) {
    this.color = color;
  }

  markAsSent() {
    this.sent = true;
  }

  static fromJSON(parsed) {
    return new this(
      parsed.text,
      parsed.author,
      parsed.type,
      parsed.timestamp
    );
  }

  static parseMessage(data) {
    let parsed = JSON.parse(data);
    return {
      [MessageType.FILE] : FileMessage.fromJSON(parsed),
      [MessageType.TEXT] : TextMessage.fromJSON(parsed),
    }[parsed.type];
  }

  toJSON() {
    return JSON.stringify({
      text : this.text,
      author : this.author,
      type : this.type,
      timestamp : this.timestamp
    })
  }
}

export class TextMessage extends Message {

  constructor(text, author, timestamp : any = null) {
    super(text, author, MessageType.TEXT, timestamp);
  }

}

export class FileMessage extends Message {
  content : File;

  constructor(filename : string, content : File, author, timestamp : any = null) {
    super(filename, author, MessageType.FILE, timestamp);
    this.content = content;
  }

  static fromJSON(parsed) {
    return new FileMessage(
      parsed.text,
      null,
      parsed.author,
      parsed.timestamp);
  }

}
