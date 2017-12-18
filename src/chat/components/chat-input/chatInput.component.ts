import {Component, Inject, Input, Output, OnInit, EventEmitter} from "@angular/core";
import css from "./chatInput.component.css!text";

@Component({
  selector : 'chat-input',
  template : `<textarea id="chat-input" cols="30" placeholder="Enter message" [(ngModel)]="message"></textarea>
  <div id="chat-input-buttons">
      <button class="btn btn-primary" id="sendButton" (click)="send(message)">Send</button>
      <span *ngIf="file" id="fileInfo">{{file.name}}({{file.size | fileSize }})</span>
      <button *ngIf="file" type="button" class="btn btn-link"
              (click)="onRemoveFile($event)"><i
              class="fa fa-times" aria-hidden="true"></i></button>
      <input *ngIf="!file" type="file" class="form-control-file" id="inputFile" (change)="onFileAdd($event)">
  </div>
  `,
  styles : [css]
})
export class ChatInputComponent implements OnInit {
  @Output() onSendMessage = new EventEmitter();
  message = "";
  file : File = null;

  constructor() {
    window.onkeydown = (e) => {
      //enter - send message
      if (e.keyCode === 13) {
        this.send();
        e.preventDefault();
      }
    }
  }

  send() {
    if (this.message || this.file) {
      this.onSendMessage.emit({
        text : this.message,
        file : this.file
      });
      this.message = "";
      this.file = null;
    }
  }

  onRemoveFile(event) {
    this.file = null;
  }

  onFileAdd(event) {
    let files : FileList = event.target.files;
    if (files.length) {
      this.file = files[0];
    }
  }

}
