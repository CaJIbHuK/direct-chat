import {Component, Input, OnInit} from "@angular/core";
import css from "./chatMembers.component.css!text";

@Component({
  selector : 'chat-members',
  template : `
      <ul>
          <li *ngFor="let member of members">{{member}}</li>
      </ul>

  `,
  styles : [css]
})
export class ChatMembersComponent implements OnInit {
  @Input() members : string[] = [];

  constructor() {}

  ngOnInit() : void {}
}