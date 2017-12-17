import {Inject, Injectable} from "@angular/core";


@Injectable()
export class SignalService {

  MESSAGE_TYPES = {
    LOGIN : 'login',
    LOGOUT : 'logout',
    OFFER : 'offer',
    ANSWER : 'answer',
    CANDIDATE : 'candidate',
    USERS : 'users'
  };

  url : string = 'ws://192.168.0.6:3000';
  connection : WebSocket;
  handlers = {};


  name : string = '';

  constructor() {
    this.connection = new WebSocket(this.url);
    this.handlers = {
      [this.MESSAGE_TYPES.LOGIN]: [],
      [this.MESSAGE_TYPES.LOGOUT]: [],
      [this.MESSAGE_TYPES.OFFER]: [],
      [this.MESSAGE_TYPES.ANSWER]: [],
      [this.MESSAGE_TYPES.CANDIDATE]: [],
      [this.MESSAGE_TYPES.USERS]: []
    };

    this.connection.onmessage = (message) => {
      let data = JSON.parse(message.data);
      this.handlers[data.type].map(handler => handler(data));
    }

  }

  addHandler(handler, messageType) {
    this.handlers[messageType].push(handler);
  }

  sendOffer(offer, peername) {
    this.send({
      offer: offer,
      peername: peername,
    }, this.MESSAGE_TYPES.OFFER);
  }

  sendAnswer(answer, peername) {
    this.send({
      answer: answer,
      peername: peername
    }, this.MESSAGE_TYPES.ANSWER);
  }

  sendLogin(name) {
    this.name = name;
    this.send({}, this.MESSAGE_TYPES.LOGIN);
  }

  sendLogout() {
    this.send({}, this.MESSAGE_TYPES.LOGOUT);
    this.name = '';
  }

  sendUsers() {
    this.send({}, this.MESSAGE_TYPES.USERS);
  }

  send(message : any, type) {
      message.name = this.name;
      message.type = type;
      this.connection.send(JSON.stringify(message));
  }


}