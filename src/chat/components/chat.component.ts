import {Component, Inject, OnDestroy, OnInit, ChangeDetectorRef} from "@angular/core";
import css from "./chat.component.css!text";
import {SignalService} from "../../app/common/services/signalling.service";
import {AuthService} from "../../app/common/services/auth.service";
import {Message, TextMessage, FileMessage, MessageType} from "../messages"

const ICE_SERVERS = [
  {"urls" : ["stun:stun.l.google.com:19302"]}];

class MemberFile {
  name : string;
  content : ArrayBuffer[];
  size : number;
  type : string;

  constructor(name : string, content : ArrayBuffer[] | null, type : string) {
    this.name = name;
    this.content = content || [];
    this.type = type;
    this.size = 0;
  }
}


const CHANNEL_TYPES = {
  TEXT : "text-chat",
  FILE : "file"
};

class ChatMember {

  name : string;
  color : string;
  pc : RTCPeerConnection;
  channels : { [key : string] : any };
  files : { [key : string] : MemberFile };

  constructor(name : string) {
    this.name = name;
    this.color = '#' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6);
    this.files = {};
    this.channels = {};
  }

  createChannel(type) {
    this.channels[type] = this.pc.createDataChannel(type);
    return this.channels[type];
  }

  addChannel(channel) {
    this.channels[channel.label] = channel;
    return this.channels[channel.label];
  }

  getChannel(type) {
    return this.channels[type];
  }

  isChannelOfType(channel, type) {
    return this.getChannelType(channel) === type;
  }

  getChannelType(channel) {
    return channel.label;
  }

  addFile(file : MemberFile) {
    this.files[file.name] = file;
  }

  getFile(name : string) {
    return this.files[name];
  }

  send(message : Message) {
    this.getChannel(CHANNEL_TYPES.TEXT).send(message.toJSON());
  }

}

class MemberList {
  members : { [key : string] : ChatMember } = {};

  addMember(member : ChatMember) {
    this.members[member.name] = member;
  }

  getMember(name : string) {
    return this.members[name];
  }

  getAllMembers() {
    return this.getAllMembersNames().map(name => this.getMember(name));
  }

  getAllMembersNames() {
    return Object.keys(this.members);
  }

  removeMember(name) {
    let member = this.getMember(name);
    Object.keys(member.channels)
      .map(type => member.channels[type])
      .forEach(channel => channel.close());
    member.pc && member.pc.close();
    delete this.members[name];
  }

  reset() {
    this.getAllMembersNames().forEach(name => this.removeMember(name))
  }

}


class SystemLogger {

  SYSTEM_LOGS = {
    LOGIN : (name) => `User '${name}' is logged in`,
    LOGOUT : (name) => `User '${name}' is logged out`,
    CONNECTED : (name) => `You are connected as '${name}'`,
    FAILED_TO_CONNECT : () => `FAILED TO CONNECT`,
  };

  constructor(public name) {
  }

  formatLog(text : string) {
    return `~~~~~~~~${text}~~~~~~~~`;
  }

  createSystemMessage(text, color = 'black') {
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
              <chat-members [members]="members.getAllMembersNames()"></chat-members>
          </div>
          <div id="chat-form">
              <chat-history (onDownloadFile)="downloadFile($event)" [messages]="messages"></chat-history>
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
  members = new MemberList();
  messages : Message[] = [];
  files : {[key: string]: File} = {}; // my files

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
    this.members.reset();
  }

  initChat(username : string) {
    let RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;

    // DETECT IF USER LOGOUT
    this.signal.addHandler((data) => {
      this.addToMessages(this.systemLogger.LOGOUT(data.name));
      this.members.removeMember(data.name);
    }, this.signal.MESSAGE_TYPES.LOGOUT);


    // SEND OFFER TO OTHER USERS
    this.signal.addHandler((data) => {
      data.users.forEach(name => {
        if (name === username) return;

        let member = new ChatMember(name);
        this.members.addMember(member);
        member.pc = new RTCPeerConnection({'iceServers' : ICE_SERVERS});
        member.pc.onicecandidate = (event) => {
          if (!event.candidate) {
            this.signal.sendOffer(JSON.stringify(member.pc.localDescription), name);
          }
        };

        let textChannel = member.createChannel(CHANNEL_TYPES.TEXT);
        textChannel.onmessage = (event) => this.onMessage(event);

        member.pc.ondatachannel = (e) => {
          let channel = member.addChannel(e.channel);
          if (channel.label === CHANNEL_TYPES.FILE) {
            channel.onmessage = (event) => this.onFileRequest(event, channel);
          }
        };


        this.signal.addHandler((data) => {
          let member = this.members.getMember(data.name);
          member.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.answer)));
        }, this.signal.MESSAGE_TYPES.ANSWER);

        member.pc.createOffer()
          .then((desc : RTCSessionDescription) => {
            member.pc.setLocalDescription(desc);
          });

      })
    }, this.signal.MESSAGE_TYPES.USERS);


    // ACCEPT OFFER AND ANSWER TO OTHER USERS
    this.signal.addHandler((data) => {
      let member = new ChatMember(data.name);
      this.members.addMember(member);
      member.pc = new RTCPeerConnection({'iceServers' : ICE_SERVERS});
      member.pc.oniceconnectionstatechange = (event) => {
        console.log(`Connection to user '${data.name}' status: ${member.pc.iceConnectionState}`);
      };
      member.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.offer)));

      member.pc.ondatachannel = (e) => {
        let channel = member.addChannel(e.channel);
        switch (channel.label) {
          case CHANNEL_TYPES.TEXT:
            channel.onmessage = (event) => this.onMessage(event);
            channel.onopen = (event) => this.addToMessages(this.systemLogger.LOGIN(data.name));
            break;
          case CHANNEL_TYPES.FILE:
            channel.onmessage = (event) => this.onFileRequest(event, channel);
            break;
        }
      };

      member.pc.createAnswer().then(desc => {
        member.pc.setLocalDescription(desc);
        this.signal.sendAnswer(JSON.stringify(desc), data.name);
      });

    }, this.signal.MESSAGE_TYPES.OFFER);

    this.signal.getUsers();
  }

  addToMessages(msg : Message) {
    this.messages.push(msg);
    this.messages.sort((m1, m2) => m1.timestamp - m2.timestamp);
    this.changes.detectChanges();
  }

  onMessage(event) {
    let msg = Message.parseMessage(event.data);
    msg.setColor(this.members.getMember(msg.author).color);
    this.addToMessages(msg);
  }

  onFileRequest(event, channel) {
    let filename = JSON.parse(event.data).filename;
    let file = this.files[filename];
    let chunkSize = 16384;

    let sendChunk = (offset) => {
      let reader = new FileReader();
      reader.onload = (event) => {
        channel.send(event.target.result);
        if (file.size > offset + event.target.result.byteLength) {
          setTimeout(sendChunk, 0, offset + chunkSize);
        } else {
          channel.close();
        }
      };
      reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
    };
    sendChunk(0);
  }

  send(message : { text : string, file : File }) : void {
    let text = message.text;
    let file = message.file;
    this.loading = true;

    let messagesToSend : Message[] = [];
    text && messagesToSend.push(new TextMessage(text, this.name));
    file && messagesToSend.push(new FileMessage(file.name, file, this.name));
    file && (this.files[file.name] = file);

    for (let msg of messagesToSend) {
      this.addToMessages(msg);
      this.members.getAllMembers()
        .forEach(member => member.send(msg));
    }
    this.loading = false;
  }

  saveFile(name : string, data : Blob) {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display:none";
    let url = URL.createObjectURL(data,);
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadFile(message : FileMessage) {
    let fileToDownload = message.content;

    if (fileToDownload) {
      let reader = new window.FileReader();
      let slice = fileToDownload.slice(0, fileToDownload.size);
      reader.onload = (event) => {
        let data = new Blob([event.target.result], {type : fileToDownload.type});
        this.saveFile(message.text, data);
      };
      reader.readAsArrayBuffer(slice);
    } else {
      let fileOwner = this.members.getMember(message.author);
      fileOwner.addFile(new MemberFile(message.text, null, null));
      let channel = fileOwner.createChannel(CHANNEL_TYPES.FILE);
      channel.onmessage = (event) => {
        let file = fileOwner.getFile(message.text);
        file.content.push(event.data);
        file.size += event.data.byteLength;
      };
      channel.onopen = (event) => {
        message.isDownloading = true;
        channel.send(JSON.stringify({filename : message.text}));
        this.changes.detectChanges();
      };
      channel.onclose = (event) => {
        let file = fileOwner.getFile(message.text);
        this.saveFile(file.name, new Blob(file.content, file.type));
        message.isDownloading = false;
        this.changes.detectChanges();
      };
      channel.onerror = (event) => {
        console.log(`ErrOR`);
        message.isDownloading = false;
        this.changes.detectChanges();
      }

    }

  }
}
