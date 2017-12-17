import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
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
  name : string;
  members : { [key : string] : ChatMember } = {};
  messages : Message[] = [];

  constructor(@Inject(SignalService) private signal : SignalService,
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
        this.members[name].pc.close();
        this.members[name].dataChannel.close();
      });
    this.members = {};
  }

  initChat(username : string) {
    let RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;
    this.signal.sendUsers();
    this.signal.addHandler((data) => {
      data.users.forEach(name => {
        if (name === username) return;

        let member = new ChatMember();
        member.pc = new RTCPeerConnection({'iceServers' : ICE_SERVERS});
        member.pc.oniceconnectionstatechange = (event) => {
          console.log(`Connection to user '${name}' status: ${member.pc.iceConnectionState}`);
        };

        member.pc.onicecandidate = (event) => {
          if (!event.candidate) {
            this.signal.sendOffer(JSON.stringify(member.pc.localDescription), name);
          }
        };

        member.dataChannel = member.pc.createDataChannel('text-chat');
        member.dataChannel.onmessage = (event) => this.onMessage(event);
        member.dataChannel.onopen = (event) => console.log(`OPENNED CHANNEL WITH ${data.name}`);
        member.pc.createOffer()
          .then((desc : RTCSessionDescription) => {
            member.pc.setLocalDescription(desc);
          });

        this.signal.addHandler((data) => {
          member = this.members[data.name];
          if (member.pc.iceConnectionState === 'connected') return;
          member.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.answer)));
        }, this.signal.MESSAGE_TYPES.ANSWER);

        this.members[name] = member;
        console.log(this.members);
      })
    }, this.signal.MESSAGE_TYPES.USERS);


    this.signal.addHandler((data) => {
      let member = new ChatMember();
      member.pc = new RTCPeerConnection({'iceServers' : ICE_SERVERS});
      member.pc.oniceconnectionstatechange = (event) => {
        console.log(`Connection to user '${data.name}' status: ${member.pc.iceConnectionState}`);
      };
      member.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.offer)));
      member.pc.createAnswer().then(desc => {
        member.pc.setLocalDescription(desc);
        this.signal.sendAnswer(JSON.stringify(desc), data.name);
      });

      member.pc.ondatachannel = (e) => {
        member.dataChannel = e.channel;
        member.dataChannel.onmessage = (event) => this.onMessage(event);
        member.dataChannel.onopen = (event) => console.log(`OPENNED CHANNEL WITH ${data.name}`);
      };


      this.members[data.name] = member;
    }, this.signal.MESSAGE_TYPES.OFFER);
  }

  onMessage(event) {
    let msg = Message.fromJSON(event.data);
    msg.markAsSent();
    msg.setColor(this.members[msg.author].color);
    this.messages.push(msg);
    this.messages.sort((m1, m2) => m1.timestamp - m2.timestamp);
  }

  send(message : string) : void {
    this.loading = true;
    let msg = new Message(message, this.name);
    this.messages.push(msg);
    Object.keys(this.members)
      .forEach(name => {
        console.log(`Sending '${msg.text}'...`);
        this.members[name].dataChannel.send(msg.toJSON())
      });
    this.loading = false;
    msg.markAsSent();
  }


  getMembers() {
    return Object.keys(this.members).filter(name => name !== this.name);
  }
}
