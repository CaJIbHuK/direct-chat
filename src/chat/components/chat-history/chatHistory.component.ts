import {Component, Input} from "@angular/core";
import css from "./chatHistory.component.css!text";


@Component({
  selector : 'chat-history',
  template : `    
          <div [ngStyle]="{'color': message.color}" class="message" *ngFor="let message of messages">
              <span >[{{message.timestamp | date: 'dd-MM-yyyy HH:mm:ss'}}] {{message.author}}:</span>
              <span>{{message.text}}</span>
          </div>
  `,
  styles : [css]
})
export class ChatHistoryComponent {

  @Input() messages: string[] = [];

  constructor() {}

}