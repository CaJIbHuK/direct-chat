import {Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren} from "@angular/core";
import css from "./chatHistory.component.css!text";
import {FileMessage, Message, MessageType} from "../../messages";

@Component({
  selector : 'chat-history',
  template : `<div [ngStyle]="{'color': message.color}" class="message" *ngFor="let message of messages" [ngSwitch]="message.type">
    <span>[{{message.timestamp | date: 'dd-MM-yyyy HH:mm:ss'}}] {{message.author}}:</span>
    <span *ngSwitchCase="messageTypes.TEXT">{{message.text}}</span>
    <span *ngSwitchCase="messageTypes.FILE">
        <a (click)="downloadFile(message)" class="file-link" name="{{message.text}}">
            <i class="fa fa-file" aria-hidden="true"></i>{{message.text}}
            <span class="file-help">(click for download)</span>
            <div preloader *ngIf="message.isDownloading"></div>
        </a>
    </span>
</div>
  `,
  styles : [css]
})
export class ChatHistoryComponent {

  @Input() messages : Message[] = [];
  @Output() onDownloadFile = new EventEmitter();
  messageTypes = MessageType;

  constructor() {
  }

  downloadFile(message : FileMessage) {
    this.onDownloadFile.emit(message);
  }

}
