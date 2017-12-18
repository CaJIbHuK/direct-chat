import {Component, Inject, OnDestroy, OnInit, ChangeDetectorRef} from "@angular/core";
import css from "./chat.component.css!text";
import {SignalService} from "../../app/common/services/signalling.service";
import {AuthService} from "../../app/common/services/auth.service";

const ICE_SERVERS = [
  {"urls" : ["stun:stun.l.google.com:19302"]}];

class ChatMember {

  color : string;
  pc : RTCPeerConnection;
  dataChannel : any;

  constructor() {
    this.color = '#' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6);
  }
}

class Message {
  text : string;
  author : string;
  color : string;
  timestamp : number;
  sent : boolean;

  constructor(text, author, timestamp = null) {
    this.text = text;
    this.author = author;
    this.timestamp = timestamp || new Date().getTime();
    this.color = 'black';
    this.sent = false;
  }

  setColor(color) {
    this.color = color;
  }

  markAsSent() {
    this.sent = true;
  }

  static fromJSON(data) {
    let parsed = JSON.parse(data);
    return new Message(
      parsed.text,
      parsed.author,
      parsed.timestamp
    );
  }

  toJSON() {
    return JSON.stringify({
      text : this.text,
      author : this.author,
      timestamp : this.timestamp
    })
  }
}

class SystemLogger {

  SYSTEM_LOGS = {
    LOGIN: (name) => `User '${name}' is logged in`,
    LOGOUT: (name) => `User '${name}' is logged out`,
    CONNECTED: (name) => `You are connected as '${name}'`,
    FAILED_TO_CONNECT: () => `FAILED TO CONNECT`,
  };

  constructor(public name) {}

  formatLog(text: string) {
    return `~~~~~~~~${text}~~~~~~~~`;
  }

  createSystemMessage(text, color='black') {
    console.log(`SYSTEM LOG: ${text}`);
    let msg = new Message(text, this.name);
    msg.setColor(color);
    return msg;
  }

  LOGIN(name) {
    let text = this.formatLog(this.SYSTEM_LOGS.LOGIN(name));
    return this.createSystemMessage(text, 'green')
  }

  LOGOUT(name) {
    let text = this.formatLog(this.SYSTEM_LOGS.LOGOUT(name));
    return this.createSystemMessage(text, 'grey')
  }

  CONNECTED(name) {
    let text = this.formatLog(this.SYSTEM_LOGS.CONNECTED(name));
    return this.createSystemMessage(text, 'green')
  }

  FAILED_TO_CONNECT(name) {
    let text = this.formatLog(this.SYSTEM_LOGS.FAILED_TO_CONNECT());
    return this.createSystemMessage(text, 'red')
  }


}

@Component({
  selector : 'chat',
  template : `
      <navigation-bar></navigation-bar>
      <div id="chat-body">
          <div id="chat-members">
              <chat-members [members]="getMembers()"></chat-members>
          </div>
          <div id="chat-form">
              <chat-history [messages]="messages"></chat-history>
              <chat-input (onSendMessage)="send($event)"></chat-input>
          </div>
      </div>
  `,
  styles : [css]
})
export class ChatComponent implements OnInit {

  loading : boolean = false;
  systemLogger = new SystemLogger('SYSTEM');
  name : string;
  members : { [key : string] : ChatMember } = {};
  messages : Message[] = [];

  constructor(@Inject(SignalService) private signal : SignalService,
              @Inject(ChangeDetectorRef) private changes : ChangeDetectorRef,
              @Inject(AuthService) private auth : AuthService) {
  }

  ngOnInit() {
    return this.auth.getUser().then(user => user.name)
      .then(name => {
        this.name = name;
        this.initChat(name)
      });
  }

  ngOnDestroy() {
    Object.keys(this.members)
      .forEach(name => {
        this.members[name].dataChannel.close();
        this.members[name].pc.close();
      });
    this.members = {};
  }

  initChat(username : string) {
    let RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;

    // DETECT IF USER LOGOUT
    this.signal.addHandler((data) => {
      this.addToMessages(this.systemLogger.LOGOUT(data.name));
      let member = this.members[data.name];
      member.dataChannel.close();
      member.pc.close();
      delete this.members[data.name];
    }, this.signal.MESSAGE_TYPES.LOGOUT);


    // SEND OFFER TO OTHER USERS
    this.signal.addHandler((data) => {
      data.users.forEach(name => {
        if (name === username) return;

        let member = new ChatMember();
        member.pc = new RTCPeerConnection({'iceServers' : ICE_SERVERS});
        member.pc.onicecandidate = (event) => {
          if (!event.candidate) {
            this.signal.sendOffer(JSON.stringify(member.pc.localDescription), name);
          }
        };

        member.dataChannel = member.pc.createDataChannel('text-chat');
        member.dataChannel.onmessage = (event) => this.onMessage(event);

        this.signal.addHandler((data) => {
          member = this.members[data.name];
          member.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.answer)));
        }, this.signal.MESSAGE_TYPES.ANSWER);

        member.pc.createOffer()
          .then((desc : RTCSessionDescription) => {
            member.pc.setLocalDescription(desc);
          });

        this.members[name] = member;
      })
    }, this.signal.MESSAGE_TYPES.USERS);


  // ACCEPT OFFER AND ANSWER TO OTHER USERS
    this.signal.addHandler((data) => {
      let member = new ChatMember();
      member.pc = new RTCPeerConnection({'iceServers' : ICE_SERVERS});
      member.pc.oniceconnectionstatechange = (event) => {
        console.log(`Connection to user '${data.name}' status: ${member.pc.iceConnectionState}`);
      };
      member.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.offer)));

      member.pc.ondatachannel = (e) => {
        member.dataChannel = e.channel;
        member.dataChannel.onmessage = (event) => this.onMessage(event);
        member.dataChannel.onopen = (event) => this.addToMessages(this.systemLogger.LOGIN(data.name));
      };

      member.pc.createAnswer().then(desc => {
        member.pc.setLocalDescription(desc);
        this.signal.sendAnswer(JSON.stringify(desc), data.name);
      });

      this.members[data.name] = member;
    }, this.signal.MESSAGE_TYPES.OFFER);

    this.signal.sendUsers();
  }

  addToMessages(msg : Message) {
    this.messages.push(msg);
    this.messages.sort((m1, m2) => m1.timestamp - m2.timestamp);
    this.changes.detectChanges();
  }

  onMessage(event) {
    let msg = Message.fromJSON(event.data);
    msg.setColor(this.members[msg.author].color);
    this.addToMessages(msg);
  }

  send(message : string) : void {
    this.loading = true;
    let msg = new Message(message, this.name);
    this.addToMessages(msg);
    Object.keys(this.members)
      .forEach(name => {
        console.log(`Sending '${msg.text}'...`);
        this.members[name].dataChannel.send(msg.toJSON())
      });
    this.loading = false;
  }


  getMembers() {
    return Object.keys(this.members).filter(name => name !== this.name);
  }
}
