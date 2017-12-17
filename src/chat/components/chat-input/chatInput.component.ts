import {Component, Inject, Input, Output, OnInit, EventEmitter} from "@angular/core";
import css from "./chatInput.component.css!text";

@Component({
  selector : 'chat-input',
  template : `
      <textarea id="chat-input" cols="30" placeholder="Enter message" [(ngModel)]="message"></textarea>
      <div id="chat-input-buttons">
          <button class="btn btn-default" (click)="send(message)">Send</button>
          <input type="file" class="form-control-file" id="exampleInputFile" aria-describedby="fileHelp">
      </div>
  `,
  styles : [css]
})
export class ChatInputComponent implements OnInit {
  @Output() onSendMessage = new EventEmitter();
  message = "";

  constructor() {}

  send() {
    this.onSendMessage.emit(this.message);
    this.message = "";
  }

}
